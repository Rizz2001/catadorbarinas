'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <section className="space-y-3.5 sm:space-y-4 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 border-b border-slate-200 pb-3 sm:pb-3.5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {customTitle || 'Tendencias de la Semana'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
            {customSubtitle || 'Artículos con mayor rotación en Barinas y disponibilidad inmediata'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto max-w-full overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/90 shrink-0">
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
                  'px-2.5 sm:px-3 py-1.5 min-h-[34px] text-[11px] sm:text-xs font-extrabold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0',
                  activeTab === id
                    ? 'bg-catador-blue text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="hidden md:inline-flex items-center gap-1 text-xs font-extrabold text-catador-blue hover:text-catador-blue-light transition-colors shrink-0"
          >
            <span>Ver catálogo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        key={activeTab}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5 animate-in fade-in-50 duration-200"
      >
        {displayItems.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            className={index === 5 ? 'lg:hidden' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
