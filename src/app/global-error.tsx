'use client';

import { AlertOctagon, RotateCcw } from 'lucide-react';
import './globals.css';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-12 font-sans">
        <main className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B6683E]">
            <AlertOctagon className="h-7 w-7" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#B6683E]">
              EL CATADOR. · Atención técnica
            </p>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Ocurrió un fallo inesperado en la aplicación
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              No pudimos completar la carga de la página principal. Puedes intentar recargar esta vista de inmediato.
            </p>
            {error?.digest && (
              <p className="text-xs font-mono text-slate-400 pt-1">
                Código de referencia: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] px-5 py-2.5 text-sm font-extrabold text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Intentar recargar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full min-h-[44px] inline-flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Recargar navegador
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

