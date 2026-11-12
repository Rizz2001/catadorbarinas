'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatUsd, formatVes } from '@/lib/currency';

/**
 * Acción directa hacia Checkout sin validaciones de envío previas (sticky en móvil y tarjeta en desktop).
 */
export function CartCheckoutForm() {
  const items = useCartStore((state) => state.items);
  const totals = useCartTotals();

  if (items.length === 0) return null;

  return (
    <>
      <div className="hidden lg:block rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
        <Link
          href="/checkout"
          className="w-full min-h-[48px] px-5 rounded-full bg-catador-navy hover:bg-catador-blue text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          <span>Ir a pagar</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        <p className="text-xs text-slate-500 text-center">
          En el siguiente paso elegirás entrega o retiro y método de pago.
        </p>
      </div>

      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 shadow-[0_-6px_24px_-10px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0 tabular-nums">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</p>
            <p className="text-lg font-black text-slate-900 leading-tight">
              {formatUsd(totals.subtotalUsd)}
            </p>
            <p className="text-xs font-medium text-slate-500 truncate">
              {formatVes(totals.subtotalVes)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="shrink-0 min-h-[44px] px-6 rounded-full bg-catador-navy hover:bg-catador-blue text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <span>Ir a pagar</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </>
  );
}
