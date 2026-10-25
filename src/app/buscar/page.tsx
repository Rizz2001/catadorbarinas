import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { searchProducts, fetchGruposInv, fetchSubgruposInv } from '@/services/foxdata.service';
import { CatalogBrowser } from '@/components/catalog';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; grupo?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim() || '';

  const title = term
    ? `Buscar: "${term}" | Gran Catador Barinas`
    : `Búsqueda de Productos | Gran Catador Barinas`;

  const description = `Resultados de búsqueda para "${term}" en Gran Catador / Bodegón del Catador Barinas con precios en dólares y bolívares.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const { q, grupo } = await searchParams;
  const term = q?.trim() || '';

  const [products, groups, subgroups] = await Promise.all([
    term ? searchProducts(term, grupo) : Promise.resolve([]),
    fetchGruposInv(),
    fetchSubgruposInv(grupo || '01'),
  ]);

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb de Navegación */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <Link href="/catalogo" className="hover:text-catador-blue transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        <span className="font-bold text-slate-800 truncate">
          {term ? `Resultados para "${term}"` : 'Búsqueda'}
        </span>
      </nav>

      {/* Cabecera de Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {term ? `Resultados para: "${term}"` : 'Buscador de Productos'}
            </h1>
            <p className="text-xs text-slate-500">
              {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'} en tiempo real en Bodegón (Depósito 01)
            </p>
          </div>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Ver todo el Catálogo
        </Link>
      </div>

      {/* Si no hay término o no hay resultados */}
      {!term ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3">
          <Search className="h-12 w-12 mx-auto text-slate-300 stroke-1" />
          <h2 className="text-base font-bold text-slate-800">Escribe algo en el buscador</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Puedes buscar marcas como Buchanan&apos;s, Santa Teresa, Polar, Harina PAN o cualquier producto de nuestro bodegón.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3">
          <Search className="h-12 w-12 mx-auto text-slate-300 stroke-1" />
          <h2 className="text-base font-bold text-slate-800">No encontramos resultados para &quot;{term}&quot;</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Verifica que la palabra esté bien escrita o prueba buscando una categoría más general.
          </p>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl bg-catador-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors shadow-xs"
            >
              Explorar Catálogo Completo
            </Link>
          </div>
        </div>
      ) : (
        /* Navegador de Resultados con Filtros y Carga Progresiva */
        <CatalogBrowser
          groups={groups}
          subgroups={subgroups}
          products={products}
          currentGroup={grupo || '01'}
          currentSubgroup="todos"
        />
      )}
    </main>
  );
}
