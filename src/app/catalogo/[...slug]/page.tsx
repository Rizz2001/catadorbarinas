import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchArticulosSmartVentas,
} from '@/services/foxdata.service';
import { CatalogBrowser } from '@/components/catalog';
import { formatCatalogLabel, resolveCatalogSubgroup } from '@/lib/catalogFilters';
import { OFFICIAL_LOGO_VERSIONED, OFFICIAL_OG_IMAGE } from '@/constants/config';

export const revalidate = 60;

interface CatalogGroupPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ caja?: string }>;
}

export async function generateMetadata({ params }: CatalogGroupPageProps): Promise<Metadata> {
  const { slug } = await params;
  const codGrupo = slug[0] || '01';
  const codSubgrupoParam = resolveCatalogSubgroup(slug[1]);

  const [groups, subgroups] = await Promise.all([
    fetchGruposInv(),
    fetchSubgruposInv(codGrupo),
  ]);

  const rawGroup = groups.find((g: { CodGrupo: string }) => g.CodGrupo === codGrupo)?.Nombre;
  const rawSub = codSubgrupoParam
    ? subgroups.find((s: { CodSubgrupo: string }) => s.CodSubgrupo === codSubgrupoParam)?.Nombre
    : undefined;
  const groupName = formatCatalogLabel(rawGroup) || 'Catálogo';
  const subName = rawSub ? formatCatalogLabel(rawSub) : undefined;

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
      images: [{ ...OFFICIAL_OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OFFICIAL_LOGO_VERSIONED],
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
  const codSubgrupoParam = resolveCatalogSubgroup(slug[1]);
  const codSubgrupo = codSubgrupoParam ?? 'todos';
  const initialOnlyBoxes = resolvedSearchParams?.caja === '1';

  const [groups, subgroups, products] = await Promise.all([
    fetchGruposInv(),
    fetchSubgruposInv(codGrupo),
    fetchArticulosSmartVentas(codGrupo, codSubgrupoParam),
  ]);

  const activeGroup = groups.find((g: { CodGrupo: string }) => g.CodGrupo === codGrupo);
  const activeSub = codSubgrupoParam
    ? subgroups.find((s: { CodSubgrupo: string }) => s.CodSubgrupo === codSubgrupoParam)
    : undefined;

  const groupLabel = formatCatalogLabel(activeGroup?.Nombre) || 'Catálogo';
  const subLabel = activeSub ? formatCatalogLabel(activeSub.Nombre) : undefined;
  const headingTitle = subLabel || groupLabel;
  const mobileBackHref = activeSub && activeGroup ? `/catalogo/${activeGroup.CodGrupo}` : '/catalogo';
  const mobileBackLabel = activeSub ? groupLabel : 'Catálogo';

  return (
    <main className="container mx-auto max-w-7xl px-3 sm:px-4 pt-3 pb-6 md:py-6 space-y-3 sm:space-y-4 overflow-x-clip">
      <div className="space-y-1.5">
        <Link
          href={mobileBackHref}
          className="sm:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 py-1 -ml-0.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{mobileBackLabel}</span>
        </Link>

        <nav
          aria-label="Ruta de navegación"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none"
        >
          <Link href="/" className="hover:text-catador-blue transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.75} />
          <Link href="/catalogo" className="hover:text-catador-blue transition-colors">
            Catálogo
          </Link>
          {activeGroup && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.75} />
              <Link
                href={`/catalogo/${activeGroup.CodGrupo}`}
                className={activeSub ? 'hover:text-catador-blue transition-colors' : 'font-semibold text-slate-900'}
              >
                {groupLabel}
              </Link>
            </>
          )}
          {subLabel && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={1.75} />
              <span className="font-semibold text-slate-900 truncate">{subLabel}</span>
            </>
          )}
        </nav>

        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            {headingTitle}
          </h1>
          <span className="shrink-0 text-xs sm:text-sm font-medium text-slate-500 tabular-nums">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
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
