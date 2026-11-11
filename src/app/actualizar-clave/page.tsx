import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PasswordUpdateForm } from '@/components/auth/PasswordUpdateForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Establecer Nueva Contraseña | EL CATADOR.',
  description: 'Actualiza tu contraseña para recuperar el acceso seguro a tu cuenta.',
};

export default function ActualizarClavePage() {
  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-catador-blue text-white font-black text-lg shadow-2xs mb-2">
              EC
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Nueva Contraseña
            </h1>
            <p className="text-xs text-slate-600">
              Crea una contraseña segura de al menos 6 caracteres para tu cuenta
            </p>
          </div>

          <PasswordUpdateForm />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encriptación Segura · EL CATADOR. Barinas</span>
          </div>
        </div>
      </div>
    </main>
  );
}

