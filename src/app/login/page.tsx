import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth';
import { createClientForServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Gran Catador Barinas',
  description: 'Inicia sesión en tu cuenta de Gran Catador para acceder a tus pedidos y seguimiento en vivo.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTarget = params.redirect || '';

  // Verificación de sesión en servidor: Si ya está autenticado, no mostrar formulario
  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (redirectTarget && redirectTarget.startsWith('/')) {
        redirect(redirectTarget);
      }

      const { data: perfil } = (await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()) as { data: { rol?: string } | null };

      if (perfil?.rol === 'admin') {
        redirect('/admin/pedidos');
      }

      redirect('/cuenta');
    }
  } catch (err: unknown) {
    // Relanzar la excepción interna de redirección de Next.js
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          replace
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-catador-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a la tienda
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-catador-blue text-white font-black text-lg shadow-2xs mb-2">
              GC
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500">
              Ingresa tus credenciales para acceder a tu cuenta o panel de operaciones
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-center p-4">Cargando formulario...</div>}>
            <LoginForm />
          </Suspense>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Plataforma Segura • Gran Catador Barinas</span>
          </div>
        </div>
      </div>
    </main>
  );
}
