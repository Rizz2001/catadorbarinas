'use client';

import Link from 'next/link';
import { UserCheck, ShieldCheck, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { formatUsd, formatVes } from '@/lib/currency';

interface CheckoutAuthGateProps {
  itemCount: number;
  subtotalUsd: number;
  subtotalVes: number;
}

export function CheckoutAuthGate({
  itemCount,
  subtotalUsd,
  subtotalVes,
}: CheckoutAuthGateProps) {
  return (
    <main className="container mx-auto px-4 py-10 md:py-16 max-w-lg">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-catador-amber-soft border border-catador-amber-oak/60 text-catador-blue">
          <UserCheck className="h-7 w-7" strokeWidth={1.5}/>
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-catador-amber-soft border border-catador-amber-oak/60 px-3 py-1 text-xs font-extrabold text-[#8B3E03]">
            Autenticación Requerida
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Regístrate o inicia sesión
          </h1>
          <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
            Debes estar autenticado para confirmar tu delivery GPS en Barinas y acceder al chat en vivo.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F8FA] border border-slate-200 p-4 text-left space-y-2 tabular-nums">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Carrito guardado ({itemCount} artículos)</span>
            <span className="text-slate-900 font-black">{formatUsd(subtotalUsd)}</span>
          </div>
          <p className="text-xs font-bold text-catador-blue">
            Equivalente BCV: {formatVes(subtotalVes)}
          </p>
          <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
            <span>Volverás automáticamente a finalizar tu compra.</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <Link
            href="/login?redirect=/checkout"
            className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark py-3 px-5 text-sm font-extrabold text-white transition-colors"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.5}/>
            <span>Iniciar sesión</span>
          </Link>

          <Link
            href="/registro?redirect=/checkout"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-[#F7F8FA] hover:bg-slate-100 py-2.5 px-5 text-sm font-extrabold text-slate-800 transition-colors"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.5}/>
            <span>Crear cuenta nueva</span>
          </Link>
        </div>

        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5}/> Cancelar y volver al carrito
        </Link>
      </div>
    </main>
  );
}
