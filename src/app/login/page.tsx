import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth';
import { createClientForServer } from '@/lib/supabase/server';
import { getStoreConfigServer } from '@/services/cms.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | EL CATADOR. Barinas',
  description: 'Inicia sesión en tu cuenta de EL CATADOR. para acceder a tus pedidos y seguimiento en vivo.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTarget = params.redirect || '';

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

  const storeConfig = await getStoreConfigServer();
  const logoUrl = storeConfig?.logo_url || '/logo-catador.svg';

  return (
    <main className="container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-5">
        <Link
          href="/"
          replace
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-extrabold text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5}/> Volver a la tienda
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-2">
            <div className="relative mx-auto h-14 w-28 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-2 flex items-center justify-center overflow-hidden">
              <Image
                src={logoUrl}
                alt={storeConfig?.nombre_tienda || 'EL CATADOR.'}
                fill
                sizes="112px"
                className="object-contain p-1.5"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-[13px] text-slate-600">
              Ingresa tus credenciales para continuar con tu pedido en Barinas
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-center p-4">Cargando formulario...</div>}>
            <LoginForm />
          </Suspense>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5}/>
            <span>Plataforma Segura · EL CATADOR. Barinas</span>
          </div>
        </div>
      </div>
    </main>
  );
}
