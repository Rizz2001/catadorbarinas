'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { LiveCatalogFilterBar } from '@/components/ecommerce/LiveCatalogFilterBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { CatalogFiltersBar, PriceRangeFilter, SortOption } from './CatalogFiltersBar';
import { SmartVentasGroup, SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { useCatalogQuery } from '@/hooks/useCatalogQuery';

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
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [onlyBoxes, setOnlyBoxes] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  const {
    selectedGroup: activeGroup,
    selectedSubgroup: activeSubgroup,
    subgroups,
    products,
    isLoading,
    selectGroup,
    selectSubgroup,
  } = useCatalogQuery({
    initialGroup,
    initialSubgroup,
    initialSubgroups,
    initialProducts,
    syncUrlPrefix: '/catalogo',
    onSelectionChange: () => setVisibleCount(ITEMS_PER_PAGE),
  });

  const processedProducts = useMemo(() => {
    let result = [...products];
    if (onlyInStock) result = result.filter((p) => p.inStock);
    if (onlyDeals) {
      result = result.filter(
        (p) => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPriceUsd && p.originalPriceUsd > p.priceUsd)
      );
    }
    if (onlyBoxes) {
      result = result.filter((p) => p.saleMode !== 'solo_unidad' && (p.unitsPerBox || 1) > 1);
    }
    if (priceRange === 'under_5') result = result.filter((p) => p.priceUsd < 5);
    else if (priceRange === '5_to_15') result = result.filter((p) => p.priceUsd >= 5 && p.priceUsd <= 15);
    else if (priceRange === '15_to_40') result = result.filter((p) => p.priceUsd > 15 && p.priceUsd <= 40);
    else if (priceRange === 'over_40') result = result.filter((p) => p.priceUsd > 40);

    if (sortBy === 'price_asc') result.sort((a, b) => a.priceUsd - b.priceUsd);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.priceUsd - a.priceUsd);
    else if (sortBy === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, onlyInStock, onlyDeals, onlyBoxes, priceRange, sortBy]);

  const displayedProducts = useMemo(() => processedProducts.slice(0, visibleCount), [processedProducts, visibleCount]);
  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const activeGroupObj = activeGroups.find((g) => g.CodGrupo === activeGroup);
  const activeSubObj = subgroups.find((s) => s.CodSubgrupo === activeSubgroup);
  const categoryTitle = activeSubObj ? `${activeGroupObj?.Nombre || ''} - ${activeSubObj.Nombre}` : activeGroupObj?.Nombre || 'Catálogo';

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
      <LiveCatalogFilterBar
        groups={activeGroups}
        subgroups={subgroups}
        selectedGroup={activeGroup}
        selectedSubgroup={activeSubgroup}
        currentGroupName={activeGroupObj?.Nombre || 'Todos'}
        onSelectGroup={selectGroup}
        onSelectSubgroup={selectSubgroup}
      />

      <CatalogFiltersBar
        totalCount={processedProducts.length}
        displayedCount={displayedProducts.length}
        onlyInStock={onlyInStock}
        onToggleInStock={setOnlyInStock}
        onlyDeals={onlyDeals}
        onToggleDeals={setOnlyDeals}
        onlyBoxes={onlyBoxes}
        onToggleBoxes={setOnlyBoxes}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        categoryTitle={categoryTitle}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-2.5">
              <Skeleton className="aspect-square w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-3.5 w-1/3 rounded-md bg-slate-100" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 text-center text-slate-600">
          <p className="text-sm font-bold">No se encontraron productos disponibles con estos filtros.</p>
          <p className="text-xs text-slate-500 mt-1">Prueba desactivando el filtro de stock o eligiendo otro subgrupo.</p>
        </div>
      ) : (
        <div key={`${activeGroup}-${activeSubgroup}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 animate-in fade-in-50 duration-200">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {visibleCount < processedProducts.length && !isLoading && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2 space-y-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="rounded-full bg-catador-blue hover:bg-catador-blue-dark text-white font-extrabold text-xs px-6 py-3 min-h-[44px] transition-all cursor-pointer tabular-nums"
          >
            Cargar más productos (+{Math.min(ITEMS_PER_PAGE, processedProducts.length - visibleCount)})
          </button>
          <p className="text-xs text-slate-500 tabular-nums">
            Mostrando {displayedProducts.length} de {processedProducts.length} artículos en {categoryTitle}
          </p>
        </div>
      )}
    </div>
  );
}
