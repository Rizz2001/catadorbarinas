'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatPrices, formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const totals = useCartTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo Oscuro / Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col overflow-x-hidden">
          {/* Cabecera del Drawer */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-catador-blue" />
              <h2 className="text-base font-bold text-slate-900">Carrito de Compras</h2>
              <span className="text-xs font-semibold text-slate-500">
                ({totals.itemCount} items)
              </span>
            </div>
            <button
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lista de Ítems */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="h-14 w-14 stroke-1 mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Tu carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Agrega productos desde el catálogo para visualizarlos aquí en USD y Bolívares.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-5 rounded-lg bg-catador-blue px-4 py-2 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors cursor-pointer"
                >
                  Explorar Productos
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const itemPrices = formatPrices(product.priceUsd * quantity, bcvRate);
                return (
                  <div key={product.id} className="py-3 flex gap-3 items-center">
                    <div className="relative h-16 w-16 shrink-0 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden p-1">
                      <Image
                        src={product.images[0] || IMAGE_FALLBACKS.product}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] font-bold text-catador-blue mt-0.5">
                        {itemPrices.usdFormatted}
                        <span className="text-slate-600 font-medium ml-1.5">
                          ({itemPrices.vesFormatted})
                        </span>
                      </p>
                      {/* Stepper de Cantidad */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bimonetario y Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    {formatUsd(totals.subtotalUsd)} / {formatVes(totals.subtotalVes)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío en Barinas:</span>
                  <span className="font-semibold text-emerald-600">
                    {totals.shippingUsd === 0 ? '¡Gratis!' : `${formatUsd(totals.shippingUsd)} / ${formatVes(totals.shippingVes)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Final:</span>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-catador-blue">
                      {formatUsd(totals.totalUsd)}
                    </p>
                    <p className="text-xs font-bold text-slate-600">
                      {formatVes(totals.totalVes)}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light py-3 text-sm font-extrabold text-white shadow-md transition-colors"
              >
                <span>Pagar Pedido en Línea</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/carrito"
                onClick={closeCart}
                className="w-full min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-colors"
              >
                Ver Detalle del Carrito
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
