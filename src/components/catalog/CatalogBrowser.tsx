'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { CatalogFiltersBar, SortOption } from './CatalogFiltersBar';
import { cn } from '@/lib/utils';
import { SmartVentasGroup, SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';

interface CatalogBrowserProps {
  groups: SmartVentasGroup[];
  subgroups: SmartVentasSubgroup[];
  products: Product[];
  currentGroup: string;
  currentSubgroup: string;
}

const ITEMS_PER_PAGE = 24;

export function CatalogBrowser({
  groups,
  subgroups: initialSubgroups,
  products: initialProducts,
  currentGroup: initialGroup,
  currentSubgroup: initialSubgroup,
}: CatalogBrowserProps) {
  const [activeGroup, setActiveGroup] = useState<string>(initialGroup);
  const [activeSubgroup, setActiveSubgroup] = useState<string>(initialSubgroup);
  const [subgroups, setSubgroups] = useState<SmartVentasSubgroup[]>(initialSubgroups);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Caché en memoria del cliente para navegación instantánea entre grupos y subgrupos
  const cacheRef = useRef<Map<string, { products: Product[]; subgroups?: SmartVentasSubgroup[] }>>(
    new Map([
      [
        `${initialGroup}-${initialSubgroup}`,
        { products: initialProducts, subgroups: initialSubgroups },
      ],
    ])
  );

  // Cambio de Grupo instantáneo sin recarga pesada
  const handleSelectGroup = async (codGrupo: string) => {
    if (codGrupo === activeGroup && activeSubgroup === 'todos') return;
    setActiveGroup(codGrupo);
    setActiveSubgroup('todos');
    setVisibleCount(ITEMS_PER_PAGE);

    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/catalogo')) {
      window.history.pushState(null, '', `/catalogo/${codGrupo}`);
    }

    const cacheKey = `${codGrupo}-todos`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && cached.products.length > 0) {
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
      const newProds: Product[] = artData.products || [];
      const newSubs: SmartVentasSubgroup[] = subData.subgrupos || [];
      setProducts(newProds);
      setSubgroups(newSubs);
      if (newProds.length > 0) {
        cacheRef.current.set(cacheKey, { products: newProds, subgroups: newSubs });
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
    }
  };

  // Cambio de Subgrupo instantáneo (filtra en 0ms si el grupo completo está en caché)
  const handleSelectSubgroup = async (codSubgrupo: string) => {
    if (codSubgrupo === activeSubgroup) return;
    setActiveSubgroup(codSubgrupo);
    setVisibleCount(ITEMS_PER_PAGE);

    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/catalogo')) {
      const nextUrl =
        codSubgrupo === 'todos'
          ? `/catalogo/${activeGroup}`
          : `/catalogo/${activeGroup}/${codSubgrupo}`;
      window.history.pushState(null, '', nextUrl);
    }

    const fullGroupKey = `${activeGroup}-todos`;
    const cachedFullGroup = cacheRef.current.get(fullGroupKey);
    if (cachedFullGroup && cachedFullGroup.products.length > 0) {
      if (codSubgrupo === 'todos') {
        setProducts(cachedFullGroup.products);
        return;
      }
      const targetSub = String(codSubgrupo).trim();
      const filteredLocal = cachedFullGroup.products.filter(
        (p) => String(p.codSubgrupo || '').trim() === targetSub
      );
      if (filteredLocal.length > 0) {
        setProducts(filteredLocal);
        return;
      }
    }

    const subCacheKey = `${activeGroup}-${codSubgrupo}`;
    const cachedSub = cacheRef.current.get(subCacheKey);
    if (cachedSub && cachedSub.products.length > 0) {
      setProducts(cachedSub.products);
      return;
    }

    setIsLoading(true);
    try {
      const url =
        codSubgrupo === 'todos'
          ? `/api/catalog?codGrupo=${activeGroup}`
          : `/api/catalog?codGrupo=${activeGroup}&codSubgrupo=${codSubgrupo}`;
      const res = await fetch(url);
      const data = await res.json();
      const newProds: Product[] = data.products || [];
      setProducts(newProds);
      if (newProds.length > 0) {
        cacheRef.current.set(subCacheKey, { products: newProds });
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado y Ordenamiento reactivo
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (onlyInStock) {
      result = result.filter((p) => p.inStock);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.priceUsd - b.priceUsd);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.priceUsd - a.priceUsd);
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, onlyInStock, sortBy]);

  const displayedProducts = useMemo(() => {
    return processedProducts.slice(0, visibleCount);
  }, [processedProducts, visibleCount]);

  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const activeGroupObj = activeGroups.find((g) => g.CodGrupo === activeGroup);
  const activeSubObj = subgroups.find((s) => s.CodSubgrupo === activeSubgroup);
  const categoryTitle = activeSubObj
    ? `${activeGroupObj?.Nombre || ''} - ${activeSubObj.Nombre}`
    : activeGroupObj?.Nombre || 'Catálogo';

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Selector de Grupos Principales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeGroups.map((group) => {
          const isActive = group.CodGrupo === activeGroup;
          return (
            <button
              key={group.CodGrupo}
              type="button"
              onClick={() => handleSelectGroup(group.CodGrupo)}
              className={cn(
                'px-4 py-2 min-h-[38px] text-xs font-extrabold rounded-xl transition-all whitespace-nowrap shadow-2xs cursor-pointer shrink-0',
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

      {/* Selector de Subgrupos */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/80 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">
            Subgrupos:
          </span>
          <button
            type="button"
            onClick={() => handleSelectSubgroup('todos')}
            className={cn(
              'px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0',
              activeSubgroup === 'todos'
                ? 'bg-catador-amber text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            Todos
          </button>
          {subgroups.map((sub) => {
            const isSubActive = sub.CodSubgrupo === activeSubgroup;
            return (
              <button
                key={sub.CodSubgrupo}
                type="button"
                onClick={() => handleSelectSubgroup(sub.CodSubgrupo)}
                className={cn(
                  'px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0',
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

      {/* Barra de Filtros y Orden */}
      <CatalogFiltersBar
        totalCount={processedProducts.length}
        displayedCount={displayedProducts.length}
        onlyInStock={onlyInStock}
        onToggleInStock={setOnlyInStock}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categoryTitle={categoryTitle}
      />

      {/* Grid de Productos */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
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
      ) : displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No se encontraron productos disponibles con estos filtros.</p>
          <p className="text-xs text-slate-400 mt-1">Prueba desactivando el filtro de stock o eligiendo otro subgrupo.</p>
        </div>
      ) : (
        <div
          key={`${activeGroup}-${activeSubgroup}`}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 animate-in fade-in-50 duration-200"
        >
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Botón Cargar Más Productos */}
      {visibleCount < processedProducts.length && !isLoading && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-extrabold text-xs px-6 py-3 min-h-[44px] shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            Cargar más productos (+{Math.min(ITEMS_PER_PAGE, processedProducts.length - visibleCount)})
          </button>
          <p className="text-[11px] text-slate-500">
            Mostrando {displayedProducts.length} de {processedProducts.length} artículos en {categoryTitle}
          </p>
        </div>
      )}
    </div>
  );
}
