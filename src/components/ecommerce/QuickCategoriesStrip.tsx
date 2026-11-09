'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wine,
  ShoppingBasket,
  Sandwich,
  Cookie,
  CupSoda,
  Snowflake,
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
  Snowflake,
  Sparkles: Snowflake,
};

export function QuickCategoriesStrip({ categories }: QuickCategoriesStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <nav
      aria-label="Departamentos Principales"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3"
    >
      {categories.map((cat) => {
        const Icon = ICON_MAP[cat.icono] || Wine;
        return (
          <Link
            key={cat.id || cat.nombre}
            href={cat.url}
            className="group relative flex items-center gap-3 rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200 hover:border-catador-blue transition-colors duration-150 min-w-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-catador-blue group-hover:bg-catador-blue group-hover:text-white transition-colors duration-150">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] sm:text-sm font-black text-slate-900 group-hover:text-catador-blue truncate transition-colors">
                {cat.nombre}
              </span>
              <span className="block text-xs font-medium text-slate-600 truncate mt-0.5">
                {cat.descripcion}
              </span>
            </div>
            <ArrowUpRight className="hidden xs:block h-4 w-4 text-slate-400 group-hover:text-catador-blue shrink-0 transition-colors" />
          </Link>
        );
      })}
    </nav>
  );
}
