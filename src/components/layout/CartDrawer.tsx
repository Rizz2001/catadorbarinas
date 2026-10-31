'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Truck,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { CartDrawerItemRow } from '@/components/cart/CartDrawerItemRow';
import { supabase } from '@/lib/supabase';

const FREE_DELIVERY_THRESHOLD_USD = 30;

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    switchPurchaseMode,
    clearCart,
    lastStockWarning,
  } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const totals = useCartTotals();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (active) setIsAuthenticated(Boolean(user));
    }
    checkAuth();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD_USD - totals.subtotalUsd);
  const progressPercent = Math.min(100, (totals.subtotalUsd / FREE_DELIVERY_THRESHOLD_USD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-w-full flex sm:pl-10">
        <aside className="w-full sm:w-screen sm:max-w-md max-h-[88dvh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
          {/* Indicador táctil superior para móviles */}
          <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50">
            <div className="h-1.5 w-12 rounded-full bg-slate-300" />
          </div>

          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-catador-blue" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Tu Carrito ({totals.itemCount})
                </h2>
                <p className="text-[10px] font-semibold text-slate-500">
                  Cambia entre Unidad o Caja con 1 toque
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Vaciar</span>
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Barra de progreso hacia Delivery Gratis */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-catador-blue shrink-0" />
                  {remainingForFreeDelivery <= 0 ? (
                    <span className="text-emerald-700 font-extrabold">
                      ¡Tienes Delivery Base Gratis en Barinas!
                    </span>
                  ) : (
                    <span>
                      Te faltan{' '}
                      <strong className="text-catador-blue">
                        {formatUsd(remainingForFreeDelivery)}
                      </strong>{' '}
                      para Delivery Gratis
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-black text-catador-blue">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {lastStockWarning && (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{lastStockWarning}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <ShoppingBag className="h-14 w-14 stroke-1 mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Tu carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Agrega productos por unidad o por caja para ver tu cotización bimonetaria.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-5 rounded-xl bg-catador-blue px-5 py-2.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors cursor-pointer"
                >
                  Explorar Productos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <CartDrawerItemRow
                  key={`${item.product.id}-${item.purchaseMode || 'unidad'}`}
                  item={item}
                  bcvRate={bcvRate}
                  cmsLogo={cmsLogo}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onSwitchMode={switchPurchaseMode}
                />
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Subtotal Estimado</span>
                  <span className="text-[11px] font-bold text-slate-600 font-mono">
                    {formatVes(totals.subtotalVes)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-catador-blue leading-none">
                    {formatUsd(totals.subtotalUsd)}
                  </p>
                  <span className="text-[10px] text-slate-400">Tasa BCV Oficial</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light py-3 text-sm font-extrabold text-white shadow-md transition-colors"
                >
                  <span>Cotizar Delivery y Pagar</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-center text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg py-1.5 px-2">
                    🔒 Para comprar es obligatorio registrarse o iniciar sesión
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/registro?redirect=/checkout"
                      onClick={closeCart}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-3 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5 shrink-0" />
                      <span>Registrarme</span>
                    </Link>
                    <Link
                      href="/login?redirect=/checkout"
                      onClick={closeCart}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-catador-blue bg-white hover:bg-blue-50 px-3 py-2.5 text-xs font-extrabold text-catador-blue transition-colors"
                    >
                      <LogIn className="h-3.5 w-3.5 shrink-0" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
