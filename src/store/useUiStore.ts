import { create } from 'zustand';

interface UiState {
  isMobileMenuOpen: boolean;
  isCategoryMenuOpen: boolean;
  isSearchModalOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openCategoryMenu: () => void;
  closeCategoryMenu: () => void;
  toggleCategoryMenu: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileMenuOpen: false,
  isCategoryMenuOpen: false,
  isSearchModalOpen: false,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openCategoryMenu: () => set({ isCategoryMenuOpen: true }),
  closeCategoryMenu: () => set({ isCategoryMenuOpen: false }),
  toggleCategoryMenu: () => set((state) => ({ isCategoryMenuOpen: !state.isCategoryMenuOpen })),

  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
}));
