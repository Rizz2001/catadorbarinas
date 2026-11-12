'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CartPriceSummaryRows } from './CartPriceSummaryRows';

interface CartDrawerFooterProps {
  totals: {
    subtotalUsd: number;
    subtotalVes: number;
    discountUsd: number;
    discountVes: number;
  };
  bcvRate: number;
  onCloseCart: () => void;
}

/**
 * Pie fijo (sticky) del cajón del carrito: muestra solo costos de productos y redirige directo a /checkout.
 */
export function CartDrawerFooter({
  totals,
  bcvRate,
  onCloseCart,
}: CartDrawerFooterProps) {
  return (
    <div className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-4 py-3.5 sm:px-5 sm:py-4 space-y-3.5 shadow-[0_-6px_24px_-10px_rgba(15,23,42,0.1)]">
      <CartPriceSummaryRows
        subtotalUsd={totals.subtotalUsd}
        subtotalVes={totals.subtotalVes}
        discountUsd={totals.discountUsd}
        discountVes={totals.discountVes}
        bcvRate={bcvRate}
        totalUsd={totals.subtotalUsd}
        totalVes={totals.subtotalVes}
      />

      <Link
        href="/checkout"
        onClick={onCloseCart}
        className="w-full min-h-[48px] px-5 rounded-full bg-catador-navy hover:bg-catador-blue text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
      >
        <span>Ir a pagar</span>
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
}
