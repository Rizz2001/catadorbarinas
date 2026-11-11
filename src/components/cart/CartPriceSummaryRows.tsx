'use client';

import { Truck } from 'lucide-react';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';

interface CartPriceSummaryRowsProps {
  subtotalUsd: number;
  subtotalVes: number;
  discountUsd: number;
  discountVes: number;
  deliveryLabel: string;
  shippingUsd: number;
  bcvRate: number;
  totalUsd: number;
  totalVes: number;
}

/**
 * Jerarquía limpia y bimonetaria compartida entre CartDrawerFooter y CartOrderSummary.
 */
export function CartPriceSummaryRows({
  subtotalUsd,
  subtotalVes,
  discountUsd,
  discountVes,
  deliveryLabel,
  shippingUsd,
  bcvRate,
  totalUsd,
  totalVes,
}: CartPriceSummaryRowsProps) {
  return (
    <div className="space-y-3 tabular-nums">
      <div className="space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-2">
          <span>Productos</span>
          <span className="font-medium text-slate-900">
            {formatUsd(subtotalUsd)}
            <span className="text-xs text-slate-400 ml-1.5 font-normal">
              ({formatVes(subtotalVes)})
            </span>
          </span>
        </div>

        {discountUsd > 0 && (
          <div className="flex items-center justify-between gap-2 text-emerald-600">
            <span>Ahorro aplicado</span>
            <span className="font-semibold">-{formatUsd(discountUsd)}</span>
            <span className="sr-only">(-{formatVes(discountVes)})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{deliveryLabel}</span>
          </span>
          <span
            className={
              shippingUsd === 0 ? 'font-semibold text-emerald-600' : 'font-medium text-slate-900'
            }
          >
            {shippingUsd === 0 ? (
              'Gratis'
            ) : (
              <>
                {formatUsd(shippingUsd)}
                <span className="text-xs text-slate-400 ml-1.5 font-normal">
                  ({formatVes(convertUsdToVes(shippingUsd, bcvRate))})
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-baseline justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Total
          </span>
          <span className="text-xs text-slate-500">
            {formatVes(totalVes)} · Tasa BCV: Bs. {bcvRate.toFixed(2)}
          </span>
        </div>
        <p className="text-2xl font-black tracking-tight text-slate-900 leading-none shrink-0">
          {formatUsd(totalUsd)}
        </p>
      </div>
    </div>
  );
}
