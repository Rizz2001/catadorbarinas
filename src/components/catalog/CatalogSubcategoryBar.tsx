'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { isAllSubgroup } from '@/lib/catalogFilters';

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
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const updateTopOffset = () => {
      setStickyTop(Math.round(header.getBoundingClientRect().height));
    };

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
    activeItemRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedSubgroup]);

  return (
    <div
      style={{ top: stickyTop }}
      className="sticky top-0 z-10 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-[top] duration-150"
    >
      <div
        role="tablist"
        aria-label="Subcategorías del catálogo"
        className="flex flex-nowrap items-center gap-1 overflow-x-auto hide-scrollbar snap-x py-2"
      >
        <button
          ref={isAllSubgroup(selectedSubgroup) ? activeItemRef : undefined}
          type="button"
          role="tab"
          aria-selected={isAllSubgroup(selectedSubgroup)}
          onClick={() => onSelectSubgroup('todos')}
          className={`px-4 py-2 shrink-0 snap-start whitespace-nowrap min-h-[40px] flex items-center text-sm rounded-full transition-colors cursor-pointer ${
            isAllSubgroup(selectedSubgroup)
              ? 'bg-slate-100 text-slate-900 font-semibold'
              : 'font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/70'
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
              className={`px-4 py-2 shrink-0 snap-start whitespace-nowrap min-h-[40px] flex items-center text-sm rounded-full transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50/70'
              }`}
            >
              {sub.Nombre}
            </button>
          );
        })}

        <div className="ml-auto sticky right-0 z-10 shrink-0 flex items-center pl-6 py-0.5 bg-gradient-to-l from-white/95 via-white/85 to-transparent">
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label="Abrir filtros avanzados"
            className={`min-h-[40px] px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border backdrop-blur-md transition-colors whitespace-nowrap cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                : 'bg-white/90 text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-slate-900 text-[11px] font-bold tabular-nums">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

