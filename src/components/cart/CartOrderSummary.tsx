'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';

export function CartOrderSummary() {
  const { items } = useCartStore();
  const totals = useCartTotals();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);

  const deliveryQuote = useMemo(() => {
    return calculateSmartDeliveryQuote({
      items,
      subtotalUsd: totals.subtotalUsd,
      deliveryType: 'delivery',
      storeConfig,
    });
  }, [items, totals.subtotalUsd, storeConfig]);

  const totalConDeliveryUsd = Number((totals.subtotalUsd + deliveryQuote.shippingUsd).toFixed(2));
  const totalConDeliveryVes = Number((totals.subtotalVes + convertUsdToVes(deliveryQuote.shippingUsd, bcvRate)).toFixed(2));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 space-y-5">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Resumen de la Orden
      </h3>

      {/* Desglose de Totales */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal de productos:</span>
          <span className="font-bold text-slate-800">
            {formatUsd(totals.subtotalUsd)} / {formatVes(totals.subtotalVes)}
          </span>
        </div>

        {totals.discountUsd > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Descuentos aplicados:</span>
            <span className="font-bold">
              -{formatUsd(totals.discountUsd)} / -{formatVes(totals.discountVes)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-catador-blue" />
            <span>Delivery en Barinas ({deliveryQuote.tierBadge}):</span>
          </div>
          <span className="font-bold text-catador-blue">
            {formatUsd(deliveryQuote.shippingUsd)} / {formatVes(convertUsdToVes(deliveryQuote.shippingUsd, bcvRate))}
          </span>
        </div>

        {/* Total Final Bimonetario */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <span className="text-sm font-extrabold text-slate-900">Total a Pagar:</span>
          <div className="text-right">
            <p className="text-xl font-black text-catador-blue leading-tight">
              {formatUsd(totalConDeliveryUsd)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {formatVes(totalConDeliveryVes)}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de Tasa Oficial BCV */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="h-3.5 w-3.5 text-catador-blue" />
          <span>Tasa Oficial BCV:</span>
        </div>
        <span className="font-extrabold text-catador-blue">
          Bs. {bcvRate.toFixed(2)} / $
        </span>
      </div>

      {/* Garantías y Seguridad */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Precios oficiales sincronizados con inventario real de Bodegón.</span>
      </div>
    </div>
  );
}
