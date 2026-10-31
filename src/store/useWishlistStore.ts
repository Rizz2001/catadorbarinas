import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
  toggleFavorite: (product: Product) => boolean;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorite: (product: Product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== product.id),
          }));
          return false;
        }
        set((state) => ({
          items: [product, ...state.items],
        }));
        return true;
      },

      removeFavorite: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: 'gran-catador-wishlist',
    }
  )
);

