'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ProductCard } from '@/components/ecommerce/ProductCard';
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
  subgroups,
  products,
  currentGroup,
  currentSubgroup,
}: CatalogBrowserProps) {
  const router = useRouter();

  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Navegación de Grupos por URL compartible
  const handleSelectGroup = (codGrupo: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    router.push(`/catalogo/${codGrupo}`);
  };

  // Navegación de Subgrupos por URL compartible
  const handleSelectSubgroup = (codSubgrupo: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    if (codSubgrupo === 'todos') {
      router.push(`/catalogo/${currentGroup}`);
    } else {
      router.push(`/catalogo/${currentGroup}/${codSubgrupo}`);
    }
  };

  // Filtrado y Ordenamiento
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

  const activeGroupObj = groups.find((g) => g.CodGrupo === currentGroup);
  const activeSubObj = subgroups.find((s) => s.CodSubgrupo === currentSubgroup);
  const categoryTitle = activeSubObj ? `${activeGroupObj?.Nombre || ''} - ${activeSubObj.Nombre}` : activeGroupObj?.Nombre || 'Catálogo';

  return (
    <div className="space-y-6">
      {/* Selector de Grupos Principales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {groups.map((group) => {
          const isActive = group.CodGrupo === currentGroup;
          return (
            <button
              key={group.CodGrupo}
              type="button"
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

      {/* Selector de Subgrupos */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">
            Subgrupos:
          </span>
          <button
            type="button"
            onClick={() => handleSelectSubgroup('todos')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer',
              currentSubgroup === 'todos'
                ? 'bg-catador-amber text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            Todos
          </button>
          {subgroups.map((sub) => {
            const isSubActive = sub.CodSubgrupo === currentSubgroup;
            return (
              <button
                key={sub.CodSubgrupo}
                type="button"
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
      {displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No se encontraron productos disponibles con estos filtros.</p>
          <p className="text-xs text-slate-400 mt-1">Prueba desactivando el filtro de stock o eligiendo otro subgrupo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Botón Cargar Más Productos */}
      {visibleCount < processedProducts.length && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-extrabold text-xs px-6 py-3 shadow-sm transition-all active:scale-98 cursor-pointer"
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
