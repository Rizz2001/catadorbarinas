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
  const hasDiscount = Boolean(
    product.originalPriceUsd && product.originalPriceUsd > product.priceUsd
  );

  const otherCartItems = cartItems.filter(
    (i) => !(i.product.id === product.id && (i.purchaseMode || 'unidad') === mode)
  );
  const maxForCurrentMode = getMaxAllowedQuantity(product, mode, otherCartItems);
  const maxForBox = getMaxAllowedQuantity(product, 'caja', otherCartItems);
  const currentCartItem = cartItems.find(
    (i) => i.product.id === product.id && (i.purchaseMode || 'unidad') === mode
  );
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;
  const canAddMore =
    (product.inStock || product.allowBackorder) &&
    (product.allowBackorder || (maxForCurrentMode > 0 && inCartQty < maxForCurrentMode));

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

  const productHref = `/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`;

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between min-w-0 max-w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-2 sm:p-3.5 transition-colors duration-150 hover:border-catador-blue',
        className
      )}
    >
      {/* Etiquetas Superiores y Botón Favorito */}
      <div className="absolute top-2 left-2 right-2 sm:top-2.5 sm:left-2.5 sm:right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div>
          {hasDiscount && product.discountPercentage ? (
            <span className="inline-block rounded-md bg-catador-discount px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-white tabular-nums">
              -{product.discountPercentage}%
            </span>
          ) : !product.inStock ? (
            <span className="inline-block rounded-md bg-slate-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white">
              Agotado
            </span>
          ) : product.saleMode === 'solo_caja' ? (
            <span className="inline-block rounded-md bg-catador-blue px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white tabular-nums">
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
            'pointer-events-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-colors cursor-pointer',
            isFav
              ? 'bg-red-50 border-red-200 text-red-500'
              : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
          )}
        >
          <Heart className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Escenario de Fotografía del Producto */}
      <Link
        href={productHref}
        className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 sm:p-3 mb-2 sm:mb-2.5 block"
      >
        <Image
          src={displaySrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 20vw"
          className={cn(
            'object-contain transition-transform duration-200 ease-out',
            isNoImage || hasError ? 'p-5 sm:p-8 opacity-80' : 'group-hover:scale-105'
          )}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </Link>

      {/* Información y Controles */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
          <span className="font-bold text-slate-500 truncate min-w-0">{product.brand}</span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tabular-nums shrink-0">
            {product.stockQuantity > 0
              ? `${product.stockQuantity} disp.`
              : product.allowBackorder
                ? 'Disponible'
                : 'Agotado'}
          </span>
        </div>

        <Link href={productHref}>
          <h3
            className={cn(
              'font-extrabold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-catador-blue transition-colors break-words',
              isCompact ? 'text-[11px] sm:text-xs min-h-[30px] sm:min-h-[32px]' : 'text-xs sm:text-sm min-h-[32px] sm:min-h-[38px]'
            )}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Selector Unidad / Caja */}
        {!isCompact && product.saleMode !== 'solo_unidad' && (
          <div className="grid grid-cols-2 gap-0.5 sm:gap-1 bg-slate-100 p-0.5 rounded-lg mt-1.5 sm:mt-2 mb-1 min-w-0">
            {product.saleMode !== 'solo_caja' && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMode('unidad');
                }}
                className={cn(
                  'py-1 px-1 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer truncate',
                  mode === 'unidad' ? 'bg-white text-catador-blue' : 'text-slate-600 hover:text-slate-900'
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
              className={cn(
                'py-1 px-1 rounded-md text-[10px] font-extrabold transition-colors flex items-center justify-center gap-0.5 sm:gap-1 truncate tabular-nums min-w-0',
                product.saleMode === 'solo_caja' && 'col-span-2',
                mode === 'caja'
                  ? 'bg-catador-blue text-white cursor-pointer'
                  : maxForBox <= 0 && !product.allowBackorder
                    ? 'text-slate-400 opacity-55 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              )}
            >
              <Package className="hidden xs:inline-block h-2.5 w-2.5 shrink-0" />
              <span className="truncate">Caja x{unitsPerBox}</span>
            </button>
          </div>
        )}

        {/* Precio Bimonetario Tabular y Acción */}
        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-slate-100 flex items-end justify-between gap-1 sm:gap-1.5 min-w-0">
          <div className="flex flex-col items-start min-w-0 flex-1 tabular-nums">
            <span
              className={cn(
                'font-black tracking-tight leading-none truncate max-w-full',
                isCompact ? 'text-xs sm:text-base' : 'text-sm sm:text-lg',
                hasDiscount ? 'text-catador-discount' : 'text-slate-900'
              )}
            >
              {prices.usdFormatted}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5 sm:mt-1 leading-none truncate max-w-full">
              {prices.vesFormatted}
            </span>
          </div>

          {inCartQty > 0 ? (
            <div className="flex items-center bg-slate-100 rounded-lg sm:rounded-xl border border-slate-200 p-0.5 shrink-0 tabular-nums">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, inCartQty - 1, mode);
                }}
                className="flex h-7 w-6 sm:h-8 sm:w-7 items-center justify-center rounded-md sm:rounded-lg text-slate-700 hover:bg-white transition-colors cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <span className="px-1 text-[11px] sm:text-xs font-black text-catador-blue min-w-[16px] sm:min-w-[20px] text-center">
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
                  'flex h-7 w-6 sm:h-8 sm:w-7 items-center justify-center rounded-md sm:rounded-lg transition-colors',
                  canAddMore
                    ? 'text-catador-blue hover:bg-white cursor-pointer'
                    : 'text-slate-300 cursor-not-allowed'
                )}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              type="button"
              disabled={!canAddMore}
              aria-label={`Agregar ${product.name} al carrito`}
              className={cn(
                'flex items-center justify-center rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10 shrink-0 transition-colors cursor-pointer',
                !canAddMore
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-catador-blue text-white hover:bg-catador-blue-light active:scale-95'
              )}
            >
              {isAdded ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" /> : <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
