'use client';

import { useState } from 'react';
import { ArrowUpDown, Share2, Check, PackageCheck, DollarSign, Percent, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';
export type PriceRangeFilter = 'all' | 'under_5' | '5_to_15' | '15_to_40' | 'over_40';

interface CatalogFiltersBarProps {
  totalCount: number;
  displayedCount: number;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  onlyDeals?: boolean;
  onToggleDeals?: (val: boolean) => void;
  onlyBoxes?: boolean;
  onToggleBoxes?: (val: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange?: PriceRangeFilter;
  onPriceRangeChange?: (range: PriceRangeFilter) => void;
  categoryTitle: string;
}

export function CatalogFiltersBar({
  totalCount,
  displayedCount,
  onlyInStock,
  onToggleInStock,
  onlyDeals = false,
  onToggleDeals,
  onlyBoxes = false,
  onToggleBoxes,
  sortBy,
  onSortChange,
  priceRange = 'all',
  onPriceRangeChange,
  categoryTitle,
}: CatalogFiltersBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShareCategory = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `🛒 *Catálogo ${categoryTitle} - EL CATADOR. Barinas*\nRevisa los productos disponibles y precios en dólares y bolívares aquí:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        {onToggleDeals && (
          <button
            type="button"
            onClick={() => onToggleDeals(!onlyDeals)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full text-xs font-extrabold border transition-all cursor-pointer',
              onlyDeals
                ? 'bg-[#FEF3C7] text-[#8B3E03] border-[#EB9C53]'
                : 'bg-[#F7F8FA] text-slate-700 border-slate-200 hover:border-[#0F172A]'
            )}
          >
            <Percent className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5}/>
            <span>Solo Ofertas</span>
          </button>
        )}

        {onToggleBoxes && (
          <button
            type="button"
            onClick={() => onToggleBoxes(!onlyBoxes)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full text-xs font-extrabold border transition-all cursor-pointer',
              onlyBoxes
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-[#F7F8FA] text-slate-700 border-slate-200 hover:border-[#0F172A]'
            )}
          >
            <Package className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5}/>
            <span>Disponible por Caja</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleInStock(!onlyInStock)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full text-xs font-extrabold border transition-all cursor-pointer',
            onlyInStock
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-[#F7F8FA] text-slate-700 border-slate-200 hover:border-[#0F172A]'
          )}
        >
          <PackageCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5}/>
          <span>En Stock</span>
        </button>

        <span className="text-[13px] font-bold text-slate-600 tabular-nums ml-1">
          {displayedCount} de {totalCount} productos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 min-w-0">
        {onPriceRangeChange && (
          <div className="flex items-center gap-1.5 border border-slate-200 bg-[#F7F8FA] px-3 py-1 min-h-[40px] rounded-full min-w-0">
            <DollarSign className="h-3.5 w-3.5 text-[#D99B38] shrink-0" strokeWidth={1.5}/>
            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value as PriceRangeFilter)}
              aria-label="Filtrar por rango de precios"
              className="w-full min-w-0 truncate bg-transparent text-base md:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los precios</option>
              <option value="under_5">Menos de $5.00</option>
              <option value="5_to_15">$5.00 a $15.00</option>
              <option value="15_to_40">$15.00 a $40.00</option>
              <option value="over_40">Más de $40.00</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 border border-slate-200 bg-[#F7F8FA] px-3 py-1 min-h-[40px] rounded-full min-w-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0" strokeWidth={1.5}/>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Ordenar productos"
            className="w-full min-w-0 truncate bg-transparent text-base md:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="default">Más relevantes</option>
            <option value="price_asc">Menor Precio ($)</option>
            <option value="price_desc">Mayor Precio ($)</option>
            <option value="name_asc">Nombre (A-Z)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleShareCategory}
          title="Compartir esta categoría por WhatsApp"
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] rounded-full bg-[#0F172A] hover:bg-[#001754] text-white text-xs font-extrabold transition-colors cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5 shrink-0 text-[#EB9C53]" strokeWidth={1.5}/>
          <span>Compartir</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="hidden sm:flex items-center justify-center px-3.5 py-1.5 min-h-[40px] rounded-full border border-slate-200 bg-white hover:border-[#0F172A] text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#D99B38]" strokeWidth={1.5}/> : 'Copiar URL'}
        </button>
      </div>
    </div>
  );
}
