'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-catador-blue/10 text-catador-blue">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800">
            Requisito Obligatorio de Compra
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Regístrate o Inicia Sesión para Comprar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Por seguridad y para brindarte seguimiento en vivo de tu despacho y soporte directo con administración, todas las compras requieren una cuenta registrada.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Tu carrito está guardado ({itemCount} artículos):</span>
            <span className="text-catador-blue font-black">{formatUsd(subtotalUsd)}</span>
          </div>
          <p className="text-[11px] font-mono font-semibold text-slate-500">
            Equivalente BCV: {formatVes(subtotalVes)}
          </p>
          <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Al iniciar sesión volverás automáticamente a finalizar tu compra.</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/registro?redirect=/checkout"
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light py-3.5 px-5 text-sm font-extrabold text-white shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Crear mi Cuenta Rápida</span>
          </Link>

          <Link
            href="/login?redirect=/checkout"
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl border-2 border-catador-blue bg-white hover:bg-blue-50 py-3 px-5 text-sm font-extrabold text-catador-blue transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Ya tengo cuenta • Iniciar Sesión</span>
          </Link>
        </div>

        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a mi Carrito
        </Link>
      </div>
    </main>
  );
}

