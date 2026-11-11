'use client';

import Link from 'next/link';
import { Trash2, ArrowLeft, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { CartPageItemRow } from './CartPageItemRow';

export function CartItemList() {
  const {
    items,
    updateQuantity,
    removeItem,
    switchPurchaseMode,
    clearCart,
    lastStockWarning,
  } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rateInfo.rate);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || IMAGE_FALLBACKS.product;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F8FA] text-slate-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Tu carrito está vacío</h2>
        <p className="text-[13px] text-slate-600 mt-1 max-w-sm mx-auto">
          Explora nuestro catálogo de licores, cervezas y víveres para agregar tus favoritos.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-catador-blue px-6 py-3 text-xs font-extrabold text-white hover:bg-catador-blue-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 tabular-nums">
          Artículos en tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})
        </h2>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" /> Vaciar
        </button>
      </div>

      {lastStockWarning && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-catador-amber-soft border border-catador-amber-oak/70 flex items-center gap-2 text-xs font-bold text-[#8B3E03]">
          <AlertTriangle className="h-4 w-4 text-catador-amber shrink-0" />
          <span>{lastStockWarning}</span>
        </div>
      )}

      <div className="divide-y divide-slate-100 p-4 sm:p-5 space-y-4">
        {items.map((item) => (
          <CartPageItemRow
            key={`${item.product.id}-${item.purchaseMode || 'unidad'}`}
            item={item}
            allItems={items}
            bcvRate={bcvRate}
            cmsLogo={cmsLogo}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onSwitchMode={switchPurchaseMode}
          />
        ))}
      </div>

      <div className="p-4 bg-[#F7F8FA] border-t border-slate-100">
        <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-catador-blue hover:text-catador-blue-dark transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
