import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BCV_RATE } from '@/lib/currency';
import { BcvRateInfo } from '@/types';

interface BcvStoreState {
  rateInfo: BcvRateInfo;
  isLoading: boolean;
  error: string | null;
  fetchRate: (force?: boolean) => Promise<void>;
  setRate: (rate: number, source?: 'BCV' | 'Oficial') => void;
}

export const useBcvStore = create<BcvStoreState>()(
  persist(
    (set, get) => ({
      rateInfo: {
        rate: DEFAULT_BCV_RATE,
        lastUpdated: new Date().toISOString(),
        source: 'BCV',
        changePercentage: 0,
      },
      isLoading: false,
      error: null,

      fetchRate: async (force = false) => {
        const { rateInfo, isLoading } = get();
        if (isLoading) return;

        // Si ya se consultó en los últimos 30 minutos y la tasa no es la fallback inicial, evitar request redundante
        const lastUpdatedMs = new Date(rateInfo.lastUpdated).getTime();
        const nowMs = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        const isFresh = Number.isFinite(lastUpdatedMs) && nowMs - lastUpdatedMs < thirtyMinutes;

        if (!force && isFresh && rateInfo.rate > 0 && rateInfo.rate !== DEFAULT_BCV_RATE) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const res = await fetch('/api/bcv');
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data: BcvRateInfo = await res.json();
          if (data && typeof data.rate === 'number' && data.rate > 0) {
            set({
              rateInfo: {
                rate: data.rate,
                lastUpdated: data.lastUpdated || new Date().toISOString(),
                source: data.source || 'BCV',
                changePercentage: data.changePercentage ?? 0,
              },
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error('Error al sincronizar tasa BCV desde DolarApi:', err);
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Error al obtener tasa BCV',
          });
        }
      },

      setRate: (rate: number, source = 'BCV') =>
        set((state) => ({
          rateInfo: {
            ...state.rateInfo,
            rate,
            lastUpdated: new Date().toISOString(),
            source,
          },
        })),
    }),
    {
      name: 'gran-catador-bcv',
    }
  )
);
