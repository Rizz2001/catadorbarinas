'use client';

import { RotateCcw, X } from 'lucide-react';
import { PriceRangeFilter, SortOption } from './catalogFilterTypes';

interface CatalogActiveFiltersBarProps {
  totalCount: number;
  onlyInStock: boolean;
  onClearInStock: () => void;
  onlyDeals: boolean;
  onClearDeals: () => void;
  onlyBoxes: boolean;
  onClearBoxes: () => void;
  selectedBrand: string;
  onClearBrand: () => void;
  priceRange: PriceRangeFilter;
  onClearPriceRange: () => void;
  sortBy: SortOption;
  onClearSort: () => void;
  onResetAll: () => void;
}

const PRICE_LABELS: Record<Exclude<PriceRangeFilter, 'all'>, string> = {
  under_5: 'Menos de $5',
  '5_to_15': '$5 a $15',
  '15_to_40': '$15 a $40',
  over_40: 'Más de $40',
};

const SORT_LABELS: Record<Exclude<SortOption, 'default'>, string> = {
  price_asc: 'Menor precio',
  price_desc: 'Mayor precio',
  name_asc: 'Nombre A–Z',
};

export function CatalogActiveFiltersBar({
  totalCount,
  onlyInStock,
  onClearInStock,
  onlyDeals,
  onClearDeals,
  onlyBoxes,
  onClearBoxes,
  selectedBrand,
  onClearBrand,
  priceRange,
  onClearPriceRange,
  sortBy,
  onClearSort,
  onResetAll,
}: CatalogActiveFiltersBarProps) {
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (onlyInStock) chips.push({ key: 'stock', label: 'Solo disponibles', onRemove: onClearInStock });
  if (onlyDeals) chips.push({ key: 'deals', label: 'En oferta', onRemove: onClearDeals });
  if (onlyBoxes) chips.push({ key: 'boxes', label: 'Por caja', onRemove: onClearBoxes });
  if (selectedBrand !== 'all') chips.push({ key: 'brand', label: selectedBrand, onRemove: onClearBrand });
  if (priceRange !== 'all') chips.push({ key: 'price', label: PRICE_LABELS[priceRange], onRemove: onClearPriceRange });
  if (sortBy !== 'default') chips.push({ key: 'sort', label: SORT_LABELS[sortBy], onRemove: onClearSort });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-0.5 text-xs">
      <span className="text-slate-500 tabular-nums font-medium mr-1">
        {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
      </span>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-medium px-2.5 py-1 transition-colors cursor-pointer"
        >
          <span>{chip.label}</span>
          <X className="w-3 h-3 text-slate-500" strokeWidth={2} />
        </button>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="inline-flex items-center gap-1 ml-auto font-semibold text-slate-600 hover:text-slate-900 py-1 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Limpiar</span>
      </button>
    </div>
  );
}
