'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MapPin, CreditCard, Lock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export function CartCheckoutForm() {
  const { items } = useCartStore();

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Checkout 100% en Línea
      </h3>

      <div className="space-y-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-catador-blue shrink-0" />
          <span>Entrega a Domicilio en Barinas o Retiro en Bodegón</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-catador-amber shrink-0" />
          <span>Pago Móvil en Bs. BCV, Zelle o Efectivo Divisas</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Seguimiento y Chat en Vivo con el Administrador</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light p-3.5 text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.99]"
      >
        <span>Proceder al Pago en Línea</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="h-3 w-3" />
        <span>Pago seguro dentro de la plataforma</span>
      </div>
    </div>
  );
}
