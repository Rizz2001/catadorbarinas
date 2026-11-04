'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
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
    customTitle || storeConfig?.catalogo_titulo || 'Catálogo General • Depósito 01';
  const catalogSubtitle =
    customSubtitle ||
    storeConfig?.catalogo_subtitulo ||
    'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV';

  const [selectedGroup, setSelectedGroup] = useState<string>('01');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('todos');
  const [subgroups, setSubgroups] = useState<SmartVentasSubgroup[]>(initialSubgroups);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState<boolean>(initialProducts.length === 0);

  const clientCacheRef = React.useRef<
    Map<string, { products: Product[]; subgroups?: SmartVentasSubgroup[]; isFull?: boolean }>
  >(
    new Map(
      initialProducts.length > 0
        ? [['01-todos', { products: initialProducts, subgroups: initialSubgroups, isFull: initialProducts.length > 40 }]]
        : []
    )
  );

  React.useEffect(() => {
    if (initialProducts.length > 0) return;
    let mounted = true;
    async function hydrateInitialCatalog() {
      setIsLoading(true);
      try {
        const [artRes, subRes] = await Promise.all([
          fetch('/api/catalog?codGrupo=01'),
          fetch('/api/catalog?codGrupo=01&subgroups=true'),
        ]);
        const [artData, subData] = await Promise.all([artRes.json(), subRes.json()]);
        if (!mounted) return;
        const newProds: Product[] = artData.products || [];
        const newSubs: SmartVentasSubgroup[] = subData.subgrupos || [];
        setProducts(newProds);
        if (newSubs.length > 0) setSubgroups(newSubs);
        if (newProds.length > 0) {
          clientCacheRef.current.set('01-todos', {
            products: newProds,
            subgroups: newSubs,
            isFull: true,
          });
        }
      } catch {
        // Silencioso
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void hydrateInitialCatalog();
    return () => {
      mounted = false;
    };
  }, [initialProducts.length]);

  const handleSelectGroup = async (codGrupo: string) => {
    if (codGrupo === selectedGroup) return;
    setSelectedGroup(codGrupo);
    setSelectedSubgroup('todos');
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const cacheKey = `${codGrupo}-todos`;
    const cached = clientCacheRef.current.get(cacheKey);
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
        clientCacheRef.current.set(cacheKey, { products: newProds, subgroups: newSubs, isFull: true });
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubgroup = async (codSubgrupo: string) => {
    if (codSubgrupo === selectedSubgroup) return;
    setSelectedSubgroup(codSubgrupo);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    const groupCacheKey = `${selectedGroup}-todos`;
    const cachedFullGroup = clientCacheRef.current.get(groupCacheKey);
    if (cachedFullGroup && cachedFullGroup.isFull && cachedFullGroup.products.length > 0) {
      if (codSubgrupo === 'todos') {
        setProducts(cachedFullGroup.products);
        return;
      }
      const targetSub = String(codSubgrupo).trim();
      const filteredLocal = cachedFullGroup.products.filter(
        (p) => String(p.codSubgrupo || '').trim() === targetSub
      );
      setProducts(filteredLocal);
      return;
    }

    if (codSubgrupo === 'todos' && cachedFullGroup && cachedFullGroup.products.length > 0) {
      setProducts(cachedFullGroup.products);
      return;
    }

    const cacheKey = `${selectedGroup}-${codSubgrupo}`;
    const cached = clientCacheRef.current.get(cacheKey);
    if (cached && cached.products.length > 0) {
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
      const newProds: Product[] = data.products || [];
      setProducts(newProds);
      if (newProds.length > 0) {
        clientCacheRef.current.set(cacheKey, { products: newProds });
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
    }
  };

  const activeGroups = groups.filter((g) => g.SmartVentas === 1 || g.SmartVentas === undefined);
  const currentGroupName =
    activeGroups.find((g) => g.CodGrupo === selectedGroup)?.Nombre || 'Licores';
  const visibleProducts = products.slice(0, visibleCount);
  const totalAvailableCount =
    selectedGroup === '01' && selectedSubgroup === 'todos' && initialTotalCount
      ? Math.max(products.length, initialTotalCount)
      : products.length;

  const handleLoadMore = async () => {
    const nextVisible = visibleCount + PAGE_INCREMENT;
    setVisibleCount(nextVisible);

    const groupCache = clientCacheRef.current.get(`${selectedGroup}-todos`);
    if (
      selectedGroup === '01' &&
      selectedSubgroup === 'todos' &&
      !groupCache?.isFull &&
      nextVisible >= products.length &&
      totalAvailableCount > products.length
    ) {
      try {
        const res = await fetch('/api/catalog?codGrupo=01');
        const data = await res.json();
        const fullProds: Product[] = data.products || [];
        if (fullProds.length > 0) {
          setProducts(fullProds);
          clientCacheRef.current.set('01-todos', {
            products: fullProds,
            subgroups,
            isFull: true,
          });
        }
      } catch {
        // Silencioso
      }
    }
  };

  return (
    <section id="catalogo-en-vivo" className="space-y-4 sm:space-y-5 pt-4 sm:pt-6 border-t border-slate-200 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {catalogTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{catalogSubtitle}</p>
        </div>

        <span className="self-start md:self-auto text-[11px] sm:text-xs font-bold text-slate-700 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 tabular-nums">
          {isLoading
            ? 'Consultando inventario...'
            : `${visibleProducts.length} de ${totalAvailableCount} artículos`}
        </span>
      </div>

      {/* Departamentos */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full min-w-0 max-w-full">
        {activeGroups.map((group) => {
          const isActive = group.CodGrupo === selectedGroup;
          return (
            <button
              key={group.CodGrupo}
              type="button"
              onClick={() => handleSelectGroup(group.CodGrupo)}
              className={cn(
                'px-3 sm:px-4 py-1.5 sm:py-2 min-h-[36px] text-xs font-extrabold rounded-xl transition-colors whitespace-nowrap cursor-pointer border shrink-0',
                isActive
                  ? 'bg-catador-blue text-white border-catador-blue'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-catador-blue hover:text-catador-blue'
              )}
            >
              {group.Nombre}
            </button>
          );
        })}
      </div>

      {/* Subgrupos */}
      {subgroups.length > 0 && (
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto p-1 sm:p-1.5 bg-slate-100 rounded-xl border border-slate-200/80 w-full min-w-0 max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectSubgroup('todos')}
            className={cn(
              'px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0',
              selectedSubgroup === 'todos'
                ? 'bg-catador-amber text-white'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            Todos
          </button>
          {subgroups.map((sub) => (
            <button
              key={sub.CodSubgrupo}
              type="button"
              onClick={() => handleSelectSubgroup(sub.CodSubgrupo)}
              className={cn(
                'px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0',
                sub.CodSubgrupo === selectedSubgroup
                  ? 'bg-catador-amber text-white'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              )}
            >
              {sub.Nombre}
            </button>
          ))}
        </div>
      )}

      {/* Grilla */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-4 space-y-2.5">
              <Skeleton className="aspect-[4/3] sm:aspect-square w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-3.5 w-1/3 rounded-md bg-slate-100" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">No se encontraron artículos en este subgrupo.</p>
        </div>
      ) : (
        <>
          <div
            key={`${selectedGroup}-${selectedSubgroup}`}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5"
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            {visibleCount < totalAvailableCount && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-catador-blue px-6 py-2.5 min-h-[42px] text-xs font-black text-slate-800 hover:text-catador-blue transition-colors cursor-pointer tabular-nums"
              >
                <span>
                  Cargar más (+{Math.min(PAGE_INCREMENT, totalAvailableCount - visibleCount)})
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            )}

            <Link
              href={`/catalogo/${selectedGroup}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 min-h-[42px] text-xs font-extrabold text-catador-blue transition-colors"
            >
              <span>Ver departamento {currentGroupName}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
