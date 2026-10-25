'use client';

import React, { useState } from 'react';
import { ArrowUpDown, Share2, Check, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';

interface CatalogFiltersBarProps {
  totalCount: number;
  displayedCount: number;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categoryTitle: string;
}

export function CatalogFiltersBar({
  totalCount,
  displayedCount,
  onlyInStock,
  onToggleInStock,
  sortBy,
  onSortChange,
  categoryTitle,
}: CatalogFiltersBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShareCategory = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `🛒 *Catálogo ${categoryTitle} - Gran Catador Barinas*\nRevisa los productos disponibles y precios en dólares y bolívares aquí:\n${url}`;
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200/80 shadow-2xs">
      {/* Contador de Productos */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700">
          Mostrando {displayedCount} de {totalCount} productos
        </span>
      </div>

      {/* Controles de Filtros y Acciones */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Toggle Solo en Stock */}
        <button
          type="button"
          onClick={() => onToggleInStock(!onlyInStock)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer',
            onlyInStock
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          )}
        >
          <PackageCheck className="h-3.5 w-3.5" />
          <span>Solo en Stock</span>
        </button>

        {/* Selector de Orden */}
        <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-2 py-1 rounded-lg">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="default">Por Disponibilidad</option>
            <option value="price_asc">Menor Precio ($)</option>
            <option value="price_desc">Mayor Precio ($)</option>
            <option value="name_asc">Nombre (A-Z)</option>
          </select>
        </div>

        {/* Compartir Categoría por WhatsApp */}
        <button
          type="button"
          onClick={handleShareCategory}
          title="Compartir esta categoría por WhatsApp"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Compartir</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : 'Copiar URL'}
        </button>
      </div>
    </div>
  );
}
