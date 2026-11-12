import Link from 'next/link';
import { Home, SearchX, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[65vh] w-full bg-[#F7F8FA] flex items-center justify-center px-4 py-14">
      <section className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F172A] text-[#EB9C53] shadow-sm">
          <SearchX className="h-8 w-8" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-extrabold text-[#B45309] tabular-nums">
            Error 404 · Página no encontrada
          </span>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            No encontramos esta botella o sección
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            El enlace que visitaste pudo haber cambiado o el artículo ya no se encuentra disponible en la cava.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] px-6 py-2.5 text-sm font-extrabold text-white transition-colors"
          >
            <Home className="h-4 w-4" strokeWidth={2} />
            Volver a la página principal
          </Link>

          <Link
            href="/catalogo"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-6 py-2.5 text-sm font-bold text-slate-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Explorar catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}

