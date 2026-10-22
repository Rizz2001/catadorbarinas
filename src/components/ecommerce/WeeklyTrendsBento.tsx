'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { formatPrices } from '@/lib/currency';
import { useBcvStore } from '@/store/useBcvStore';
import { useCartStore } from '@/store/useCartStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface WeeklyTrendsBentoProps {
  products: Product[];
  starProduct?: Product;
}

export function WeeklyTrendsBento({ products, starProduct }: WeeklyTrendsBentoProps) {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'deals' | 'new'>('bestseller');
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const addItem = useCartStore((state) => state.addItem);

  const heroItem = starProduct || products[0];
  const sideItems = products.filter((p) => p.id !== heroItem?.id);
  const leftItems = sideItems.slice(0, 2);
  const rightItems = sideItems.slice(2, 4);

  const heroPrices = heroItem ? formatPrices(heroItem.priceUsd, bcvRate) : null;

  return (
    <section className="space-y-4">
      {/* Cabecera con Pestañas de Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-catador-amber" />
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Tendencias de la Semana
          </h2>
        </div>

        {/* Píldoras de Filtro */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('bestseller')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors',
              activeTab === 'bestseller'
                ? 'bg-catador-blue text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Más Vendidos
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors',
              activeTab === 'deals'
                ? 'bg-catador-blue text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Ofertas
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-lg transition-colors',
              activeTab === 'new'
                ? 'bg-catador-blue text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Novedades
          </button>
        </div>
      </div>

      {/* Bento Grid Asimétrico de 5 Columnas en Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Columnas Izquierdas (1 y 2) */}
        <div className="space-y-4 flex flex-col justify-between">
          {leftItems[0] && <ProductCard product={leftItems[0]} />}
          {leftItems[1] && <ProductCard product={leftItems[1]} />}
        </div>

        {/* Columna Central: Producto Estrella (row-span-2) */}
        {heroItem && (
          <div className="lg:col-span-1 flex flex-col rounded-2xl bg-gradient-to-b from-white to-slate-50 border-2 border-catador-blue/30 p-5 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden group">
            <span className="self-start rounded-full bg-catador-amber px-2.5 py-1 text-[11px] font-bold text-white shadow-xs mb-3 flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> Estrella de la Semana
            </span>

            <div className="relative aspect-4/5 w-full my-auto overflow-hidden rounded-xl bg-white p-3 flex items-center justify-center">
              <Image
                src={heroItem.images[0] || IMAGE_FALLBACKS.product}
                alt={heroItem.name}
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-xs font-semibold text-catador-amber uppercase">
                {heroItem.brand}
              </span>
              <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-0.5">
                {heroItem.name}
              </h3>

              {heroPrices && (
                <div className="my-2.5">
                  <p className="text-xl font-extrabold text-catador-blue leading-none">
                    {heroPrices.usdFormatted}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {heroPrices.vesFormatted}
                  </p>
                </div>
              )}

              <button
                onClick={() => addItem(heroItem, 1)}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-catador-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-catador-blue-light transition-colors"
              >
                <ShoppingBag className="h-4 w-4" /> Agregar al Carrito
              </button>
            </div>
          </div>
        )}

        {/* Columnas Derechas (4 y 5) */}
        <div className="space-y-4 flex flex-col justify-between">
          {rightItems[0] && <ProductCard product={rightItems[0]} />}
          {rightItems[1] && <ProductCard product={rightItems[1]} />}
        </div>
      </div>
    </section>
  );
}
