'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { QuickCategory } from '@/types';

interface QuickCategoriesStripProps {
  categories: QuickCategory[];
}

export function QuickCategoriesStrip({ categories }: QuickCategoriesStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <nav
      aria-label="Departamentos Principales"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-white border border-slate-200 rounded-xl divide-x divide-y lg:divide-y-0 divide-slate-200 overflow-hidden"
    >
      {categories.map((cat, idx) => (
        <Link
          key={cat.id || cat.nombre}
          href={cat.url}
          className={`group relative flex items-center justify-between gap-2 p-3 sm:p-4 bg-white hover:bg-slate-50/80 transition-colors duration-150 min-w-0 border-t-2 ${
            idx === 0
              ? 'border-t-catador-blue'
              : 'border-t-transparent hover:border-t-catador-blue'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-[13px] font-black text-slate-900 group-hover:text-catador-blue truncate transition-colors">
              {cat.nombre}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-medium text-slate-500 truncate mt-0.5">
              {cat.descripcion}
            </span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-catador-amber shrink-0 transition-colors" />
        </Link>
      ))}
    </nav>
  );
}
