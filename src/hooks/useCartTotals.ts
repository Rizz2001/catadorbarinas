'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { CartTotals } from '@/types';

/**
 * Custom Hook que calcula los totales bimonetarios del carrito
 * utilizando useMemo para evitar renderizados infinitos en selectores Zustand.
 */
export function useCartTotals(): CartTotals {
  const items = useCartStore((state) => state.items);
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const storeConfig = useStoreConfigStore((state) => state.config);

  return useMemo(() => {
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

    const freeThreshold = storeConfig?.delivery_gratis_minimo_usd ?? 30.0;
    const baseShipping = storeConfig?.delivery_base_usd ?? 2.0;
    const shippingUsd = subtotalUsd >= freeThreshold || subtotalUsd === 0 ? 0 : baseShipping;
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
  }, [items, bcvRate, storeConfig]);
}
