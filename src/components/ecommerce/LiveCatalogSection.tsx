'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, ChevronDown, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { cn } from '@/lib/utils';

export interface SmartVentasGroup {
  CodGrupo: string;
  Nombre: string;
  SmartVentas?: number;
}

export interface SmartVentasSubgroup {
  CodGrupo: string;
  CodSubgrupo: string;
  Nombre: string;
}

interface LiveCatalogSectionProps {
  groups: SmartVentasGroup[];
  initialSubgroups: SmartVentasSubgroup[];
  initialProducts: Product[];
  customTitle?: string | null;
  customSubtitle?: string | null;
}

const INITIAL_VISIBLE_COUNT = 10;
const PAGE_INCREMENT = 10;

export function LiveCatalogSection({
  groups,
  initialSubgroups,
  initialProducts,
  customTitle,
  customSubtitle,
}: LiveCatalogSectionProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const catalogTitle = customTitle || storeConfig?.catalogo_titulo || 'Catálogo Bodegón & Supermercado (Depósito 01)';
  const catalogSubtitle = customSubtitle || storeConfig?.catalogo_subtitulo || 'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV';

  const [selectedGroup, setSelectedGroup] = useState<string>('01');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('todos');
  const [subgroups, setSubgroups] = useState<SmartVentasSubgroup[]>(initialSubgroups);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Caché instantáneo en cliente para cambio inmediato a 60 FPS sin recargas
  const clientCacheRef = React.useRef<Map<string, { products: Product[]; subgroups?: SmartVentasSubgroup[] }>>(
    new Map([
      ['01-todos', { products: initialProducts, subgroups: initialSubgroups }]
    ])
  );

  // Maneja el cambio de Grupo con respuesta inmediata si ya fue consultado
  const handleSelectGroup = async (codGrupo: string) => {
    if (codGrupo === selectedGroup) return;
    setSelectedGroup(codGrupo);
    setSelectedSubgroup('todos');
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const cacheKey = `${codGrupo}-todos`;
    const cached = clientCacheRef.current.get(cacheKey);

    if (cached) {
      setProducts(cached.products);
      if (cached.subgroups) setSubgroups(cached.subgroups);
      return;
    }

    setIsLoading(true);
    try {
      const [artRes, subRes] = await Promise.all([
        fetch(`/api/catalog?codGrupo=${codGrupo}`),
        fetch(`/api/catalog?codGrupo=${codGrupo}&subgroups=true`),
      ]);

      const [artData, subData] = await Promise.all([artRes.json(), subRes.json()]);
      const newProds = artData.products || [];
      const newSubs = subData.subgrupos || [];
      setProducts(newProds);
      setSubgroups(newSubs);
      clientCacheRef.current.set(cacheKey, { products: newProds, subgroups: newSubs });
    } catch {
      // Manejo de fallo silencioso
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja el filtrado por Subgrupo con respuesta inmediata si ya fue consultado
  const handleSelectSubgroup = async (codSubgrupo: string) => {
    if (codSubgrupo === selectedSubgroup) return;
    setSelectedSubgroup(codSubgrupo);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const cacheKey = `${selectedGroup}-${codSubgrupo}`;
    const cached = clientCacheRef.current.get(cacheKey);

    if (cached) {
      setProducts(cached.products);
      return;
    }

    setIsLoading(true);
    try {
      const url =
        codSubgrupo === 'todos'
          ? `/api/catalog?codGrupo=${selectedGroup}`
          : `/api/catalog?codGrupo=${selectedGroup}&codSubgrupo=${codSubgrupo}`;

      const res = await fetch(url);
      const data = await res.json();
      const newProds = data.products || [];
      setProducts(newProds);
      clientCacheRef.current.set(cacheKey, { products: newProds });
    } catch {
      // Manejo de fallo silencioso
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_INCREMENT);
  };

  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const currentGroupName = activeGroups.find((g) => g.CodGrupo === selectedGroup)?.Nombre || 'Licores';
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <section id="catalogo-en-vivo" className="space-y-6 pt-6 border-t border-slate-200">
      {/* Cabecera y Selector de Grupos Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-catador-blue text-white shadow-2xs">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {catalogTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {catalogSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            {isLoading
              ? 'Actualizando...'
              : `Mostrando ${visibleProducts.length} de ${products.length} productos`}
          </span>
        </div>
      </div>

      {/* Barra de Píldoras de Grupos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full min-w-0 max-w-full">
        {activeGroups.map((group) => {
          const isActive = group.CodGrupo === selectedGroup;
          return (
            <button
              key={group.CodGrupo}
              onClick={() => handleSelectGroup(group.CodGrupo)}
              className={cn(
                'px-4 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap shadow-2xs cursor-pointer',
                isActive
                  ? 'bg-catador-blue text-white shadow-sm ring-2 ring-catador-blue/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-catador-blue'
              )}
            >
              {group.Nombre}
            </button>
          );
        })}
      </div>

      {/* Subgrupos del Grupo Seleccionado */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 w-full min-w-0 max-w-full">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">
            Subgrupos:
          </span>
          <button
            onClick={() => handleSelectSubgroup('todos')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer',
              selectedSubgroup === 'todos'
                ? 'bg-catador-amber text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            Todos
          </button>
          {subgroups.map((sub) => {
            const isSubActive = sub.CodSubgrupo === selectedSubgroup;
            return (
              <button
                key={sub.CodSubgrupo}
                onClick={() => handleSelectSubgroup(sub.CodSubgrupo)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer',
                  isSubActive
                    ? 'bg-catador-amber text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                )}
              >
                {sub.Nombre}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Productos con Paginación Liviana y Transición Suave */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in duration-200">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
              <Skeleton className="aspect-square w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-3.5 w-1/3 rounded-md bg-slate-100" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-slate-100" />
              <div className="pt-2 flex justify-between items-end">
                <div className="space-y-1.5 w-1/2">
                  <Skeleton className="h-4 w-full rounded-md bg-slate-100" />
                  <Skeleton className="h-3 w-4/5 rounded-md bg-slate-100" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 animate-in fade-in duration-300">
          <p className="text-sm font-semibold">No se encontraron artículos en este subgrupo.</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otro subgrupo o grupo.</p>
        </div>
      ) : (
        <>
          <div
            key={`${selectedGroup}-${selectedSubgroup}`}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-300 fill-mode-both"
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Botón de Cargar Más Productos & Enlace al Catálogo Completo */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {visibleCount < products.length && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-catador-blue px-6 py-2.5 text-xs font-black text-slate-800 hover:text-catador-blue shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                Cargar más productos (+{Math.min(PAGE_INCREMENT, products.length - visibleCount)})
                <ChevronDown className="h-4 w-4" />
              </button>
            )}

            <Link
              href={`/catalogo/${selectedGroup}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-extrabold text-catador-blue transition-colors"
            >
              Ver todos en {currentGroupName} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
