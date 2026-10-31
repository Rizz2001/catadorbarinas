'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Check,
  Share2,
  Zap,
  CheckCircle2,
  XCircle,
  Heart,
  Package,
  Box,
  AlertTriangle,
} from 'lucide-react';
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
import { ProductDetailExtraSection } from './ProductDetailExtraSection';
import { cn } from '@/lib/utils';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [mode, setMode] = useState<PurchaseMode>(() => getDefaultPurchaseMode(product));
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const rawImage = selectedImage || product.images?.[0];
  const isNoImage = !rawImage || rawImage === IMAGE_FALLBACKS.product || rawImage.includes('logo');
  const activeImage = isNoImage || hasError ? cmsLogo : rawImage;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const isFav = useWishlistStore((state) => state.items.some((i) => i.id === product.id));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const unitPrices = formatPrices(getEffectivePriceUsd(product, 'unidad'), bcvRate);
  const boxPrices = formatPrices(getEffectivePriceUsd(product, 'caja'), bcvRate);
  const activePriceUsd = getEffectivePriceUsd(product, mode);
  const totalSelectionPrices = formatPrices(activePriceUsd * quantity, bcvRate);

  const maxUnitsAllowed = getMaxAllowedQuantity(product, 'unidad', cartItems);
  const maxBoxesAllowed = getMaxAllowedQuantity(product, 'caja', cartItems);
  const currentMax = mode === 'caja' ? maxBoxesAllowed : maxUnitsAllowed;
  const safeQuantity = currentMax > 0 ? Math.min(quantity, currentMax) : 1;
  const requiredBaseUnits = safeQuantity * getUnitsPerPurchaseMode(product, mode);

  const handleModeSwitch = (nextMode: PurchaseMode) => {
    setMode(nextMode);
    setQuantity(1);
    setFeedbackMsg(null);
  };

  const handleAddToCart = () => {
    if (!product.inStock || (currentMax <= 0 && !product.allowBackorder)) return;
    const res = addItem(product, safeQuantity, mode, true);
    if (res.added) {
      setIsAdded(true);
      setFeedbackMsg(res.message || null);
      setTimeout(() => setIsAdded(false), 1500);
    } else if (res.message) {
      setFeedbackMsg(res.message);
    }
  };

  const handleDirectBuy = () => {
    if (!product.inStock || (currentMax <= 0 && !product.allowBackorder)) return;
    const res = addItem(product, safeQuantity, mode, false);
    if (res.added) router.push('/checkout');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Galería de Imágenes (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-200/90 p-6 flex items-center justify-center overflow-hidden shadow-xs">
            {product.discountPercentage && (
              <span className="absolute top-4 left-4 z-10 rounded-full bg-catador-discount px-3 py-1 text-xs font-black text-white shadow-xs">
                -{product.discountPercentage}% OFERTA
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              className={cn(
                'absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer shadow-xs',
                isFav
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'bg-white/90 border-slate-200 text-slate-400 hover:text-red-500'
              )}
              aria-label="Favorito"
            >
              <Heart className={cn('h-5 w-5', isFav && 'fill-current')} />
            </button>
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 42vw"
              className={cn(
                'object-contain transition-transform duration-300',
                activeImage === cmsLogo ? 'p-12 opacity-80' : 'p-4 hover:scale-105'
              )}
              onError={() => setHasError(true)}
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img);
                    setHasError(false);
                  }}
                  className={cn(
                    'relative h-16 w-16 shrink-0 rounded-xl bg-white border p-1 overflow-hidden cursor-pointer',
                    selectedImage === img || (!selectedImage && idx === 0)
                      ? 'border-catador-blue ring-2 ring-catador-blue/20'
                      : 'border-slate-200 hover:border-slate-400'
                  )}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Comercial y Selector Unidad / Caja (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800">
              {product.brand} • {product.category}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">SKU: {product.sku}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Indicador Transparente de Stock en Unidades y Cajas */}
          <div className="flex flex-wrap items-center gap-2">
            {product.inStock ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Disponible en Depósito 01: {product.stockQuantity} {product.unit.toLowerCase()}s
                  {product.stockQuantity >= unitsPerBox
                    ? ` (Equivale a ${Math.floor(product.stockQuantity / unitsPerBox)} cajas de ${unitsPerBox} und)`
                    : ' (Stock solo para unidades sueltas)'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Agotado temporalmente en inventario</span>
              </div>
            )}
          </div>

          {/* Tarjetas Gemelas: Elegir Por Unidad vs Por Caja */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              1. Elige la Presentación de Compra:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.saleMode !== 'solo_caja' && (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('unidad')}
                  className={cn(
                    'flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer',
                    mode === 'unidad'
                      ? 'border-catador-blue bg-blue-50/40 ring-2 ring-catador-blue/15'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase">
                      <Box className="h-4 w-4 text-catador-blue" /> Por Unidad (1 {product.unit})
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Máx: {maxUnitsAllowed}
                    </span>
                  </div>
                  <span className="text-xl font-black text-catador-blue">{unitPrices.usdFormatted}</span>
                  <span className="text-xs font-mono font-bold text-slate-600">{unitPrices.vesFormatted}</span>
                </button>
              )}

              {product.saleMode !== 'solo_unidad' && (
                <button
                  type="button"
                  disabled={maxBoxesAllowed <= 0 && !product.allowBackorder}
                  onClick={() => handleModeSwitch('caja')}
                  className={cn(
                    'flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all',
                    mode === 'caja'
                      ? 'border-catador-blue bg-blue-50/40 ring-2 ring-catador-blue/15 cursor-pointer'
                      : maxBoxesAllowed <= 0 && !product.allowBackorder
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase">
                      <Package className="h-4 w-4 text-catador-amber" /> Por {product.boxUnitLabel || 'Caja'} ({unitsPerBox} und)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      {maxBoxesAllowed > 0 || product.allowBackorder ? `Máx: ${maxBoxesAllowed} cajas` : 'Sin stock p/caja'}
                    </span>
                  </div>
                  <span className="text-xl font-black text-catador-blue">{boxPrices.usdFormatted}</span>
                  <span className="text-xs font-mono font-bold text-slate-600">{boxPrices.vesFormatted}</span>
                </button>
              )}
            </div>
          </div>

          {/* Control de Cantidad y Descuento Exacto de Stock */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-700">
                2. Cantidad de {mode === 'caja' ? `Cajas (${unitsPerBox} und c/u)` : 'Unidades'}:
              </span>
              <span className="text-xs font-bold text-catador-blue bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Descuenta {requiredBaseUnits} {requiredBaseUnits === 1 ? 'unidad' : 'unidades'} de {product.stockQuantity} en stock
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
                    className="w-11 h-full font-black text-slate-700 hover:bg-slate-100 rounded-l-xl cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-900">{safeQuantity}</span>
                  <button
                    type="button"
                    disabled={!product.allowBackorder && safeQuantity >= currentMax}
                    onClick={() => setQuantity(Math.min(currentMax, safeQuantity + 1))}
                    className="w-11 h-full font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-r-xl cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Atajos rápidos de cantidad */}
                {[2, 6, 12].map((preset) =>
                  preset <= currentMax ? (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={cn(
                        'px-2.5 h-9 rounded-lg text-xs font-bold border transition-colors cursor-pointer',
                        safeQuantity === preset
                          ? 'bg-catador-blue text-white border-catador-blue'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-catador-blue'
                      )}
                    >
                      {preset}
                    </button>
                  ) : null
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 block">Subtotal Selección:</span>
                <span className="text-xl font-black text-slate-900">{totalSelectionPrices.usdFormatted}</span>
                <span className="block text-xs font-mono font-bold text-slate-600">
                  {totalSelectionPrices.vesFormatted}
                </span>
              </div>
            </div>

            {feedbackMsg && (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{feedbackMsg}</span>
              </div>
            )}
          </div>

          {/* Botones de Acción Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || (currentMax <= 0 && !product.allowBackorder)}
              className={cn(
                'flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-black text-sm transition-all shadow-sm cursor-pointer',
                !product.inStock || (currentMax <= 0 && !product.allowBackorder)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-catador-blue text-white hover:bg-catador-blue-light'
              )}
            >
              {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              <span>
                {isAdded
                  ? '¡Agregado al Carrito!'
                  : `Agregar ${safeQuantity} ${mode === 'caja' ? (safeQuantity === 1 ? 'Caja' : 'Cajas') : (safeQuantity === 1 ? 'Unidad' : 'Unidades')}`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDirectBuy}
              disabled={!product.inStock || (currentMax <= 0 && !product.allowBackorder)}
              className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-catador-amber hover:bg-catador-amber-dark disabled:opacity-40 text-white font-black text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="h-4 w-4" /> Comprar Ahora Directo
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`🍷 *${product.name}*\n💰 ${unitPrices.usdFormatted} (${unitPrices.vesFormatted})\n📦 Gran Catador Barinas: ${url}`)}`,
                '_blank'
              );
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 text-catador-blue" /> Compartir este artículo por WhatsApp
          </button>
        </div>
      </div>

      <ProductDetailExtraSection product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
