'use client';

import { AlertTriangle, Check, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { PurchaseMode } from '@/types';
import { cn } from '@/lib/utils';

interface ProductDetailBuyBoxProps {
  mode: PurchaseMode;
  unitsPerBox: number;
  safeQuantity: number;
  currentMax: number;
  allowBackorder?: boolean;
  isOutOfStock: boolean;
  isAdded: boolean;
  feedbackMsg: string | null;
  totalUsdFormatted: string;
  totalVesFormatted: string;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onDirectBuy: () => void;
}

export function ProductDetailBuyBox({
  mode,
  unitsPerBox,
  safeQuantity,
  currentMax,
  allowBackorder,
  isOutOfStock,
  isAdded,
  feedbackMsg,
  totalUsdFormatted,
  totalVesFormatted,
  onQuantityChange,
  onAddToCart,
  onDirectBuy,
}: ProductDetailBuyBoxProps) {
  const requiredBaseUnits = safeQuantity * (mode === 'caja' ? unitsPerBox : 1);

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-extrabold text-slate-700 block">
            Cantidad
          </span>
          {mode === 'caja' && (
            <span className="text-[11px] font-bold text-slate-500 tabular-nums block">
              Equivale a {requiredBaseUnits} unidades
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-full bg-[#0F172A] text-white p-1 tabular-nums shadow-2xs">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, safeQuantity - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4 stroke-[2.5]" />
            </button>
            <span className="w-9 text-center text-sm font-black text-white select-none">
              {safeQuantity}
            </span>
            <button
              type="button"
              disabled={!allowBackorder && safeQuantity >= currentMax}
              onClick={() => onQuantityChange(Math.min(currentMax, safeQuantity + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {[2, 6, 12].map((preset) =>
              preset <= currentMax ? (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onQuantityChange(preset)}
                  className={cn(
                    'px-3 h-8 rounded-full text-xs font-extrabold border transition-all active:scale-95 cursor-pointer tabular-nums',
                    safeQuantity === preset
                      ? 'bg-[#FEF3C7] text-[#8B3E03] border-[#EB9C53]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F172A]'
                  )}
                >
                  {preset}
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 text-xs font-bold text-[#8B3E03] bg-catador-amber-soft border border-catador-amber-oak/60 rounded-xl px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-catador-amber" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'hidden md:flex w-full items-center justify-center gap-2 h-12 px-5 rounded-full font-extrabold text-sm transition-all active:scale-[0.98]',
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white cursor-pointer'
              : 'bg-[#0F172A] hover:bg-[#001754] text-white cursor-pointer shadow-xs'
          )}
        >
          {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4 text-[#EB9C53]" />}
          <span>
            {isOutOfStock
              ? 'Agotado en Bodegón'
              : isAdded
              ? '¡Agregado!'
              : 'Agregar al carrito'}
          </span>
        </button>

        <button
          type="button"
          onClick={onDirectBuy}
          disabled={isOutOfStock}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-11 md:h-12 px-5 rounded-full font-extrabold text-[13px] border transition-all active:scale-[0.98]',
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-[#FEF3C7]/60 hover:bg-[#FEF3C7] text-[#8B3E03] border-[#EB9C53]/70 cursor-pointer'
          )}
        >
          <Zap className="h-4 w-4 text-[#D99B38]" />
          <span>{isOutOfStock ? 'Sin Existencias' : 'Comprar ahora directo'}</span>
        </button>
      </div>

      {/* Barra fija inferior en móvil sobre BottomNav para agregar con 1 toque */}
      <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] px-3.5 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0 tabular-nums">
          <p className="text-base font-black text-slate-900 leading-none">{totalUsdFormatted}</p>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{totalVesFormatted}</p>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'flex-1 min-h-[44px] h-11 flex items-center justify-center gap-2 px-4 rounded-full font-extrabold text-sm transition-all active:scale-[0.98]',
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0F172A] text-white shadow-sm'
          )}
        >
          {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4 text-[#EB9C53]" />}
          <span>{isOutOfStock ? 'Agotado' : isAdded ? '¡Agregado!' : 'Agregar'}</span>
        </button>
      </div>
    </div>
  );
}

