'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCartUserLocation } from '@/hooks/useCartUserLocation';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes } from '@/lib/currency';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';

/**
 * Calcula cotización de delivery GPS y total bimonetario final compartido
 * entre el resumen de la orden y la barra sticky de pago en /carrito.
 */
export function useCartOrderQuote(fetchProfileOnMount: boolean = true) {
  const hydrated = useIsHydrated();
  const rawItems = useCartStore((state) => state.items);
  const items = useMemo(() => (hydrated ? rawItems : []), [hydrated, rawItems]);
  const totals = useCartTotals();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const locationState = useCartUserLocation(fetchProfileOnMount);

  const deliveryQuote = useMemo(() => {
    return calculateSmartDeliveryQuote({
      items,
      subtotalUsd: totals.subtotalUsd,
      deliveryType: hydrated ? locationState.userLocation.deliveryType : 'delivery',
      userLat: hydrated ? locationState.userLocation.latitud : null,
      userLng: hydrated ? locationState.userLocation.longitud : null,
      zonaBarinas: hydrated ? locationState.userLocation.zonaBarinas : undefined,
      storeConfig,
    });
  }, [
    hydrated,
    items,
    totals.subtotalUsd,
    locationState.userLocation.deliveryType,
    locationState.userLocation.latitud,
    locationState.userLocation.longitud,
    locationState.userLocation.zonaBarinas,
    storeConfig,
  ]);

  const totalConDeliveryUsd = Number((totals.subtotalUsd + deliveryQuote.shippingUsd).toFixed(2));
  const totalConDeliveryVes = Number(
    (totals.subtotalVes + convertUsdToVes(deliveryQuote.shippingUsd, bcvRate)).toFixed(2)
  );

  return {
    items,
    totals,
    bcvRate,
    deliveryQuote,
    totalConDeliveryUsd,
    totalConDeliveryVes,
    ...locationState,
  };
}

