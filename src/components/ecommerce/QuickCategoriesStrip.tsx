'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wine,
  ShoppingBasket,
  Sandwich,
  Cookie,
  CupSoda,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { QuickCategory } from '@/types';

interface QuickCategoriesStripProps {
  categories: QuickCategory[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wine,
  CupSoda,
  ShoppingBasket,
  Cookie,
  Sandwich,
  Sparkles,
};

export function QuickCategoriesStrip({ categories }: QuickCategoriesStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <nav
      aria-label="Departamentos Principales"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
    >
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icono] || Wine;
        return (
          <Link
            key={cat.id || cat.nombre}
            href={cat.url}
            className="group relative flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-3.5 border border-slate-200/90 hover:border-catador-blue transition-colors duration-150 min-w-0"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-catador-blue group-hover:bg-catador-blue group-hover:text-white transition-colors duration-150">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold text-slate-900 group-hover:text-catador-blue truncate transition-colors">
                {cat.nombre}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-medium text-slate-500 truncate mt-0.5">
                {cat.descripcion}
              </span>
            </div>
            <ArrowUpRight className="hidden xs:block h-3.5 w-3.5 text-slate-300 group-hover:text-catador-amber shrink-0 transition-colors" />
          </Link>
        );
      })}
    </nav>
  );
}

