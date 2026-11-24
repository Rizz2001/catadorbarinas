'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { formatCatalogLabel, isAllSubgroup } from '@/lib/catalogFilters';

interface CatalogSubcategoryBarProps {
  subgroups: SmartVentasSubgroup[];
  selectedSubgroup: string;
  onSelectSubgroup: (cod: string) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
}

export function CatalogSubcategoryBar({
  subgroups,
  selectedSubgroup,
  onSelectSubgroup,
  activeFiltersCount,
  onOpenFilters,
}: CatalogSubcategoryBarProps) {
  const [stickyTop, setStickyTop] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const updateScrollHints = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const updateTopOffset = () => setStickyTop(Math.round(header.getBoundingClientRect().height));
    updateTopOffset();

    const observer = new ResizeObserver(updateTopOffset);
    observer.observe(header);
    window.addEventListener('resize', updateTopOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateTopOffset);
    };
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollHints();
    const observer = new ResizeObserver(updateScrollHints);
    observer.observe(el);
    return () => observer.disconnect();
  }, [subgroups, updateScrollHints]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedSubgroup]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  const allSelected = isAllSubgroup(selectedSubgroup);

  return (
    <div
      style={{ top: stickyTop }}
      className="sticky top-0 z-10 -mx-3 px-3 sm:-mx-4 sm:px-4 bg-white/95 backdrop-blur-md border-y border-slate-200/80 transition-[top] duration-150"
    >
      <div className="flex items-center gap-2 py-2">
        <div className="relative flex-1 min-w-0 flex items-center">
          {canScrollLeft && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
              <button
                type="button"
                onClick={() => scrollByDirection('left')}
                aria-label="Desplazar subcategorías a la izquierda"
                className="hidden md:flex absolute left-0 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={updateScrollHints}
            role="tablist"
            aria-label="Subcategorías del catálogo"
            className="flex flex-nowrap items-center gap-1.5 overflow-x-auto hide-scrollbar scrollbar-none snap-x w-full py-0.5"
          >
            <button
              ref={allSelected ? activeItemRef : undefined}
              type="button"
              role="tab"
              aria-selected={allSelected}
              onClick={() => onSelectSubgroup('todos')}
              className={`px-3.5 py-2 shrink-0 snap-start whitespace-nowrap min-h-[38px] sm:min-h-[40px] flex items-center text-[13px] sm:text-sm rounded-full transition-colors cursor-pointer ${
                allSelected
                  ? 'bg-[#0F172A] text-white font-semibold shadow-2xs'
                  : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              Todos
            </button>

            {subgroups.map((sub) => {
              const isActive = selectedSubgroup === sub.CodSubgrupo;
              return (
                <button
                  key={sub.CodSubgrupo}
                  ref={isActive ? activeItemRef : undefined}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectSubgroup(sub.CodSubgrupo)}
                  className={`px-3.5 py-2 shrink-0 snap-start whitespace-nowrap min-h-[38px] sm:min-h-[40px] flex items-center text-[13px] sm:text-sm rounded-full transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0F172A] text-white font-semibold shadow-2xs'
                      : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {formatCatalogLabel(sub.Nombre)}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
              <button
                type="button"
                onClick={() => scrollByDirection('right')}
                aria-label="Desplazar subcategorías a la derecha"
                className="hidden md:flex absolute right-0 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        <div className="shrink-0 pl-2 border-l border-slate-200/90">
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label="Abrir filtros avanzados"
            className={`min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-2 rounded-full text-[13px] sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border transition-colors whitespace-nowrap cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#0F172A] text-white border-[#0F172A] hover:bg-slate-800'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[#0F172A] text-[11px] font-bold tabular-nums">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
