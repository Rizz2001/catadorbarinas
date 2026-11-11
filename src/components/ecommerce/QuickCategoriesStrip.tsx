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
  ChevronRight,
  Plus,
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

const RIBBON_ACCENTS = [
  'bg-[#0F172A] text-[#0F172A] border-[#0F172A]',
  'bg-[#D99B38] text-[#8B3E03] border-[#D99B38]',
  'bg-[#001754] text-[#001754] border-[#001754]',
  'bg-[#B6683E] text-[#8B3E03] border-[#B6683E]',
];

const DEFAULT_QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: 'cat-whisky',
    nombre: 'Whisky & Ron',
    descripcion: 'Escoceses y reservas',
    icono: 'Wine',
    url: '/catalogo/01',
    orden: 1,
    activo: true,
  },
  {
    id: 'cat-cervezas',
    nombre: 'Cervezas',
    descripcion: 'Polar, Solera y Corona',
    icono: 'CupSoda',
    url: '/catalogo/09',
    orden: 2,
    activo: true,
  },
  {
    id: 'cat-vinos',
    nombre: 'Vinos & Cavas',
    descripcion: 'Tintos, blancos y espumosos',
    icono: 'Wine',
    url: '/catalogo/01/04',
    orden: 3,
    activo: true,
  },
  {
    id: 'cat-refrescos',
    nombre: 'Refrescos & Agua',
    descripcion: 'Bebidas y mezcladores',
    icono: 'CupSoda',
    url: '/catalogo/02',
    orden: 4,
    activo: true,
  },
  {
    id: 'cat-despensa',
    nombre: 'Despensa & Snacks',
    descripcion: 'Víveres y confitería',
    icono: 'ShoppingBasket',
    url: '/catalogo/11',
    orden: 5,
    activo: true,
  },
  {
    id: 'cat-hielo',
    nombre: 'Hielo & Carbón',
    descripcion: 'Listos para tu evento',
    icono: 'Snowflake',
    url: '/catalogo/03',
    orden: 6,
    activo: true,
  },
];

export function QuickCategoriesStrip({ categories }: QuickCategoriesStripProps) {
  const activeCategories =
    categories && categories.length > 0 ? categories : DEFAULT_QUICK_CATEGORIES;

  return (
    <nav aria-label="Departamentos Principales">
      {/* Móvil: Tarjetas limpias 2x2 con cintillo inferior diagonal '+' */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
        {activeCategories.slice(0, 6).map((cat, idx) => {
          const Icon = ICON_MAP[cat.icono] || Wine;
          const accent = RIBBON_ACCENTS[idx % RIBBON_ACCENTS.length];
          const [bgClass, textClass, borderClass] = accent.split(' ');
          return (
            <Link
              key={cat.id || cat.nombre}
              href={cat.url}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 flex flex-col justify-between min-h-[118px]"
            >
              <div className="flex-1 flex flex-col items-center justify-center p-2.5 text-center gap-1.5">
                <div className="h-11 w-11 rounded-full bg-[#FEF3C7]/70 border border-[#EB9C53]/50 flex items-center justify-center text-[#8B3E03]">
                  <Icon className="h-5 w-5" />
                </div>
                {cat.descripcion && (
                  <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                    {cat.descripcion}
                  </span>
                )}
              </div>

              <div className={`flex items-center justify-between border-b-4 pl-3 ${borderClass}`}>
                <span className={`text-[13px] font-extrabold truncate py-1.5 ${textClass}`}>
                  {cat.nombre}
                </span>
                <span
                  className={`inline-flex items-center justify-center px-3 py-1.5 text-white ${bgClass}`}
                  style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                  <Plus className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop / Tablet: Píldoras horizontales en una sola línea estilo Opción C */}
      <div className="hidden sm:flex items-center justify-center gap-2.5 lg:gap-3.5 overflow-x-auto no-scrollbar pt-1">
        {activeCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icono] || Wine;
          return (
            <Link
              key={cat.id || cat.nombre}
              href={cat.url}
              className="group inline-flex items-center gap-2 rounded-full bg-white pl-1.5 pr-3.5 py-1.5 border border-slate-200 shadow-2xs hover:border-[#0F172A] transition-all duration-150 shrink-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 text-[#8B3E03] group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-colors duration-150">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-extrabold text-slate-900 group-hover:text-[#0F172A] whitespace-nowrap">
                {cat.nombre}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0F172A] shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
