import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, ChevronRight } from 'lucide-react';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchArticulosSmartVentas,
} from '@/services/foxdata.service';
import { CatalogBrowser } from '@/components/catalog';

export const revalidate = 60;

interface CatalogGroupPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ caja?: string }>;
}

export async function generateMetadata({ params }: CatalogGroupPageProps): Promise<Metadata> {
  const { slug } = await params;
  const codGrupo = slug[0] || '01';
  const codSubgrupo = slug[1] || 'todos';

  const [groups, subgroups] = await Promise.all([
    fetchGruposInv(),
    fetchSubgruposInv(codGrupo),
  ]);

  const groupName = groups.find((g: { CodGrupo: string }) => g.CodGrupo === codGrupo)?.Nombre || 'Catálogo';
  const subName = codSubgrupo !== 'todos'
    ? subgroups.find((s: { CodSubgrupo: string }) => s.CodSubgrupo === codSubgrupo)?.Nombre
    : undefined;

  const title = subName
    ? `${subName} (${groupName}) | Catálogo Gran Catador Barinas`
    : `${groupName} | Catálogo Gran Catador Barinas`;

  const description = `Consulta precios bimonetarios oficiales ($ y Bs.) e inventario en tiempo real de ${subName || groupName} en Bodegón del Catador Barinas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CatalogoGroupPage({
  params,
  searchParams,
}: CatalogGroupPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const codGrupo = slug[0] || '01';
  const codSubgrupo = slug[1] || 'todos';
  const initialOnlyBoxes = resolvedSearchParams?.caja === '1';

  const [groups, subgroups, products] = await Promise.all([
    fetchGruposInv(),
    fetchSubgruposInv(codGrupo),
    fetchArticulosSmartVentas(codGrupo, codSubgrupo === 'todos' ? undefined : codSubgrupo),
  ]);

  const activeGroup = groups.find((g: { CodGrupo: string }) => g.CodGrupo === codGrupo);
  const activeSub = subgroups.find((s: { CodSubgrupo: string }) => s.CodSubgrupo === codSubgrupo);

  return (
    <main className="container mx-auto max-w-7xl px-3 sm:px-4 py-4 md:py-8 space-y-4 sm:space-y-6 overflow-x-clip">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.5} />
        <Link href="/catalogo" className="hover:text-catador-blue transition-colors">
          Catálogo
        </Link>
        {activeGroup && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.5} />
            <Link
              href={`/catalogo/${activeGroup.CodGrupo}`}
              className={activeSub ? 'hover:text-catador-blue transition-colors' : 'font-bold text-slate-800'}
            >
              {activeGroup.Nombre}
            </Link>
          </>
        )}
        {activeSub && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.5} />
            <span className="font-bold text-slate-800 truncate">{activeSub.Nombre}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3.5 sm:pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
              {activeSub ? `${activeGroup?.Nombre} • ${activeSub.Nombre}` : (activeGroup?.Nombre || 'Catálogo General')}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Inventario en tiempo real sincronizado directamente con el Bodegón
            </p>
          </div>
        </div>
      </div>

      <CatalogBrowser
        key={`${codGrupo}-${codSubgrupo}-${initialOnlyBoxes ? 'boxes' : 'all'}`}
        groups={groups}
        subgroups={subgroups}
        products={products}
        currentGroup={codGrupo}
        currentSubgroup={codSubgrupo}
        initialOnlyBoxes={initialOnlyBoxes}
      />
    </main>
  );
}

