import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_BCV_RATE } from '@/lib/currency';
import { BcvRateInfo } from '@/types';

interface BcvStoreState {
  rateInfo: BcvRateInfo;
  setRate: (rate: number, source?: 'BCV' | 'Oficial') => void;
  isLoading: boolean;
}

export const useBcvStore = create<BcvStoreState>()(
  persist(
    (set) => ({
      rateInfo: {
        rate: DEFAULT_BCV_RATE,
        lastUpdated: new Date().toISOString(),
        source: 'BCV',
        changePercentage: 0.25,
      },
      isLoading: false,
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
