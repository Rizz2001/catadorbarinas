import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { RegisterForm } from '@/components/auth';
import { getStoreConfigServer } from '@/services/cms.server';
import { OFFICIAL_LOGO_ALT, resolveOfficialLogo } from '@/constants/config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crear Cuenta | EL CATADOR. Barinas',
  description:
    'Regístrate en EL CATADOR. Barinas para realizar pedidos rápidos, seguimiento en vivo y pagos en línea.',
};

export default async function RegisterPage() {
  const storeConfig = await getStoreConfigServer();
  const logoUrl = resolveOfficialLogo(storeConfig?.logo_url);

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-xl space-y-5">
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
                alt={OFFICIAL_LOGO_ALT}
                fill
                sizes="112px"
                className="object-contain p-1.5"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Crea tu cuenta en EL CATADOR.
            </h1>
            <p className="text-[13px] text-slate-600">
              Compra por unidad o caja con delivery GPS en Barinas
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-center p-4">Cargando formulario...</div>}>
            <RegisterForm />
          </Suspense>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5}/>
            <span>Tus datos están protegidos bajo estricta confidencialidad</span>
          </div>
        </div>
      </div>
    </main>
  );
}
