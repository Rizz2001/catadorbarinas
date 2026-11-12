'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product, TrendCategoryTab, WeeklyTrendsCmsConfig } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface WeeklyTrendsBentoProps {
  products: Product[];
  config: WeeklyTrendsCmsConfig;
}

export function WeeklyTrendsBento({ products, config }: WeeklyTrendsBentoProps) {
  const initialTab = config.tabs[0]?.id || 'mas_vendidos';
  const [activeTab, setActiveTab] = useState<TrendCategoryTab>(initialTab);

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

  if (!config.active || sortedProducts.length === 0) return null;

  const displayItems = sortedProducts.slice(0, config.maxItems || 4);

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-100 sm:border-slate-200/90 bg-white p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-4 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-3.5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="hidden sm:block text-[13px] text-slate-500 mt-1">{config.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto max-w-full overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-full border border-slate-200 shrink-0">
            {config.tabs.map(({ id, label }) => (
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
            href={config.viewAllHref}
            className="hidden md:inline-flex items-center gap-1 text-[13px] font-extrabold text-[#0F172A] hover:text-[#001754] transition-colors shrink-0"
          >
            <span>{config.viewAllLabel}</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div
        key={activeTab}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in-50 duration-200"
      >
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
