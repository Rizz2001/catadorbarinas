import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartTotals, Product } from '@/types';
import { convertUsdToVes, DEFAULT_BCV_RATE } from '@/lib/currency';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  notes: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          return {
            items: [...state.items, { product, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setNotes: (notes: string) => set({ notes }),

      getTotalItemsCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotals: (bcvRate = DEFAULT_BCV_RATE): CartTotals => {
        const { items } = get();

        let subtotalUsd = 0;
        let discountUsd = 0;
        let itemCount = 0;

        items.forEach(({ product, quantity }) => {
          const unitPrice = product.priceUsd;
          subtotalUsd += unitPrice * quantity;
          itemCount += quantity;

          if (product.originalPriceUsd && product.originalPriceUsd > unitPrice) {
            discountUsd += (product.originalPriceUsd - unitPrice) * quantity;
          }
        });

        const shippingUsd = subtotalUsd > 30 || subtotalUsd === 0 ? 0 : 2.0;
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
