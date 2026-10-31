import { CartItem, Product, PurchaseMode, SaleMode } from '@/types';

/**
 * Devuelve el modo de compra inicial permitido según la configuración del artículo.
 */
export function getDefaultPurchaseMode(product: Product): PurchaseMode {
  if (product.saleMode === 'solo_caja') return 'caja';
  return 'unidad';
}

export function canBuyUnit(product: Product): boolean {
  return (product.saleMode || 'ambos') !== 'solo_caja';
}

export function canBuyBox(product: Product): boolean {
  return (product.saleMode || 'ambos') !== 'solo_unidad';
}

/**
 * Devuelve cuántas unidades base de inventario consume 1 ítem en la modalidad elegida.
 */
export function getUnitsPerPurchaseMode(
  product: Product,
  mode: PurchaseMode = 'unidad'
): number {
  if (mode === 'caja') {
    return Math.max(2, Math.floor(product.unitsPerBox || 12));
  }
  return 1;
}

/**
 * Devuelve el precio unitario en USD según la modalidad elegida ('unidad' o 'caja').
 */
export function getEffectivePriceUsd(
  product: Product,
  mode: PurchaseMode = 'unidad'
): number {
  if (mode === 'caja') {
    const units = getUnitsPerPurchaseMode(product, 'caja');
    if (product.boxPriceUsd && product.boxPriceUsd > 0) {
      return Number(product.boxPriceUsd.toFixed(2));
    }
    return Number((product.priceUsd * units).toFixed(2));
  }
  return product.priceUsd;
}

/**
 * Calcula cuántas unidades base del mismo producto están ya comprometidas en el carrito.
 */
export function getCommittedBaseUnits(
  items: CartItem[],
  productId: string,
  excludeMode?: PurchaseMode
): number {
  return items.reduce((sum, item) => {
    if (item.product.id !== productId) return sum;
    const itemMode = item.purchaseMode || 'unidad';
    if (excludeMode && itemMode === excludeMode) return sum;
    return sum + item.quantity * getUnitsPerPurchaseMode(item.product, itemMode);
  }, 0);
}

/**
 * Calcula la cantidad máxima que se puede tener en el carrito para un producto y modalidad
 * sin superar jamás el stock real en unidades base (a menos que tenga venta sin stock activa).
 */
export function getMaxAllowedQuantity(
  product: Product,
  mode: PurchaseMode = 'unidad',
  currentCartItems: CartItem[] = []
): number {
  const saleMode: SaleMode = product.saleMode || 'ambos';
  if (saleMode === 'solo_unidad' && mode === 'caja') return 0;
  if (saleMode === 'solo_caja' && mode === 'unidad') return 0;

  if (product.allowBackorder) {
    return 999;
  }

  const totalStockUnits = Math.max(0, Math.floor(product.stockQuantity || 0));
  const committedByOtherMode = getCommittedBaseUnits(
    currentCartItems,
    product.id,
    mode
  );
  const availableBaseUnits = Math.max(0, totalStockUnits - committedByOtherMode);
  const unitsPerItem = getUnitsPerPurchaseMode(product, mode);

  return Math.floor(availableBaseUnits / unitsPerItem);
}

/**
 * Valida si es posible agregar `quantityToAdd` de `(product, mode)` al carrito actual.
 */
export function validateStockAddition(
  product: Product,
  mode: PurchaseMode,
  quantityToAdd: number,
  currentCartItems: CartItem[]
): {
  allowed: boolean;
  allowedQuantityToAdd: number;
  maxTotalForMode: number;
  availableUnitsTotal: number;
  requiredUnits: number;
  message?: string;
} {
  const unitsPerItem = getUnitsPerPurchaseMode(product, mode);
  const existingItem = currentCartItems.find(
    (i) => i.product.id === product.id && (i.purchaseMode || 'unidad') === mode
  );
  const currentModeQty = existingItem ? existingItem.quantity : 0;
  const maxTotalForMode = getMaxAllowedQuantity(product, mode, currentCartItems);
  const availableToAdd = Math.max(0, maxTotalForMode - currentModeQty);
  const totalStockUnits = Math.max(0, Math.floor(product.stockQuantity || 0));
  const requiredUnits = (currentModeQty + quantityToAdd) * unitsPerItem;

  if (product.allowBackorder) {
    return {
      allowed: true,
      allowedQuantityToAdd: quantityToAdd,
      maxTotalForMode: 999,
      availableUnitsTotal: totalStockUnits,
      requiredUnits,
    };
  }

  if (availableToAdd <= 0) {
    const label = mode === 'caja' ? `caja (${unitsPerItem} und)` : 'unidad';
    return {
      allowed: false,
      allowedQuantityToAdd: 0,
      maxTotalForMode,
      availableUnitsTotal: totalStockUnits,
      requiredUnits,
      message:
        totalStockUnits < unitsPerItem && mode === 'caja'
          ? `Stock insuficiente para 1 ${label}. Solo quedan ${totalStockUnits} unidades en inventario.`
          : `Has alcanzado el tope disponible en inventario (${totalStockUnits} unidades).`,
    };
  }

  if (quantityToAdd > availableToAdd) {
    return {
      allowed: true,
      allowedQuantityToAdd: availableToAdd,
      maxTotalForMode,
      availableUnitsTotal: totalStockUnits,
      requiredUnits: (currentModeQty + availableToAdd) * unitsPerItem,
      message: `Ajustado al máximo disponible en inventario (${maxTotalForMode} ${
        mode === 'caja' ? 'cajas' : 'unidades'
      } = ${totalStockUnits} botellas/und).`,
    };
  }

  return {
    allowed: true,
    allowedQuantityToAdd: quantityToAdd,
    maxTotalForMode,
    availableUnitsTotal: totalStockUnits,
    requiredUnits,
  };
}

