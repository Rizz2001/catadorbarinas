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

  return (
    <section className="rounded-xl border-2 border-catador-blue bg-white p-3.5 sm:p-6 min-w-0 max-w-full overflow-hidden">
      {/* Cabecera Editorial de Ofertas */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 pb-3.5 sm:pb-4 mb-3.5 sm:mb-5 border-b border-slate-200/80">
        <div className="border-l-4 border-catador-amber pl-3 min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {customTitle || 'Ofertas Destacadas del Día'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
            Precios especiales por tiempo limitado en licores y despensa seleccionada
          </p>
        </div>

        {/* Temporizador Regresivo Tabular (Cajitas Ámbar Oficiales) */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600">Cierra en:</span>
          <div
            className="flex items-center gap-1 tabular-nums text-xs sm:text-sm font-black text-white"
            suppressHydrationWarning
          >
            <span
              className="bg-catador-amber px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md min-w-[30px] sm:min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.hours).padStart(2, '0') : '12'}h
            </span>
            <span className="text-catador-amber font-black">:</span>
            <span
              className="bg-catador-amber px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md min-w-[30px] sm:min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}m
            </span>
            <span className="text-catador-amber font-black">:</span>
            <span
              className="bg-catador-amber px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md min-w-[30px] sm:min-w-[34px] text-center"
              suppressHydrationWarning
            >
              {isMounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}s
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Productos en Oferta */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} isCompact />
        ))}
      </div>
    </section>
  );
}
