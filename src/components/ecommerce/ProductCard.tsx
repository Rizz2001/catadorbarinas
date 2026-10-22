'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  isCompact?: boolean;
}

export function ProductCard({ product, className, isCompact = false }: ProductCardProps) {
  const [imageSrc, setImageSrc] = useState<string>(product.images[0] || IMAGE_FALLBACKS.product);
  const [isAdded, setIsAdded] = useState<boolean>(false);

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
        'group relative flex flex-col justify-between rounded-xl bg-white border border-slate-200/80 p-3.5 transition-all duration-200 hover:shadow-card-hover hover:border-catador-blue/40',
        className
      )}
    >
      {/* Badge de Descuento o Agotado */}
      {hasDiscount && product.discountPercentage ? (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-catador-discount px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
          -{product.discountPercentage}%
        </span>
      ) : !product.inStock ? (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-slate-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
          Agotado
        </span>
      ) : null}

      {/* Imagen del Producto */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center p-2 mb-2">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageSrc(IMAGE_FALLBACKS.product)}
          loading="lazy"
        />
      </div>

      {/* Detalles del Producto */}
      <div className="flex flex-col flex-1">
        <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide truncate">
          {product.brand}
        </span>

        <h3
          className={cn(
            'font-semibold text-slate-800 line-clamp-2 mt-0.5 group-hover:text-catador-blue transition-colors',
            isCompact ? 'text-xs min-h-[32px]' : 'text-sm min-h-[40px]'
          )}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1 mb-2">
          <div className="flex text-catador-amber">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3 fill-current',
                  i < Math.floor(product.rating) ? 'text-catador-amber' : 'text-slate-200'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-600">({product.reviewsCount})</span>
        </div>

        {/* Bimonetarismo Estricto (USD y VES BCV) */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span
              className={cn(
                'font-extrabold tracking-tight leading-none',
                isCompact ? 'text-base' : 'text-lg',
                hasDiscount ? 'text-catador-discount' : 'text-slate-900'
              )}
            >
              {prices.usdFormatted}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 mt-1">
              {prices.vesFormatted}
            </span>
          </div>

          {/* Botón de Agregar al Carrito */}
          <button
            onClick={handleAddToCart}
            type="button"
            disabled={!product.inStock}
            aria-label={`Agregar ${product.name} al carrito`}
            className={cn(
              'flex items-center justify-center rounded-lg h-9 w-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-catador-blue',
              !product.inStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-catador-blue text-white hover:bg-catador-blue-light shadow-xs active:scale-95'
            )}
          >
            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
