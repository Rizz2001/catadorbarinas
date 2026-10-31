'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { formatPrices } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

export function CartItemList() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No tienes productos en tu carrito. Explora nuestro catálogo de licores, víveres y bodegón para agregar tus favoritos.
        </p>
        <Link
          href="/#catalogo-en-vivo"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-catador-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Ir al Catálogo de Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          Artículos en tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})
        </h2>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" /> Vaciar Carrito
        </button>
      </div>

      <div className="divide-y divide-slate-100 p-4 sm:p-5 space-y-4">
        {items.map(({ product, quantity }) => {
          const itemPrices = formatPrices(product.priceUsd * quantity, bcvRate);
          const unitPrices = formatPrices(product.priceUsd, bcvRate);

          const rawImg = product.images?.[0];
          const isNoImg = !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
          const itemImg = isNoImg ? cmsLogo : rawImg;

          return (
            <div
              key={product.id}
              className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Información y Miniatura */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-slate-50 border border-slate-200/80 p-1.5 overflow-hidden">
                  <Image
                    src={itemImg}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className={cn('object-contain', isNoImg ? 'p-2 opacity-80' : '')}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block truncate">
                    {product.brand}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 sm:truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Unitario: <span className="font-bold text-slate-700">{unitPrices.usdFormatted}</span> ({unitPrices.vesFormatted})
                  </p>
                </div>
              </div>

              {/* Controles de Cantidad y Subtotal por ítem */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                {/* Stepper con área táctil >= 38px */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="h-9 w-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors rounded-l-xl cursor-pointer"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="h-9 w-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors rounded-r-xl cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Subtotal del Item */}
                <div className="text-right min-w-[85px]">
                  <p className="text-sm font-extrabold text-catador-blue">
                    {itemPrices.usdFormatted}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 font-mono">
                    {itemPrices.vesFormatted}
                  </p>
                </div>

                {/* Eliminar Ítem */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  aria-label={`Eliminar ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/#catalogo-en-vivo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
