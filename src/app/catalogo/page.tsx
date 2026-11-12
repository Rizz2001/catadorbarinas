import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, LayoutGrid, Package, Tag } from 'lucide-react';
import { getCatalogCategoriesServer, getStoreConfigServer } from '@/services/cms.server';
import { CatalogVisualGrid } from '@/components/catalog';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Catálogo por Categorías | EL CATADOR. Barinas',
  description:
    'Explora licores, cervezas, vinos, refrescos, despensa y colecciones destacadas por unidad o por caja cerrada con precios en $ USD y Bs. BCV en Barinas.',
};

export default async function CatalogoVisualPage() {
  const [categories, storeConfig] = await Promise.all([
    getCatalogCategoriesServer(),
    getStoreConfigServer(),
  ]);

  const title = storeConfig?.catalogo_titulo || 'Explora Nuestro Catálogo';
  const subtitle =
    storeConfig?.catalogo_subtitulo ||
    'Selecciona una categoría o colección destacada para ver inventario y precios oficiales en $ USD y Bs. BCV.';

  return (
    <main className="container mx-auto max-w-7xl px-3 sm:px-4 py-4 md:py-8 space-y-5 sm:space-y-6 overflow-x-clip">
      <nav
        aria-label="Ruta de navegación"
        className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none"
      >
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.5} />
        <span className="font-bold text-slate-800">Catálogo</span>
      </nav>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-[#EB9C53] shadow-2xs">
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          <Link
            href="/catalogo/01?caja=1"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 px-3.5 py-2 text-xs font-extrabold text-[#8B3E03] hover:bg-[#FDE68A] transition-colors shrink-0 min-h-[38px]"
          >
            <Package className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span>Por Caja Cerrada</span>
          </Link>
          <Link
            href="/#ofertas"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-800 hover:border-[#0016C2] hover:text-[#0016C2] transition-colors shrink-0 min-h-[38px]"
          >
            <Tag className="h-3.5 w-3.5 shrink-0 text-[#E07A1F]" strokeWidth={1.75} />
            <span>Ofertas del Día</span>
          </Link>
        </div>
      </header>

      <CatalogVisualGrid categories={categories} />
    </main>
  );
}

