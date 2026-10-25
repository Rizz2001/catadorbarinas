'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Share2, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0] || IMAGE_FALLBACKS.product
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);

  const prices = formatPrices(product.priceUsd, bcvRate);
  const hasDiscount = Boolean(product.originalPriceUsd && product.originalPriceUsd > product.priceUsd);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `🍷 ${product.name} - ${prices.usdFormatted} (${prices.vesFormatted}) en Gran Catador Barinas`,
        url,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`🍷 *${product.name}*\n💰 Precio: ${prices.usdFormatted} (${prices.vesFormatted})\n📦 Gran Catador Barinas:\n${url}`)}`, '_blank');
    }
  };

  const handleDirectBuy = () => {
    if (!product.inStock) return;
    addItem(product, quantity);
    router.push('/checkout');
  };

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Columna de Galería de Imágenes (5 cols) */}
      <div className="lg:col-span-5 space-y-3">
        <div className="relative aspect-square w-full rounded-2xl bg-white border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden shadow-2xs">
          {hasDiscount && product.discountPercentage && (
            <span className="absolute top-4 left-4 z-10 rounded-full bg-catador-discount px-3 py-1 text-xs font-black text-white shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            priority
            className={cn(
              'object-contain transition-transform duration-300',
              !selectedImage || selectedImage === IMAGE_FALLBACKS.product || selectedImage.includes('logo')
                ? 'p-12 opacity-80'
                : 'p-4 hover:scale-105'
            )}
            onError={() => setSelectedImage(IMAGE_FALLBACKS.product)}
          />
        </div>

        {/* Miniaturas si hay múltiples */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={cn(
                  'relative h-16 w-16 shrink-0 rounded-xl bg-white border p-1 overflow-hidden transition-all',
                  selectedImage === img
                    ? 'border-catador-blue ring-2 ring-catador-blue/20'
                    : 'border-slate-200 hover:border-slate-400'
                )}
              >
                <Image src={img} alt="" fill className="object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Columna de Detalles y Compra (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-catador-amber">
            {product.brand} • {product.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {product.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Código / SKU: {product.sku}</p>
        </div>

        {/* Precios Bimonetarios Oficiales */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
            Precio Oficial Bodegón (Depósito 01)
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-catador-blue tracking-tight">
              {prices.usdFormatted}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-700">
              {prices.vesFormatted}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tasa BCV del día: <strong>Bs. {bcvRate.toFixed(2)}/$</strong>
          </p>
        </div>

        {/* Estado de Stock en Bodegón */}
        <div className="flex items-center gap-2">
          {product.inStock ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> En stock en Bodegón ({product.stockQuantity} disponibles)
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
              <XCircle className="h-3.5 w-3.5 text-slate-400" /> Agotado temporalmente en Bodegón
            </div>
          )}
        </div>

        {/* Controles de Compra y Carrito */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-3">
            {/* Stepper */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs h-11">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 text-slate-600 hover:text-slate-900 font-bold"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 text-slate-600 hover:text-slate-900 font-bold"
              >
                +
              </button>
            </div>

            {/* Botón Agregar al Carrito */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer',
                !product.inStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-catador-blue text-white hover:bg-catador-blue-light active:scale-[0.99]'
              )}
            >
              {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {isAdded ? '¡Agregado al Carrito!' : 'Agregar al Carrito'}
            </button>
          </div>

          {/* Botón Comprar directo en Web */}
          <button
            type="button"
            onClick={handleDirectBuy}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-catador-amber hover:bg-catador-amber-dark text-white font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <Zap className="h-4 w-4" /> Comprar Ahora (Checkout Directo)
          </button>

          {/* Compartir o Copiar Link */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-catador-blue" /> Compartir Producto
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? '¡Copiado!' : 'Copiar Enlace'}
            </button>
          </div>
        </div>

        {/* Ficha Técnica */}
        <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
          <h3 className="font-bold text-slate-900">Especificaciones:</h3>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>Presentación: <span className="font-semibold text-slate-800">{product.unit}</span></div>
            <div>Depósito: <span className="font-semibold text-slate-800">01 (Bodegón)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
