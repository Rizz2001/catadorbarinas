'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, Heart, Plus, Minus, Package } from 'lucide-react';
import { Product, PurchaseMode } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import {
  getDefaultPurchaseMode,
  getEffectivePriceUsd,
  getMaxAllowedQuantity,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
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
  const [mode, setMode] = useState<PurchaseMode>(() => getDefaultPurchaseMode(product));

  const displaySrc = isNoImage || hasError ? cmsLogo : rawImage;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isFav = useWishlistStore((state) => state.items.some((i) => i.id === product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const activePriceUsd = getEffectivePriceUsd(product, mode);
  const prices = formatPrices(activePriceUsd, bcvRate);
  const hasDiscount = Boolean(product.originalPriceUsd && product.originalPriceUsd > product.priceUsd);

  const maxForCurrentMode = getMaxAllowedQuantity(product, mode, cartItems);
  const maxForBox = getMaxAllowedQuantity(product, 'caja', cartItems);
  const currentCartItem = cartItems.find(
    (i) => i.product.id === product.id && (i.purchaseMode || 'unidad') === mode
  );
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const canAddMore = product.inStock && (product.allowBackorder || inCartQty < maxForCurrentMode);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddMore) return;
    const res = addItem(product, 1, mode, false);
    if (res.added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1000);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-2.5 sm:p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8 hover:border-catador-blue/40',
        className
      )}
    >
      {/* Badges Superiores y Botón Favorito */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div>
          {hasDiscount && product.discountPercentage ? (
            <span className="inline-block rounded-full bg-catador-discount px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
              -{product.discountPercentage}%
            </span>
          ) : !product.inStock ? (
            <span className="inline-block rounded-full bg-slate-700/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Agotado
            </span>
          ) : product.saleMode === 'solo_caja' ? (
            <span className="inline-block rounded-full bg-catador-blue px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Solo Caja x{unitsPerBox}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
          }}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={cn(
            'pointer-events-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-all cursor-pointer shadow-xs',
            isFav
              ? 'bg-red-50 border-red-200 text-red-500 scale-105'
              : 'bg-white/90 border-slate-200/80 text-slate-400 hover:text-red-500 hover:bg-white'
          )}
        >
          <Heart className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Imagen del Producto */}
      <Link
        href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded-xl flex items-center justify-center p-2 sm:p-3 mb-2 block transition-colors duration-200',
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
            isNoImage || hasError ? 'p-6 sm:p-8 opacity-85' : 'group-hover:scale-105'
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
          <span className="text-[9px] font-semibold text-slate-400 shrink-0">
            {product.stockQuantity > 0 ? `${product.stockQuantity} disp.` : product.allowBackorder ? 'Bajo pedido' : 'Sin stock'}
          </span>
        </div>

        <Link href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}>
          <h3
            className={cn(
              'font-extrabold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-catador-blue transition-colors',
              isCompact ? 'text-xs min-h-[32px]' : 'text-xs sm:text-sm min-h-[34px] sm:min-h-[38px]'
            )}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Selector Rápido Unidad / Caja */}
        {!isCompact && product.saleMode !== 'solo_unidad' && (
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg mt-1.5 mb-1">
            {product.saleMode !== 'solo_caja' && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMode('unidad');
                }}
                className={cn(
                  'py-1 px-1.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer truncate',
                  mode === 'unidad'
                    ? 'bg-white text-catador-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Unidad
              </button>
            )}
            <button
              type="button"
              disabled={maxForBox <= 0 && !product.allowBackorder}
              onClick={(e) => {
                e.preventDefault();
                if (maxForBox > 0 || product.allowBackorder) setMode('caja');
              }}
              title={
                maxForBox <= 0 && !product.allowBackorder
                  ? `Stock insuficiente para 1 caja (${product.stockQuantity}/${unitsPerBox} und)`
                  : `Comprar por caja de ${unitsPerBox} unidades`
              }
              className={cn(
                'py-1 px-1.5 rounded-md text-[10px] font-extrabold transition-all flex items-center justify-center gap-0.5 truncate',
                product.saleMode === 'solo_caja' && 'col-span-2',
                mode === 'caja'
                  ? 'bg-catador-blue text-white shadow-xs cursor-pointer'
                  : maxForBox <= 0 && !product.allowBackorder
                  ? 'text-slate-400 opacity-55 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              )}
            >
              <Package className="h-2.5 w-2.5 shrink-0" />
              <span>Caja x{unitsPerBox}</span>
            </button>
          </div>
        )}

        {/* Bimonetarismo Estricto y Selector de Cantidad / Botón Agregar */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-end justify-between gap-1.5">
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span
              className={cn(
                'font-black tracking-tight leading-none',
                isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
                hasDiscount ? 'text-catador-discount' : 'text-slate-900'
              )}
            >
              {prices.usdFormatted}
            </span>
            <span className="inline-flex items-center font-mono text-[10px] font-bold text-slate-600 bg-slate-100/90 px-1.5 py-0.5 rounded-md border border-slate-200/70 mt-1 tracking-tight truncate max-w-full">
              {prices.vesFormatted}
            </span>
          </div>

          {inCartQty > 0 ? (
            <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, inCartQty - 1, mode);
                }}
                className="flex h-8 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-white transition-colors cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 text-xs font-black text-catador-blue min-w-[20px] text-center">
                {inCartQty}
              </span>
              <button
                type="button"
                disabled={!canAddMore}
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, inCartQty + 1, mode);
                }}
                className={cn(
                  'flex h-8 w-7 items-center justify-center rounded-lg transition-colors',
                  canAddMore
                    ? 'text-catador-blue hover:bg-white cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                )}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              type="button"
              disabled={!canAddMore}
              aria-label={`Agregar ${product.name} al carrito`}
              className={cn(
                'flex items-center justify-center rounded-xl h-10 w-10 sm:min-h-[42px] sm:min-w-[42px] shrink-0 transition-all duration-200 cursor-pointer shadow-xs',
                !canAddMore
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : isAdded
                  ? 'bg-emerald-600 text-white scale-105 shadow-md'
                  : 'bg-catador-blue text-white hover:bg-catador-blue-light active:scale-95'
              )}
            >
              {isAdded ? <Check className="h-4 w-4 stroke-[3]" /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
