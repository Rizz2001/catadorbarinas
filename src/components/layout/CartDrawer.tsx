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
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { CartDrawerItemRow } from '@/components/cart/CartDrawerItemRow';
import { supabase } from '@/lib/supabase';

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
  const [userLocation, setUserLocation] = useState<{
    latitud?: number | null;
    longitud?: number | null;
    direccion?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    async function checkAuthAndLocation() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setIsAuthenticated(Boolean(user));
      if (user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('latitud, longitud, direccion')
          .eq('id', user.id)
          .single();
        if (active && perfil) {
          setUserLocation({
            latitud: typeof perfil.latitud === 'number' ? perfil.latitud : null,
            longitud: typeof perfil.longitud === 'number' ? perfil.longitud : null,
            direccion: perfil.direccion || null,
          });
        }
      }
    }
    checkAuthAndLocation();
    return () => {
      active = false;
    };
  }, [isOpen]);

  const deliveryQuote = React.useMemo(() => {
    return calculateSmartDeliveryQuote({
      items,
      subtotalUsd: totals.subtotalUsd,
      deliveryType: 'delivery',
      userLat: userLocation?.latitud ?? null,
      userLng: userLocation?.longitud ?? null,
      storeConfig,
    });
  }, [items, totals.subtotalUsd, userLocation, storeConfig]);

  const totalConDeliveryUsd = Number((totals.subtotalUsd + deliveryQuote.shippingUsd).toFixed(2));
  const totalConDeliveryVes = Number((totals.subtotalVes + convertUsdToVes(deliveryQuote.shippingUsd, bcvRate)).toFixed(2));

  if (!isOpen) return null;

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

          {/* Banner de Entrega Automática según Ubicación del Cliente */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-catador-blue/10 flex items-center justify-center text-catador-blue shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-tight">
                    Delivery Automático: {deliveryQuote.tierBadge}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {userLocation?.latitud
                      ? `Calculado a tu GPS (${deliveryQuote.distanceKm} km)`
                      : 'Tarifa base calculada para Barinas (0-3 km)'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-catador-blue block">
                  {formatUsd(deliveryQuote.shippingUsd)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatVes(convertUsdToVes(deliveryQuote.shippingUsd, bcvRate))}
                </span>
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
              {/* Desglose Transparente: Subtotal y Delivery Automático */}
              <div className="space-y-1.5 text-xs text-slate-600 border-b border-slate-200/90 pb-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Subtotal Productos:</span>
                  <div className="text-right font-bold text-slate-800">
                    <span>{formatUsd(totals.subtotalUsd)}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                      ({formatVes(totals.subtotalVes)})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Truck className="h-3.5 w-3.5 text-catador-blue shrink-0" />
                    <span>Delivery Automático ({deliveryQuote.tierBadge}):</span>
                  </span>
                  <div className="text-right font-bold text-catador-blue">
                    <span>{formatUsd(deliveryQuote.shippingUsd)}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                      ({formatVes(convertUsdToVes(deliveryQuote.shippingUsd, bcvRate))})
                    </span>
                  </div>
                </div>
              </div>

              {/* Total General a Pagar */}
              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <span className="text-xs font-black text-slate-900 block">Total a Pagar</span>
                  <span className="text-[11px] font-bold text-catador-blue font-mono">
                    {formatVes(totalConDeliveryVes)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-catador-blue leading-none">
                    {formatUsd(totalConDeliveryUsd)}
                  </p>
                  <span className="text-[10px] text-slate-400">Tasa Oficial BCV</span>
                </div>
              </div>

              {isAuthenticated ? (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light py-3 text-sm font-extrabold text-white shadow-md transition-colors"
                >
                  <span>Continuar al Pago</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-center text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg py-1.5 px-2">
                    Para comprar es obligatorio registrarse o iniciar sesión
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
