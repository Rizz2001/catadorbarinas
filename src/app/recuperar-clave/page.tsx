import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Gran Catador Barinas',
  description: 'Recupera el acceso a tu cuenta de Gran Catador Barinas ingresando tu correo electrónico.',
};

export default function RecuperarClavePage() {
  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-catador-blue text-white font-black text-lg shadow-2xs mb-2">
              GC
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Recuperar Contraseña
            </h1>
            <p className="text-xs text-slate-500">
              Ingresa el correo electrónico asociado a tu cuenta para enviarte las instrucciones
            </p>
          </div>

          <PasswordResetRequestForm />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verificación Segura • Gran Catador Barinas</span>
          </div>
        </div>
      </div>
    </main>
  );
}

