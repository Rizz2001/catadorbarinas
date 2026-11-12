'use client';

import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { CartPriceSummaryRows } from './CartPriceSummaryRows';

/**
 * Resumen financiero limpio del carrito: únicamente costo de productos, ahorro y total BCV.
 */
export function CartOrderSummary() {
  const items = useCartStore((state) => state.items);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const totals = useCartTotals();

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 sm:p-5 space-y-4">
      <h3 className="text-[15px] sm:text-base font-black text-slate-900 border-b border-gray-100 pb-2.5">
        Resumen de la Orden
      </h3>

      <CartPriceSummaryRows
        subtotalUsd={totals.subtotalUsd}
        subtotalVes={totals.subtotalVes}
        discountUsd={totals.discountUsd}
        discountVes={totals.discountVes}
        bcvRate={bcvRate}
        totalUsd={totals.subtotalUsd}
        totalVes={totals.subtotalVes}
      />
    </div>
  );
}
