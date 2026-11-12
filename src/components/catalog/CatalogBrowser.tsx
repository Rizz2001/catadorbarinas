'use client';

import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { SmartVentasGroup, SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { useCatalogQuery } from '@/hooks/useCatalogQuery';
import { countActiveCatalogFilters, extractAvailableBrands, filterAndSortCatalogProducts } from '@/lib/catalogFilters';
import { PriceRangeFilter, SortOption } from './catalogFilterTypes';
import { CatalogSubcategoryBar } from './CatalogSubcategoryBar';
import { CatalogFiltersDrawer } from './CatalogFiltersDrawer';

interface CatalogBrowserProps {
  groups: SmartVentasGroup[];
  subgroups: SmartVentasSubgroup[];
  products: Product[];
  currentGroup: string;
  currentSubgroup: string;
  initialOnlyBoxes?: boolean;
}

const ITEMS_PER_PAGE = 24;

export function CatalogBrowser({
  groups,
  subgroups: initialSubgroups,
  products: initialProducts,
  currentGroup: initialGroup,
  currentSubgroup: initialSubgroup,
  initialOnlyBoxes = false,
}: CatalogBrowserProps) {
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [onlyBoxes, setOnlyBoxes] = useState(initialOnlyBoxes);
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    onSelectionChange: () => {
      setVisibleCount(ITEMS_PER_PAGE);
      setSelectedBrand('all');
    },
  });

  const filterCriteria = useMemo(
    () => ({ onlyInStock, onlyDeals, onlyBoxes, selectedBrand, priceRange, sortBy }),
    [onlyInStock, onlyDeals, onlyBoxes, selectedBrand, priceRange, sortBy]
  );
  const availableBrands = useMemo(() => extractAvailableBrands(products), [products]);
  const processedProducts = useMemo(() => filterAndSortCatalogProducts(products, filterCriteria), [products, filterCriteria]);
  const activeFiltersCount = countActiveCatalogFilters(filterCriteria);

  const handleResetFilters = () => {
    setOnlyInStock(false);
    setOnlyDeals(false);
    setOnlyBoxes(false);
    setPriceRange('all');
    setSelectedBrand('all');
    setSortBy('default');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const displayedProducts = useMemo(() => processedProducts.slice(0, visibleCount), [processedProducts, visibleCount]);
  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const activeGroupObj = activeGroups.find((g) => g.CodGrupo === activeGroup);
  const activeSubObj = subgroups.find((s) => s.CodSubgrupo === activeSubgroup);
  const categoryTitle = activeSubObj ? `${activeGroupObj?.Nombre || ''} - ${activeSubObj.Nombre}` : activeGroupObj?.Nombre || 'Catálogo';

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0 max-w-full">
      <CatalogSubcategoryBar
        subgroups={subgroups}
        selectedSubgroup={activeSubgroup}
        onSelectSubgroup={selectSubgroup}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setIsFiltersOpen(true)}
      />

      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
          <span className="tabular-nums font-medium">
            {processedProducts.length} {processedProducts.length === 1 ? 'resultado' : 'resultados'} con filtros activos
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Limpiar filtros
          </button>
        </div>
      )}

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
        <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 text-center text-slate-600 space-y-3">
          <p className="text-sm font-bold">No se encontraron productos disponibles con estos filtros.</p>
          <p className="text-xs text-slate-500">Prueba ajustando los filtros activos o seleccionando otra subcategoría.</p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Restablecer filtros
            </button>
          )}
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

      <CatalogFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        totalCount={processedProducts.length}
        categoryTitle={categoryTitle}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        groups={activeGroups}
        selectedGroup={activeGroup}
        onSelectGroup={selectGroup}
        subgroups={subgroups}
        selectedSubgroup={activeSubgroup}
        onSelectSubgroup={selectSubgroup}
        brands={availableBrands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        onlyInStock={onlyInStock}
        onToggleInStock={setOnlyInStock}
        onlyDeals={onlyDeals}
        onToggleDeals={setOnlyDeals}
        onlyBoxes={onlyBoxes}
        onToggleBoxes={setOnlyBoxes}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
}
