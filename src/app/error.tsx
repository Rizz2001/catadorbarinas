'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface StoreErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StoreError({ error, reset }: StoreErrorProps) {
  return (
    <main className="min-h-[65vh] w-full bg-[#F7F8FA] flex items-center justify-center px-4 py-14">
      <section className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-[#E07A1F]">
          <AlertTriangle className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
            Hubo un problema al cargar esta sección
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Es posible que la conexión con el inventario haya tardado más de lo esperado. Intenta recargar esta sección en un toque.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-400">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] px-5 py-2.5 text-sm font-extrabold text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            Reintentar
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors"
          >
            <Home className="h-4 w-4" strokeWidth={1.5} />
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

