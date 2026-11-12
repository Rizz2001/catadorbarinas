'use client';

import { X, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { CartDrawerItemRow } from '@/components/cart/CartDrawerItemRow';
import { CartDrawerFooter } from '@/components/cart/CartDrawerFooter';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-w-full flex sm:pl-10">
        <aside className="w-full sm:w-screen sm:max-w-md max-h-[90dvh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
          <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
          </div>

          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-catador-blue" strokeWidth={1.5}/>
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Carrito ({totals.itemCount})
                </h2>
                <span className="text-xs text-slate-400">
                  {totals.itemCount === 1 ? '1 art.' : `${totals.itemCount} art.`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5}/>
                  <span>Vaciar</span>
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" strokeWidth={1.5}/>
              </button>
            </div>
          </div>

          {lastStockWarning && (
            <div className="mx-4 mt-3 p-2.5 rounded-xl bg-catador-amber-soft/70 flex items-center gap-2 text-xs font-semibold text-[#8B3E03]">
              <AlertTriangle className="h-4 w-4 text-catador-amber shrink-0" strokeWidth={1.5}/>
              <span>{lastStockWarning}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100 bg-white">
            {items.length === 0 ? (
              <div className="h-full py-12 flex flex-col items-center justify-center text-center text-slate-500">
                <ShoppingBag className="h-14 w-14 stroke-1 mb-3 text-slate-300" strokeWidth={1.5}/>
                <p className="text-sm font-extrabold text-slate-800">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Agrega productos por unidad o por caja para ver tu cotización bimonetaria.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-5 rounded-full bg-catador-blue px-6 py-2.5 text-xs font-extrabold text-white hover:bg-catador-blue-dark transition-colors cursor-pointer"
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
            <CartDrawerFooter
              totals={totals}
              bcvRate={bcvRate}
              onCloseCart={closeCart}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
