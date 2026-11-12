'use client';

import { useEffect, useState } from 'react';
import { Check, Link2, RotateCcw, Share2, X } from 'lucide-react';
import { SmartVentasGroup, SmartVentasSubgroup } from '@/components/ecommerce/LiveCatalogSection';
import { BrandFilterOption, PriceRangeFilter, SortOption } from './catalogFilterTypes';
import { CatalogFilterSections } from './CatalogFilterSections';

interface CatalogFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  categoryTitle: string;
  activeFiltersCount: number;
  onResetFilters: () => void;
  groups: SmartVentasGroup[];
  selectedGroup: string;
  onSelectGroup: (cod: string) => void;
  subgroups: SmartVentasSubgroup[];
  selectedSubgroup: string;
  onSelectSubgroup: (cod: string) => void;
  brands: BrandFilterOption[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  priceRange: PriceRangeFilter;
  onPriceRangeChange: (range: PriceRangeFilter) => void;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  onlyDeals: boolean;
  onToggleDeals: (val: boolean) => void;
  onlyBoxes: boolean;
  onToggleBoxes: (val: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function CatalogFiltersDrawer({
  isOpen,
  onClose,
  totalCount,
  categoryTitle,
  activeFiltersCount,
  onResetFilters,
  groups,
  selectedGroup,
  onSelectGroup,
  subgroups,
  selectedSubgroup,
  onSelectSubgroup,
  brands,
  selectedBrand,
  onSelectBrand,
  priceRange,
  onPriceRangeChange,
  onlyInStock,
  onToggleInStock,
  onlyDeals,
  onToggleDeals,
  onlyBoxes,
  onToggleBoxes,
  sortBy,
  onSortChange,
}: CatalogFiltersDrawerProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const text = `Mira los productos de ${categoryTitle} en El Catador:\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Filtros del catálogo">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-w-full flex sm:pl-10">
        <aside className="w-full sm:w-screen sm:max-w-md max-h-[88dvh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-slate-200" />
          </div>

          <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Filtros avanzados</h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {categoryTitle} · {totalCount} {totalCount === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar filtros"
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <CatalogFilterSections
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={(cod) => {
                onSelectGroup(cod);
                onClose();
              }}
              subgroups={subgroups}
              selectedSubgroup={selectedSubgroup}
              onSelectSubgroup={onSelectSubgroup}
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={onSelectBrand}
              priceRange={priceRange}
              onPriceRangeChange={onPriceRangeChange}
              onlyInStock={onlyInStock}
              onToggleInStock={onToggleInStock}
              onlyDeals={onlyDeals}
              onToggleDeals={onToggleDeals}
              onlyBoxes={onlyBoxes}
              onToggleBoxes={onToggleBoxes}
              sortBy={sortBy}
              onSortChange={onSortChange}
            />
          </div>

          <footer className="px-5 py-4 border-t border-slate-100 bg-white flex items-center gap-2.5 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              aria-label="Compartir catálogo por WhatsApp"
              className="w-11 h-11 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              aria-label="Copiar enlace del catálogo"
              className="w-11 h-11 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} /> : <Link2 className="w-4 h-4" strokeWidth={1.75} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 transition-colors cursor-pointer tabular-nums"
            >
              Ver {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

