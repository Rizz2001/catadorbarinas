'use client';

import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { CategoryPillNode } from '@/types';
import { DynamicLucideIcon } from '@/components/ui';

interface QuickCategoriesStripProps {
  categories: CategoryPillNode[];
}

const RIBBON_ACCENTS = [
  'bg-[#0F172A] text-[#0F172A] border-[#0F172A]',
  'bg-[#D99B38] text-[#8B3E03] border-[#D99B38]',
  'bg-[#001754] text-[#001754] border-[#001754]',
  'bg-[#B6683E] text-[#8B3E03] border-[#B6683E]',
];

export function QuickCategoriesStrip({ categories }: QuickCategoriesStripProps) {
  const activeCategories = categories.filter(
    (cat) => (cat.show_on_homepage ?? cat.activo) !== false
  );
  if (activeCategories.length === 0) return null;

  return (
    <nav aria-label="Departamentos Principales">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 scrollbar-none sm:hidden">
        {activeCategories.map((cat, idx) => {
          const accent = RIBBON_ACCENTS[idx % RIBBON_ACCENTS.length];
          const [bgClass, textClass, borderClass] = accent.split(' ');
          const iconName = cat.icon_name || cat.icono;
          return (
            <Link
              key={cat.id || cat.nombre}
              href={cat.url}
              className="w-[132px] shrink-0 snap-start group relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between min-h-[96px]"
            >
              <div className="flex-1 flex flex-col items-center justify-center p-2.5 text-center">
                <div className="h-10 w-10 rounded-full bg-[#FEF3C7]/80 border border-[#EB9C53]/50 flex items-center justify-center text-[#8B3E03]">
                  <DynamicLucideIcon
                    name={iconName}
                    fallback="Wine"
                    className="w-5 h-5"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between border-b-4 pl-2.5 ${borderClass}`}>
                <span className={`text-xs font-extrabold truncate py-1.5 ${textClass}`}>
                  {cat.nombre}
                </span>
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-1.5 text-white ${bgClass}`}
                  style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                  <Plus className="w-3 h-3" strokeWidth={2} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="hidden sm:flex items-center justify-center gap-2.5 lg:gap-3.5 overflow-x-auto no-scrollbar pt-1">
        {activeCategories.map((cat) => (
          <Link
            key={cat.id || cat.nombre}
            href={cat.url}
            className="group inline-flex items-center gap-2 rounded-full bg-white pl-1.5 pr-3.5 py-1.5 border border-slate-200 shadow-2xs hover:border-[#0F172A] transition-all duration-150 shrink-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 text-[#8B3E03] group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-colors duration-150">
              <DynamicLucideIcon
                name={cat.icon_name || cat.icono}
                fallback="Wine"
                className="w-4 h-4"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[13px] font-extrabold text-slate-900 group-hover:text-[#0F172A] whitespace-nowrap">
              {cat.nombre}
            </span>
            <ChevronRight
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F172A] shrink-0 transition-colors"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
