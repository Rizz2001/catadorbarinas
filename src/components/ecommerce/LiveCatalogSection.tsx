'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { LiveCatalogFilterBar } from './LiveCatalogFilterBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCatalogQuery } from '@/hooks/useCatalogQuery';

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
  initialTotalCount?: number;
  customTitle?: string | null;
  customSubtitle?: string | null;
}

const INITIAL_VISIBLE_COUNT = 10;
const PAGE_INCREMENT = 10;

export function LiveCatalogSection({
  groups,
  initialSubgroups,
  initialProducts,
  initialTotalCount,
  customTitle,
  customSubtitle,
}: LiveCatalogSectionProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const catalogTitle =
    customTitle || storeConfig?.catalogo_titulo || 'Catálogo General Bodegón';
  const catalogSubtitle =
    customSubtitle ||
    storeConfig?.catalogo_subtitulo ||
    'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV';

  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  const {
    selectedGroup,
    selectedSubgroup,
    subgroups,
    products,
    isLoading,
    selectGroup,
    selectSubgroup,
    ensureFullGroupLoaded,
  } = useCatalogQuery({
    initialGroup: '01',
    initialSubgroup: 'todos',
    initialSubgroups,
    initialProducts,
    onSelectionChange: () => setVisibleCount(INITIAL_VISIBLE_COUNT),
  });

  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const currentGroupName = activeGroups.find((g) => g.CodGrupo === selectedGroup)?.Nombre || 'Licores';
  const visibleProducts = products.slice(0, visibleCount);
  const totalAvailableCount =
    selectedGroup === '01' && selectedSubgroup === 'todos' && initialTotalCount
      ? Math.max(products.length, initialTotalCount)
      : products.length;

  const handleLoadMore = async () => {
    const nextVisible = visibleCount + PAGE_INCREMENT;
    setVisibleCount(nextVisible);
    if (
      selectedGroup === '01' &&
      selectedSubgroup === 'todos' &&
      nextVisible >= products.length &&
      totalAvailableCount > products.length
    ) {
      await ensureFullGroupLoaded('01');
    }
  };

  return (
    <section
      id="catalogo-en-vivo"
      className="scroll-mt-44 space-y-4 sm:space-y-5 pt-4 sm:pt-6 border-t border-slate-200 min-w-0 max-w-full overflow-hidden"
    >
      <div className="flex items-end justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {catalogTitle}
          </h2>
          <p className="hidden sm:block text-sm text-slate-500 mt-1">{catalogSubtitle}</p>
        </div>
        <span className="shrink-0 text-[11px] sm:text-[13px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-100 sm:border-slate-200 shadow-2xs tabular-nums">
          {isLoading ? 'Cargando...' : `${visibleProducts.length} de ${totalAvailableCount}`}
        </span>
      </div>

      <LiveCatalogFilterBar
        groups={activeGroups}
        subgroups={subgroups}
        selectedGroup={selectedGroup}
        selectedSubgroup={selectedSubgroup}
        currentGroupName={currentGroupName}
        onSelectGroup={selectGroup}
        onSelectSubgroup={selectSubgroup}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-2.5">
              <Skeleton className="h-44 w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-3.5 w-1/3 rounded-md bg-slate-100" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 text-center text-slate-600">
          <p className="text-sm font-semibold">No se encontraron artículos en este subgrupo.</p>
        </div>
      ) : (
        <>
          <div key={`${selectedGroup}-${selectedSubgroup}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            {visibleCount < totalAvailableCount && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200 hover:border-catador-blue px-6 py-2.5 min-h-[44px] text-[13px] sm:text-sm font-black text-slate-800 hover:text-catador-blue transition-colors cursor-pointer tabular-nums"
              >
                <span>Cargar más (+{Math.min(PAGE_INCREMENT, totalAvailableCount - visibleCount)})</span>
                <ChevronDown className="h-4 w-4" strokeWidth={1.5}/>
              </button>
            )}

            <Link
              href={`/catalogo/${selectedGroup}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-6 py-2.5 min-h-[44px] text-[13px] sm:text-sm font-extrabold text-white transition-colors"
            >
              <span>Ver departamento {currentGroupName}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5}/>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
