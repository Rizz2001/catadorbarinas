'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useCountdown } from '@/hooks/useCountdown';

interface FeaturedDealsBoxProps {
  products: Product[];
  targetEndTime?: string;
  customTitle?: string | null;
}

export function FeaturedDealsBox({
  products,
  targetEndTime,
  customTitle,
}: FeaturedDealsBoxProps) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [defaultEndTime] = React.useState(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  );
  const timeLeft = useCountdown(targetEndTime || defaultEndTime);

  if (!products || products.length === 0) return null;

  /* Pre-emit critique: P5 H5 E5 S5 R5 V5 D5 */
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 pb-3.5 sm:pb-4 mb-3.5 sm:mb-5 border-b border-slate-100">
        <div className="min-w-0 space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#8B3E03]">
            <span className="h-2 w-2 rounded-full bg-[#D99B38] animate-pulse" />
            <span>Tiempo Limitado · Tasa BCV Oficial</span>
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {customTitle || 'Ofertas Destacadas del Día'}
          </h2>
          <p className="text-[13px] sm:text-sm text-slate-600">
            Precios especiales por tiempo limitado en licores y despensa seleccionada
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[13px] font-bold text-slate-700">Cierra en:</span>
          <div
            className="flex items-center gap-1 tabular-nums text-xs sm:text-sm font-black"
            suppressHydrationWarning
          >
            <span
              className="bg-catador-amber-soft border border-catador-amber-oak/70 text-[#8B3E03] px-2 py-1 rounded-lg min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.hours).padStart(2, '0') : '12'}h
            </span>
            <span className="text-catador-amber-dark font-black">:</span>
            <span
              className="bg-catador-amber-soft border border-catador-amber-oak/70 text-[#8B3E03] px-2 py-1 rounded-lg min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}m
            </span>
            <span className="text-catador-amber-dark font-black">:</span>
            <span
              className="bg-catador-amber-soft border border-catador-amber-oak/70 text-[#8B3E03] px-2 py-1 rounded-lg min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}s
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
