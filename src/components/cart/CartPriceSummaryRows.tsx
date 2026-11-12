'use client';

import { Truck } from 'lucide-react';
import { formatUsd, formatVes } from '@/lib/currency';

interface CartPriceSummaryRowsProps {
  subtotalUsd: number;
  subtotalVes: number;
  discountUsd?: number;
  discountVes?: number;
  deliveryLabel?: string;
  shippingUsd?: number;
  bcvRate: number;
  totalUsd: number;
  totalVes: number;
}

/**
 * Desglose financiero bimonetario compartido entre Carrito (sin envío) y Checkout (con envío).
 */
export function CartPriceSummaryRows({
  subtotalUsd,
  subtotalVes,
  discountUsd = 0,
  discountVes = 0,
  deliveryLabel,
  shippingUsd,
  bcvRate,
  totalUsd,
  totalVes,
}: CartPriceSummaryRowsProps) {
  const showDeliveryRow = deliveryLabel !== undefined && shippingUsd !== undefined;

  return (
    <div className="space-y-3 tabular-nums">
      <div className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-slate-600">Costo de productos</span>
          <div className="text-right">
            <span className="font-bold text-slate-900">{formatUsd(subtotalUsd)}</span>{' '}
            <span className="text-xs text-slate-400">({formatVes(subtotalVes)})</span>
          </div>
        </div>

        {discountUsd > 0 && (
          <div className="flex items-baseline justify-between gap-2 text-emerald-700">
            <span className="font-medium">Ahorro aplicado</span>
            <div className="text-right font-semibold">
              <span>-{formatUsd(discountUsd)}</span>{' '}
              <span className="text-xs opacity-80">(-{formatVes(discountVes)})</span>
            </div>
          </div>
        )}

        {showDeliveryRow && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-slate-600 min-w-0">
              <Truck className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{deliveryLabel}</span>
            </span>
            <div className="text-right shrink-0">
              {shippingUsd === 0 ? (
                <span className="font-bold text-emerald-700">Gratis</span>
              ) : (
                <>
                  <span className="font-bold text-slate-900">{formatUsd(shippingUsd)}</span>{' '}
                  <span className="text-xs text-slate-400">
                    ({formatVes(shippingUsd * bcvRate)})
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900">TOTAL</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{formatVes(totalVes)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">
            {formatUsd(totalUsd)}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Tasa Oficial BCV</p>
        </div>
      </div>
    </div>
  );
}
