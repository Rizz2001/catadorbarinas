'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  isCompact?: boolean;
}

export function ProductCard({ product, className, isCompact = false }: ProductCardProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  const rawImage = product.images?.[0];
  const isNoImage = !rawImage || rawImage === IMAGE_FALLBACKS.product || rawImage.includes('logo');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const displaySrc = isNoImage || hasError ? cmsLogo : rawImage;

  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const prices = formatPrices(product.priceUsd, bcvRate);
  const hasDiscount = Boolean(product.originalPriceUsd && product.originalPriceUsd > product.priceUsd);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/8 hover:border-catador-blue/40',
        className
      )}
    >
      {/* Badge de Descuento o Agotado */}
      {hasDiscount && product.discountPercentage ? (
        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 rounded-full bg-catador-discount px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black text-white shadow-xs">
          -{product.discountPercentage}%
        </span>
      ) : !product.inStock ? (
        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 rounded-full bg-slate-600/90 px-2 sm:px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
          Agotado
        </span>
      ) : null}

      {/* Imagen del Producto con Cápsula Estilizada */}
      <Link
        href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded-xl flex items-center justify-center p-2 sm:p-3 mb-2 sm:mb-2.5 block transition-colors duration-200',
          isNoImage || hasError
            ? 'bg-gradient-to-br from-slate-50 to-amber-50/30 border border-slate-100'
            : 'bg-slate-50/80 group-hover:bg-slate-100/50'
        )}
      >
        <Image
          src={displaySrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 20vw"
          className={cn(
            'object-contain transition-transform duration-300 ease-out',
            isNoImage || hasError
              ? 'p-6 sm:p-8 opacity-85 group-hover:scale-105'
              : 'group-hover:scale-108'
          )}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </Link>

      {/* Detalles del Producto */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-black text-amber-700/80 uppercase tracking-wider truncate">
            {product.brand}
          </span>
          {product.sku && (
            <span className="hidden xs:inline text-[9px] font-mono font-semibold text-slate-400 shrink-0">
              #{product.sku.slice(-6)}
            </span>
          )}
        </div>

        <Link
          href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
        >
          <h3
            className={cn(
              'font-extrabold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-catador-blue transition-colors',
              isCompact ? 'text-xs min-h-[32px]' : 'text-xs sm:text-sm min-h-[34px] sm:min-h-[40px]'
            )}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1 mb-1.5 sm:mb-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current',
                  i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'
                )}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-500">({product.reviewsCount})</span>
        </div>

        {/* Bimonetarismo Estricto con Tipografía Premium y Píldora Contable */}
        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-slate-100 flex items-end justify-between gap-1.5 sm:gap-2">
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span
              className={cn(
                'font-black tracking-tight leading-none text-slate-900',
                isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
                hasDiscount ? 'text-catador-discount' : 'text-slate-900'
              )}
            >
              {prices.usdFormatted}
            </span>
            <span className="inline-flex items-center font-mono text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100/90 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200/70 mt-1 tracking-tight truncate max-w-full">
              {prices.vesFormatted}
            </span>
          </div>

          {/* Botón de Agregar con Micro-Animación Elástica */}
          <button
            onClick={handleAddToCart}
            type="button"
            disabled={!product.inStock}
            aria-label={`Agregar ${product.name} al carrito`}
            className={cn(
              'flex items-center justify-center rounded-xl h-10 w-10 sm:min-h-[44px] sm:min-w-[44px] shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-catador-blue cursor-pointer shadow-xs',
              !product.inStock
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : isAdded
                ? 'bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                : 'bg-catador-blue text-white hover:bg-catador-blue-light hover:shadow-md hover:shadow-catador-blue/20 active:scale-95'
            )}
          >
            {isAdded ? (
              <Check className="h-4 w-4 sm:h-5 sm:w-5 animate-in zoom-in-75 duration-200 stroke-[3]" />
            ) : (
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
