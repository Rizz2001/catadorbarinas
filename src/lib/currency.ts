import type { CartItem, CartTotals, DualPriceResult, StoreConfig } from '../types';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from './inventory';

/**
 * Tasa BCV de respaldo oficial en caso de desconexión o fallo de API
 */
export const DEFAULT_BCV_RATE = 886.23;

/**
 * Formatea un número al estándar monetario estadounidense:
 * - Coma (,) para separador de miles.
 * - Punto (.) para separador de decimales.
 * Ej: 1250.5 -> "$1,250.50"
 */
export function formatUsd(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formatea un número al estándar monetario venezolano (VES):
 * - Punto (.) para separador de miles.
 * - Coma (,) para separador de decimales.
 * - Prefijo "Bs. "
 * Ej: 1250.5 -> "Bs. 1.250,50"
 */
export function formatVes(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return `Bs. ${formatted}`;
}

/**
 * Convierte un precio en USD a Bolívares (VES) usando la tasa BCV proporcionada
 */
export function convertUsdToVes(priceUsd: number, bcvRate: number = DEFAULT_BCV_RATE): number {
  const safeUsd = Number.isFinite(priceUsd) ? priceUsd : 0;
  const safeRate = Number.isFinite(bcvRate) && bcvRate > 0 ? bcvRate : DEFAULT_BCV_RATE;
  return Number((safeUsd * safeRate).toFixed(2));
}

/**
 * HELPER UNIVERSAL OBLIGATORIO: formatPrices
 *
 * Devuelve un objeto completo con el desglose dual en USD y Bs. (VES)
 * garantizando la regla de oro de bimonetarismo de Gran Catador.
 *
 * @param priceUsd Precio en dólares
 * @param bcvRate Tasa oficial del Banco Central de Venezuela
 */
export function formatPrices(
  priceUsd: number,
  bcvRate: number = DEFAULT_BCV_RATE
): DualPriceResult {
  const safeRate = Number.isFinite(bcvRate) && bcvRate > 0 ? bcvRate : DEFAULT_BCV_RATE;
  const priceVes = convertUsdToVes(priceUsd, safeRate);

  return {
    usdFormatted: formatUsd(priceUsd),
    vesFormatted: formatVes(priceVes),
    priceUsd,
    priceVes,
    bcvRate: safeRate,
  };
}

/**
 * Separa la cadena USD formateada en parte entera (con separadores de miles) y decimales.
 * Evita partir erróneamente montos >= $1,000 como "$1,294.00".
 */
export function splitUsdParts(usdFormatted: string): {
  intPart: string;
  decPart: string;
} {
  const cleaned = usdFormatted.replace(/[^0-9.,]/g, '');
  const dotIndex = cleaned.lastIndexOf('.');
  if (dotIndex === -1) {
    return { intPart: cleaned || '0', decPart: '00' };
  }
  return {
    intPart: cleaned.slice(0, dotIndex) || '0',
    decPart: cleaned.slice(dotIndex + 1).padEnd(2, '0').slice(0, 2),
  };
}

/**
 * Fuente única de verdad para calcular subtotales, ahorros y envío del carrito
 * respetando la modalidad real ('unidad' vs 'caja') de cada ítem.
 */
export function calculateCartTotals(
  items: CartItem[],
  bcvRate: number = DEFAULT_BCV_RATE,
  storeConfig?: Partial<StoreConfig> | null
): CartTotals {
  let subtotalUsd = 0;
  let discountUsd = 0;
  let itemCount = 0;

  items.forEach(({ product, quantity, purchaseMode }) => {
    const mode = purchaseMode || 'unidad';
    const effectivePrice = getEffectivePriceUsd(product, mode);
    subtotalUsd += effectivePrice * quantity;
    itemCount += quantity;

    const units = getUnitsPerPurchaseMode(product, mode);
    const regularTotalPerItem = (product.originalPriceUsd || product.priceUsd) * units;
    if (regularTotalPerItem > effectivePrice) {
      discountUsd += (regularTotalPerItem - effectivePrice) * quantity;
    }
  });

  const freeThreshold = storeConfig?.delivery_gratis_minimo_usd ?? 30.0;
  const baseShipping = storeConfig?.delivery_base_usd ?? 2.0;
  const shippingUsd = subtotalUsd >= freeThreshold || subtotalUsd === 0 ? 0 : baseShipping;
  const totalUsd = subtotalUsd + shippingUsd;

  const safeRate = Number.isFinite(bcvRate) && bcvRate > 0 ? bcvRate : DEFAULT_BCV_RATE;

  return {
    subtotalUsd: Number(subtotalUsd.toFixed(2)),
    subtotalVes: convertUsdToVes(subtotalUsd, safeRate),
    discountUsd: Number(discountUsd.toFixed(2)),
    discountVes: convertUsdToVes(discountUsd, safeRate),
    shippingUsd: Number(shippingUsd.toFixed(2)),
    shippingVes: convertUsdToVes(shippingUsd, safeRate),
    totalUsd: Number(totalUsd.toFixed(2)),
    totalVes: convertUsdToVes(totalUsd, safeRate),
    itemCount,
  };
}
