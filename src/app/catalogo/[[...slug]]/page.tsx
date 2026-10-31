import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, ChevronRight } from 'lucide-react';
import {
  fetchGruposInv,
  fetchSubgruposInv,
  fetchArticulosSmartVentas,
} from '@/services/foxdata.service';
import { CatalogBrowser } from '@/components/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface CatalogPageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const codGrupo = slug?.[0] || '01';
  const codSubgrupo = slug?.[1] || 'todos';

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

  const description = `Consulta precios bimonetarios oficiales ($ y Bs.) e inventario en tiempo real de ${subName || groupName} en Bodegón del Catador Barinas (Depósito 01).`;

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

export default async function CatalogoPage({ params }: CatalogPageProps) {
  const { slug } = await params;
  const codGrupo = slug?.[0] || '01';
  const codSubgrupo = slug?.[1] || 'todos';

  const [groups, subgroups, products] = await Promise.all([
    fetchGruposInv(),
    fetchSubgruposInv(codGrupo),
    fetchArticulosSmartVentas(codGrupo, codSubgrupo === 'todos' ? undefined : codSubgrupo),
  ]);

  const activeGroup = groups.find((g: { CodGrupo: string }) => g.CodGrupo === codGrupo);
  const activeSub = subgroups.find((s: { CodSubgrupo: string }) => s.CodSubgrupo === codSubgrupo);

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
        {activeGroup && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
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
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-slate-800 truncate">{activeSub.Nombre}</span>
          </>
        )}
      </nav>

      {/* Título de la Sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {activeSub ? `${activeGroup?.Nombre} • ${activeSub.Nombre}` : (activeGroup?.Nombre || 'Catálogo General')}
            </h1>
            <p className="text-xs text-slate-500">
              Inventario en tiempo real sincronizado directamente con el Bodegón (Depósito 01)
            </p>
          </div>
        </div>
      </div>

      {/* Navegador Interactivo del Catálogo */}
      <CatalogBrowser
        key={`${codGrupo}-${codSubgrupo}`}
        groups={groups}
        subgroups={subgroups}
        products={products}
        currentGroup={codGrupo}
        currentSubgroup={codSubgrupo}
      />
    </main>
  );
}
