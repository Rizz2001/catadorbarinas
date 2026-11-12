import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { searchProducts, fetchGruposInv, fetchSubgruposInv } from '@/services/foxdata.service';
import { CatalogBrowser } from '@/components/catalog';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; grupo?: string }>;
}

const POPULAR_CHIPS = [
  "Buchanan's",
  'Santa Teresa 1796',
  'Polar Pilsen',
  'Corona',
  'Harina P.A.N.',
];

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim() || '';

  const title = term
    ? `Buscar: "${term}" | EL CATADOR. Barinas`
    : 'Búsqueda de Productos | EL CATADOR. Barinas';

  const description = `Resultados de búsqueda para "${term}" en EL CATADOR. Barinas con precios en dólares y bolívares BCV.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const { q, grupo } = await searchParams;
  const term = q?.trim() || '';

  const [products, groups, subgroups] = await Promise.all([
    term ? searchProducts(term, grupo) : Promise.resolve([]),
    fetchGruposInv(),
    grupo ? fetchSubgruposInv(grupo) : Promise.resolve([]),
  ]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 md:py-8 space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-600 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-catador-blue transition-colors font-semibold">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={1.5}/>
        <Link href="/catalogo" className="hover:text-catador-blue transition-colors font-semibold">
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={1.5}/>
        <span className="font-extrabold text-slate-900 truncate">
          {term ? `Resultados para "${term}"` : 'Búsqueda'}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-catador-blue text-white shrink-0">
            <Search className="h-5 w-5" strokeWidth={1.5}/>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {term ? `Resultados para: "${term}"` : 'Buscador de Productos'}
            </h1>
            <p className="text-[13px] text-slate-600 tabular-nums">
              {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'} en tiempo real en EL CATADOR. Barinas
            </p>
          </div>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-catador-blue hover:text-catador-blue-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5}/> Ver todo el Catálogo
        </Link>
      </div>

      {!term ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
          <Search className="h-12 w-12 mx-auto text-slate-300 stroke-1" strokeWidth={1.5}/>
          <h2 className="text-base font-black text-slate-900">¿Qué deseas buscar hoy?</h2>
          <p className="text-[13px] text-slate-600 max-w-md mx-auto">
            Prueba con los términos populares de nuestro bodegón en Barinas:
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {POPULAR_CHIPS.map((chip) => (
              <Link
                key={chip}
                href={`/buscar?q=${encodeURIComponent(chip)}`}
                className="rounded-full bg-[#F7F8FA] border border-slate-200 hover:border-catador-blue px-4 py-2 text-xs font-extrabold text-slate-800 hover:text-catador-blue transition-colors"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
          <Search className="h-12 w-12 mx-auto text-slate-300 stroke-1" strokeWidth={1.5}/>
          <h2 className="text-base font-black text-slate-900">
            No encontramos resultados para &quot;{term}&quot;
          </h2>
          <p className="text-[13px] text-slate-600 max-w-sm mx-auto">
            Verifica la ortografía o explora una categoría general del catálogo.
          </p>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-catador-blue px-6 py-2.5 text-xs font-extrabold text-white hover:bg-catador-blue-dark transition-colors"
            >
              Explorar Catálogo Completo
            </Link>
          </div>
        </div>
      ) : (
        <CatalogBrowser
          key={`${term}-${grupo || 'all'}`}
          groups={groups}
          subgroups={subgroups}
          products={products}
          currentGroup={grupo || 'all'}
          currentSubgroup="todos"
        />
      )}
    </main>
  );
}
