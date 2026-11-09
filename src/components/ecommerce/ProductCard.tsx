'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Heart, Plus, Minus, Package } from 'lucide-react';
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
  const isNoImage =
    !rawImage || rawImage === IMAGE_FALLBACKS.product || rawImage.includes('logo');
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
  const boxAvailable = maxForBox > 0 || Boolean(product.allowBackorder);

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
        'group relative flex flex-col justify-between min-w-0 max-w-full overflow-hidden rounded-xl bg-white border border-slate-200 p-3 sm:p-4 transition-colors duration-150 hover:border-catador-blue',
        className
      )}
    >
      {/* Etiquetas Superiores y Botón Favorito */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div>
          {hasDiscount && product.discountPercentage ? (
            <span className="inline-block rounded-md bg-catador-discount px-2 py-0.5 text-xs font-black text-white tabular-nums">
              -{product.discountPercentage}%
            </span>
          ) : !product.inStock && !product.allowBackorder ? (
            <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-white">
              Agotado
            </span>
          ) : product.saleMode === 'solo_caja' ? (
            <span className="inline-block rounded-md bg-catador-blue px-2 py-0.5 text-xs font-bold text-white tabular-nums">
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
            'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border transition-colors cursor-pointer',
            isFav
              ? 'bg-red-50 border-red-200 text-red-500'
              : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
          )}
        >
          <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Escenario de Fotografía Unificado (Alto Fijo, Fondo Blanco Puro y Mayor Padding) */}
      <Link
        href={productHref}
        className={cn(
          'relative w-full overflow-hidden rounded-lg bg-white border border-slate-100 flex items-center justify-center p-4 sm:p-5 mb-2.5 block',
          isCompact ? 'h-40 sm:h-44' : 'h-44 sm:h-48'
        )}
      >
        <Image
          src={displaySrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 20vw"
          className={cn(
            'object-contain transition-transform duration-200 ease-out p-3 sm:p-4',
            isNoImage || hasError ? 'p-6 sm:p-8 opacity-80' : 'group-hover:scale-105'
          )}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </Link>

      {/* Información y Controles */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Marca + Badge de Stock / Urgencia */}
        <div className="flex items-center justify-between gap-1.5 min-h-[22px]">
          <span className="text-xs font-bold text-slate-600 truncate min-w-0">
            {product.brand || product.category}
          </span>
          {product.stockQuantity === 1 ? (
            <span className="inline-block rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 text-[11px] font-black shrink-0">
              ¡Última unidad!
            </span>
          ) : product.stockQuantity >= 2 && product.stockQuantity <= 5 ? (
            <span className="inline-block rounded bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums shrink-0">
              ¡Últimas {product.stockQuantity} und!
            </span>
          ) : product.stockQuantity > 5 ? (
            <span className="text-xs font-bold text-emerald-700 tabular-nums shrink-0">
              {product.stockQuantity} disp.
            </span>
          ) : product.allowBackorder ? (
            <span className="text-xs font-bold text-catador-blue shrink-0">Disponible</span>
          ) : (
            <span className="text-xs font-bold text-rose-600 shrink-0">Sin stock</span>
          )}
        </div>

        {/* Nombre con Altura Fija Reservada de 2 Líneas para Alineación entre Filas */}
        <Link href={productHref}>
          <h3
            className="h-[38px] sm:h-[42px] text-[13px] sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-1 leading-[1.35] group-hover:text-catador-blue transition-colors break-words"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Selector Unidad / Caja con Altura Reservada Uniforme */}
        {!isCompact && (
          <div className="min-h-[38px] mt-2 mb-1.5 flex items-center">
            {product.saleMode === 'solo_unidad' ? (
              <div className="w-full rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>Modalidad</span>
                <span className="font-extrabold text-slate-800">Venta por Unidad</span>
              </div>
            ) : !boxAvailable && product.saleMode !== 'solo_caja' ? (
              <div className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs flex items-center justify-between gap-1">
                <span className="font-extrabold text-catador-blue">Por Unidad</span>
                <span className="text-slate-500 font-semibold tabular-nums truncate">
                  Caja x{unitsPerBox} sin stock
                </span>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 min-w-0">
                {product.saleMode !== 'solo_caja' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('unidad');
                    }}
                    className={cn(
                      'py-1.5 px-2 rounded-md text-xs font-extrabold transition-colors cursor-pointer truncate',
                      mode === 'unidad'
                        ? 'bg-catador-blue text-white'
                        : 'bg-white text-slate-700 hover:text-catador-blue'
                    )}
                  >
                    Unidad
                  </button>
                )}
                <button
                  type="button"
                  disabled={!boxAvailable}
                  onClick={(e) => {
                    e.preventDefault();
                    if (boxAvailable) setMode('caja');
                  }}
                  className={cn(
                    'py-1.5 px-2 rounded-md text-xs font-extrabold transition-colors flex items-center justify-center gap-1 truncate tabular-nums min-w-0',
                    product.saleMode === 'solo_caja' && 'col-span-2',
                    mode === 'caja'
                      ? 'bg-catador-blue text-white cursor-pointer'
                      : 'bg-white text-slate-700 hover:text-catador-blue cursor-pointer'
                  )}
                >
                  <Package className="hidden xs:inline-block h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Caja x{unitsPerBox}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Precio Bimonetario Tabular y Botón '+ Agregar' Naranja */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 min-w-0">
          <div className="flex flex-col items-start min-w-0 flex-1 tabular-nums">
            <span
              className={cn(
                'font-black tracking-tight leading-none truncate max-w-full',
                isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
                hasDiscount ? 'text-catador-discount' : 'text-slate-900'
              )}
            >
              {prices.usdFormatted}
            </span>
            <span className="text-xs font-bold text-slate-600 mt-1 leading-none truncate max-w-full">
              {prices.vesFormatted}
            </span>
          </div>

          {inCartQty > 0 ? (
            <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5 shrink-0 tabular-nums min-h-[38px]">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, inCartQty - 1, mode);
                }}
                className="flex h-8 w-7 sm:w-8 items-center justify-center rounded-md text-slate-700 hover:bg-white transition-colors cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 text-xs sm:text-[13px] font-black text-catador-blue min-w-[20px] text-center">
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
                  'flex h-8 w-7 sm:w-8 items-center justify-center rounded-md transition-colors',
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
                'inline-flex items-center justify-center gap-1 rounded-lg px-2.5 sm:px-3.5 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-[13px] font-black shrink-0 transition-colors cursor-pointer',
                !canAddMore
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-catador-amber hover:bg-catador-amber-dark text-white active:scale-95'
              )}
            >
              {isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3] shrink-0" />
                  <span>Listo</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 stroke-[3] shrink-0" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
