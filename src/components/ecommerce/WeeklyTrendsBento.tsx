'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface WeeklyTrendsBentoProps {
  products: Product[];
  starProduct?: Product;
}

type TabType = 'bestseller' | 'deals' | 'new';

export function WeeklyTrendsBento({ products }: WeeklyTrendsBentoProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bestseller');

  // Filtrado reactivo según la pestaña seleccionada
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (activeTab === 'deals') {
      return list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }
    if (activeTab === 'new') {
      return [...list].reverse();
    }
    // 'bestseller' (Por defecto)
    return list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
  }, [products, activeTab]);

  // Selección compacta de 5 productos de tendencia para una fila equilibrada
  const displayItems = sortedProducts.slice(0, 5);

  return (
    <section className="space-y-4">
      {/* Cabecera compacta con Pestañas y Enlace rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-catador-amber">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Tendencias de la Semana
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300/60">
                Top 5
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Artículos con mayor demanda en Barinas y disponibilidad inmediata
            </p>
          </div>
        </div>

        {/* Píldoras de Filtro y Link de catálogo */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            {[
              { id: 'bestseller' as const, label: 'Más Vendidos', icon: Flame },
              { id: 'deals' as const, label: 'Ofertas Top', icon: Sparkles },
              { id: 'new' as const, label: 'Novedades', icon: Star },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  activeTab === id
                    ? 'bg-catador-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors ml-1"
          >
            Ver más <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Fila Única Esbelta y Simétrica (5 Columnas en Desktop) */}
      <div
        key={activeTab}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 animate-in fade-in-50 duration-300 fill-mode-both"
      >
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
