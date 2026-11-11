'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { calculateCartTotals, DEFAULT_BCV_RATE } from '@/lib/currency';
import { CartTotals } from '@/types';

/**
 * Custom Hook que calcula los totales bimonetarios del carrito
 * respetando la modalidad real ('unidad' vs 'caja') de cada ítem.
 */
export function useCartTotals(): CartTotals {
  const hydrated = useIsHydrated();
  const items = useCartStore((state) => state.items);
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const storeConfig = useStoreConfigStore((state) => state.config);

  return useMemo(
    () => calculateCartTotals(hydrated ? items : [], bcvRate, storeConfig),
    [hydrated, items, bcvRate, storeConfig]
  );
}
