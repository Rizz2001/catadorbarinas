'use client';

import { Truck, Clock } from 'lucide-react';
import { useCartOrderQuote } from '@/hooks/useCartOrderQuote';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { CartDeliveryAddressBox } from './CartDeliveryAddressBox';

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

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 sm:p-5 space-y-3.5 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
        <h3 className="text-[15px] sm:text-base font-black text-slate-900">Resumen de la Orden</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-catador-amber-soft border border-catador-amber-oak/70 px-2.5 py-1 text-[11px] font-black text-[#8B3E03] tabular-nums">
          <Clock className="h-3 w-3" />
          BCV: Bs. {bcvRate.toFixed(2)}
        </span>
      </div>

      <CartDeliveryAddressBox
        isAuthenticated={isAuthenticated}
        profileAddress={profileAddress}
        variant="page"
      />

      <div className="space-y-2.5 text-[13px] tabular-nums">
        <div className="flex justify-between text-slate-600">
          <span>Costo de productos</span>
          <span className="font-bold text-slate-900">
            {formatUsd(totals.subtotalUsd)} / {formatVes(totals.subtotalVes)}
          </span>
        </div>

        {totals.discountUsd > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span className="font-bold">Ahorro</span>
            <span className="font-black">
              -{formatUsd(totals.discountUsd)} / -{formatVes(totals.discountVes)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-catador-blue shrink-0" />
            <span>
              {userLocation.deliveryType === 'pickup'
                ? 'Retiro Pick-Up'
                : `Delivery (${deliveryQuote.tierBadge}${userLocation.latitud ? ` · ${deliveryQuote.distanceKm} km` : ''})`}
            </span>
          </div>
          <span className="font-bold text-slate-900">
            {deliveryQuote.shippingUsd === 0
              ? 'Gratis'
              : `${formatUsd(deliveryQuote.shippingUsd)} / ${formatVes(convertUsdToVes(deliveryQuote.shippingUsd, bcvRate))}`}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <span className="text-sm font-black text-slate-900">Total a Pagar</span>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 leading-tight">
              {formatUsd(totalConDeliveryUsd)}
            </p>
            <p className="text-xs font-extrabold text-catador-blue mt-0.5">
              {formatVes(totalConDeliveryVes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
