'use client';

import Link from 'next/link';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useCartOrderQuote } from '@/hooks/useCartOrderQuote';
import { formatUsd, formatVes } from '@/lib/currency';

export function CartCheckoutForm() {
  const { items, totalConDeliveryUsd, totalConDeliveryVes, isAuthenticated } =
    useCartOrderQuote(true);

  if (items.length === 0) return null;

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 sm:p-5 space-y-3">
        {isAuthenticated ? (
          <>
            <Link
              href="/checkout"
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark p-3.5 text-sm font-extrabold text-white transition-all active:scale-[0.99]"
            >
              <span>Ir a pagar</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-slate-500 text-center font-medium">
              Pago Móvil · Zelle · Transferencia · Efectivo USD
            </p>
          </>
        ) : (
          <div className="space-y-2.5">
            <div className="rounded-xl bg-catador-amber-soft border border-catador-amber-oak/60 p-3 text-xs text-[#8B3E03]">
              <p className="font-extrabold">Inicia sesión para finalizar tu pedido</p>
              <p className="text-[11px] mt-0.5">
                Tu carrito y dirección se mantendrán guardados automáticamente.
              </p>
            </div>
            <Link
              href="/registro?redirect=/checkout"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-4 py-2.5 text-xs font-extrabold text-white transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Crear mi Cuenta y Comprar</span>
            </Link>
            <Link
              href="/login?redirect=/checkout"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full border border-catador-blue bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-catador-blue transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Ya tengo cuenta · Iniciar Sesión</span>
            </Link>
          </div>
        )}
      </div>

      {/* Barra sticky móvil en zona del pulgar justo encima del BottomNav */}
      <div className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] inset-x-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur-md px-3.5 py-2.5 shadow-[0_-6px_20px_-6px_rgba(15,23,42,0.12)]">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          <div className="min-w-0 tabular-nums">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 leading-none">
              Total
            </p>
            <p className="text-base font-black text-slate-900 leading-tight mt-0.5">
              {formatUsd(totalConDeliveryUsd)}
            </p>
            <p className="text-[11px] font-bold text-catador-blue leading-tight truncate">
              {formatVes(totalConDeliveryVes)}
            </p>
          </div>

          <Link
            href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
            className="min-h-[44px] h-11 shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-5 text-sm font-extrabold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <span>{isAuthenticated ? 'Ir a pagar' : 'Entrar y pagar'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
