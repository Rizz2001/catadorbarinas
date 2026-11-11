'use client';

import { useCartOrderQuote } from '@/hooks/useCartOrderQuote';
import { CartDeliveryAddressBox } from './CartDeliveryAddressBox';
import { CartPriceSummaryRows } from './CartPriceSummaryRows';

export function CartOrderSummary() {
  const {
    totals,
    bcvRate,
    deliveryQuote,
    totalConDeliveryUsd,
    totalConDeliveryVes,
    isAuthenticated,
    profileAddress,
    userLocation,
  } = useCartOrderQuote(true);

  const deliveryLabel =
    userLocation.deliveryType === 'pickup'
      ? 'Retiro Pick-Up'
      : `Delivery (${deliveryQuote.tierBadge}${userLocation.latitud ? ` · ${deliveryQuote.distanceKm} km` : ''})`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 sm:p-5 space-y-4">
      <h3 className="text-[15px] sm:text-base font-black text-slate-900 border-b border-gray-100 pb-2.5">
        Resumen de la Orden
      </h3>

      <CartDeliveryAddressBox
        isAuthenticated={isAuthenticated}
        profileAddress={profileAddress}
        variant="page"
      />

      <CartPriceSummaryRows
        subtotalUsd={totals.subtotalUsd}
        subtotalVes={totals.subtotalVes}
        discountUsd={totals.discountUsd}
        discountVes={totals.discountVes}
        deliveryLabel={deliveryLabel}
        shippingUsd={deliveryQuote.shippingUsd}
        bcvRate={bcvRate}
        totalUsd={totalConDeliveryUsd}
        totalVes={totalConDeliveryVes}
      />
    </div>
  );
}
