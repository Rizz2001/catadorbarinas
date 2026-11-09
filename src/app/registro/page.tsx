import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { RegisterForm } from '@/components/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crear Cuenta | Gran Catador Barinas',
  description:
    'Regístrate en Gran Catador Barinas para realizar pedidos rápidos, seguimiento en vivo y pagos en línea.',
};

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg space-y-5">
        <Link
          href="/"
          replace
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a la tienda
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-catador-blue text-white font-black text-lg shadow-2xs mb-1">
              GC
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Crear Cuenta en Gran Catador
            </h1>
            <p className="text-xs text-slate-500">
              Completa tus datos personales y de contacto para tus compras en Barinas
            </p>
          </div>

          <Suspense
            fallback={<div className="text-xs text-center p-4">Cargando formulario...</div>}
          >
            <RegisterForm />
          </Suspense>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tus datos están protegidos bajo estricta confidencialidad</span>
          </div>
        </div>
      </div>
    </main>
  );
}
