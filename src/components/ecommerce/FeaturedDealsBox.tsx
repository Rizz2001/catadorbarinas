'use client';

import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useCountdown } from '@/hooks/useCountdown';

interface FeaturedDealsBoxProps {
  products: Product[];
  targetEndTime?: string;
  customTitle?: string | null;
}

export function FeaturedDealsBox({ products, targetEndTime, customTitle }: FeaturedDealsBoxProps) {
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
    <section className="rounded-2xl border-2 border-catador-blue bg-white p-4 md:p-5 shadow-sm">
      {/* Cabecera de Ofertas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-catador-blue text-white">
            <Flame className="h-5 w-5 text-catador-amber fill-catador-amber" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              {customTitle || 'Ofertas Destacadas del Día'}
            </h2>
            <p className="text-xs text-slate-600 hidden sm:block">
              Precios especiales por tiempo limitado en Gran Catador
            </p>
          </div>
        </div>

        {/* Temporizador Regresivo (Cajitas Ámbar) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-auto bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 max-w-full">
          <Clock className="h-4 w-4 text-catador-amber shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Termina en:</span>
          <div
            className="flex items-center gap-1 font-mono text-xs font-bold text-white"
            suppressHydrationWarning
          >
            <span className="bg-catador-amber px-1.5 sm:px-2 py-0.5 rounded shadow-xs" suppressHydrationWarning>
              {isMounted ? String(timeLeft.hours).padStart(2, '0') : '12'}h
            </span>
            <span className="text-catador-amber font-bold">:</span>
            <span className="bg-catador-amber px-1.5 sm:px-2 py-0.5 rounded shadow-xs" suppressHydrationWarning>
              {isMounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}m
            </span>
            <span className="text-catador-amber font-bold">:</span>
            <span className="bg-catador-amber px-1.5 sm:px-2 py-0.5 rounded shadow-xs animate-pulse" suppressHydrationWarning>
              {isMounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}s
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Productos en Oferta (Simétrico: 2 en móvil, 3 en tablet, 6 en desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} isCompact />
        ))}
      </div>
    </section>
  );
}
