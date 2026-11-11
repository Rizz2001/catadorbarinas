'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product, TrendCategoryTab } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface WeeklyTrendsBentoProps {
  products: Product[];
  starProduct?: Product;
  customTitle?: string | null;
  customSubtitle?: string | null;
}

export function WeeklyTrendsBento({
  products,
  customTitle,
  customSubtitle,
}: WeeklyTrendsBentoProps) {
  const [activeTab, setActiveTab] = useState<TrendCategoryTab>('mas_vendidos');

  const sortedProducts = useMemo(() => {
    const pinnedInTab = products.filter(
      (p) => p.isWeeklyTrend && (p.trendTab || 'mas_vendidos') === activeTab
    );
    const rest = products.filter(
      (p) => !(p.isWeeklyTrend && (p.trendTab || 'mas_vendidos') === activeTab)
    );

    if (activeTab === 'ofertas') {
      rest.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (activeTab === 'nuevos') {
      rest.reverse();
    } else {
      rest.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return [...pinnedInTab, ...rest];
  }, [products, activeTab]);

  const displayItems = sortedProducts.slice(0, 6);

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {customTitle || 'Selección del Catador · Por Unidad o Caja'}
          </h2>
          <p className="text-[13px] text-slate-600 mt-1">
            {customSubtitle || 'Artículos con mayor rotación en Barinas y disponibilidad inmediata'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto max-w-full overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-full border border-slate-200 shrink-0">
            {[
              { id: 'mas_vendidos' as const, label: 'Más Vendidos' },
              { id: 'ofertas' as const, label: 'En Oferta' },
              { id: 'nuevos' as const, label: 'Novedades' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'px-3.5 py-1.5 min-h-[34px] text-xs sm:text-[13px] font-extrabold rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0',
                  activeTab === id
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-700 hover:text-[#0F172A]'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="hidden md:inline-flex items-center gap-1 text-[13px] font-extrabold text-[#0F172A] hover:text-[#001754] transition-colors shrink-0"
          >
            <span>Ver todo</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        key={activeTab}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in-50 duration-200"
      >
        {displayItems.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
