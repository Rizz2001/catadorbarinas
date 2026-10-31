import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartTotals, Product, PurchaseMode } from '@/types';
import { convertUsdToVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import {
  getDefaultPurchaseMode,
  getEffectivePriceUsd,
  getMaxAllowedQuantity,
  getUnitsPerPurchaseMode,
  validateStockAddition,
} from '@/lib/inventory';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  notes: string;
  lastStockWarning: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearStockWarning: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    purchaseMode?: PurchaseMode,
    openDrawer?: boolean
  ) => { added: boolean; message?: string };
  removeItem: (productId: string, purchaseMode?: PurchaseMode) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    purchaseMode?: PurchaseMode
  ) => void;
  clearCart: () => void;
  setNotes: (notes: string) => void;
  getTotals: (bcvRate?: number) => CartTotals;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      notes: '',
      lastStockWarning: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false, lastStockWarning: null }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearStockWarning: () => set({ lastStockWarning: null }),

      addItem: (
        product: Product,
        quantity = 1,
        purchaseMode?: PurchaseMode,
        openDrawer = true
      ) => {
        const mode: PurchaseMode = purchaseMode || getDefaultPurchaseMode(product);
        const currentItems = get().items;
        const validation = validateStockAddition(
          product,
          mode,
          quantity,
          currentItems
        );

        if (!validation.allowed || validation.allowedQuantityToAdd <= 0) {
          set({
            lastStockWarning:
              validation.message ||
              `Stock insuficiente para ${product.name} (${product.stockQuantity} unidades disponibles).`,
          });
          return { added: false, message: validation.message };
        }

        const qtyToAdd = validation.allowedQuantityToAdd;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              (item.purchaseMode || 'unidad') === mode
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              product,
              purchaseMode: mode,
              quantity: updatedItems[existingIndex].quantity + qtyToAdd,
            };
            return {
              items: updatedItems,
              isOpen: openDrawer ? true : state.isOpen,
              lastStockWarning: validation.message || null,
            };
          }

          return {
            items: [
              ...state.items,
              { product, quantity: qtyToAdd, purchaseMode: mode },
            ],
            isOpen: openDrawer ? true : state.isOpen,
            lastStockWarning: validation.message || null,
          };
        });

        return { added: true, message: validation.message };
      },

      removeItem: (productId: string, purchaseMode?: PurchaseMode) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (item.product.id !== productId) return true;
            if (!purchaseMode) return false;
            return (item.purchaseMode || 'unidad') !== purchaseMode;
          }),
          lastStockWarning: null,
        }));
      },

      updateQuantity: (
        productId: string,
        quantity: number,
        purchaseMode?: PurchaseMode
      ) => {
        if (quantity <= 0) {
          get().removeItem(productId, purchaseMode);
          return;
        }

        set((state) => {
          let warning: string | null = null;
          const updatedItems = state.items.map((item) => {
            const itemMode = item.purchaseMode || 'unidad';
            const matches =
              item.product.id === productId &&
              (!purchaseMode || itemMode === purchaseMode);

            if (!matches) return item;

            const maxAllowed = getMaxAllowedQuantity(
              item.product,
              itemMode,
              state.items
            );
            const finalQty = Math.min(quantity, Math.max(1, maxAllowed));

            if (quantity > maxAllowed && !item.product.allowBackorder) {
              const unitsPerBox = getUnitsPerPurchaseMode(item.product, 'caja');
              warning =
                itemMode === 'caja'
                  ? `Stock máximo: ${maxAllowed} ${
                      maxAllowed === 1 ? 'caja' : 'cajas'
                    } (${item.product.stockQuantity} botellas en inventario, ${unitsPerBox} por caja).`
                  : `Stock máximo disponible en inventario: ${maxAllowed} unidades.`;
            }

            return { ...item, quantity: finalQty };
          });

          return { items: updatedItems, lastStockWarning: warning };
        });
      },

      clearCart: () => set({ items: [], lastStockWarning: null }),

      setNotes: (notes: string) => set({ notes }),

      getTotalItemsCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotals: (bcvRate = DEFAULT_BCV_RATE): CartTotals => {
        const { items } = get();

        let subtotalUsd = 0;
        let discountUsd = 0;
        let itemCount = 0;

        items.forEach(({ product, quantity, purchaseMode }) => {
          const mode = purchaseMode || 'unidad';
          const effectivePrice = getEffectivePriceUsd(product, mode);
          subtotalUsd += effectivePrice * quantity;
          itemCount += quantity;

          const units = getUnitsPerPurchaseMode(product, mode);
          const regularTotalPerItem =
            (product.originalPriceUsd || product.priceUsd) * units;

          if (regularTotalPerItem > effectivePrice) {
            discountUsd += (regularTotalPerItem - effectivePrice) * quantity;
          }
        });

        const shippingUsd = subtotalUsd >= 30 || subtotalUsd === 0 ? 0 : 2.0;
        const totalUsd = subtotalUsd + shippingUsd;

        const subtotalVes = convertUsdToVes(subtotalUsd, bcvRate);
        const discountVes = convertUsdToVes(discountUsd, bcvRate);
        const shippingVes = convertUsdToVes(shippingUsd, bcvRate);
        const totalVes = convertUsdToVes(totalUsd, bcvRate);

        return {
          subtotalUsd: Number(subtotalUsd.toFixed(2)),
          subtotalVes,
          discountUsd: Number(discountUsd.toFixed(2)),
          discountVes,
          shippingUsd: Number(shippingUsd.toFixed(2)),
          shippingVes,
          totalUsd: Number(totalUsd.toFixed(2)),
          totalVes,
          itemCount,
        };
      },
    }),
    {
      name: 'gran-catador-cart',
      partialize: (state) => ({ items: state.items, notes: state.notes }),
    }
  )
);
