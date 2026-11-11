'use client';

import { Minus, Plus } from 'lucide-react';
import { Product, PurchaseMode } from '@/types';
import { splitUsdParts } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface ProductPurchaseControlsProps {
  product: Product;
  mode: PurchaseMode;
  onModeChange: (mode: PurchaseMode) => void;
  unitsPerBox: number;
  boxAvailable: boolean;
  isCompact: boolean;
  prices: { usdFormatted: string; vesFormatted: string };
  hasDiscount: boolean;
  inCartQty: number;
  canAddMore: boolean;
  isAdded: boolean;
  onQuickAdd: (e: React.MouseEvent) => void;
  onUpdateQuantity: (qty: number) => void;
}

export function ProductPurchaseControls({
  product,
  mode,
  onModeChange,
  unitsPerBox,
  boxAvailable,
  isCompact,
  prices,
  hasDiscount,
  inCartQty,
  canAddMore,
  onQuickAdd,
  onUpdateQuantity,
}: ProductPurchaseControlsProps) {
  const { intPart, decPart } = splitUsdParts(prices.usdFormatted);

  return (
    <>
      {!isCompact && (
        <div className="min-h-[36px] mt-2 mb-2 flex items-center">
          <div className="w-full flex items-center justify-center rounded-full bg-[#F1F5F9] border border-slate-200/80 px-2 py-1 text-xs min-w-0">
            {product.saleMode === 'solo_caja' ? (
              <span className="font-black text-[#0F172A] py-0.5 tabular-nums truncate">
                Caja Cerrada x{unitsPerBox}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onModeChange('unidad');
                  }}
                  className={cn(
                    'flex-1 text-center py-0.5 px-2 rounded-full transition-colors cursor-pointer truncate',
                    mode === 'unidad'
                      ? 'font-black text-[#0F172A] bg-white shadow-2xs'
                      : 'font-semibold text-slate-600 hover:text-[#0F172A]'
                  )}
                >
                  Unidad
                </button>
                <span className="text-slate-300 px-1 select-none">|</span>
                <button
                  type="button"
                  disabled={!boxAvailable || product.saleMode === 'solo_unidad'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (boxAvailable && product.saleMode !== 'solo_unidad') {
                      onModeChange('caja');
                    }
                  }}
                  className={cn(
                    'flex-1 text-center py-0.5 px-2 rounded-full transition-colors truncate tabular-nums',
                    !boxAvailable || product.saleMode === 'solo_unidad'
                      ? 'font-medium text-slate-400 cursor-not-allowed'
                      : mode === 'caja'
                      ? 'font-black text-[#0F172A] bg-white shadow-2xs cursor-pointer'
                      : 'font-semibold text-slate-600 hover:text-[#0F172A] cursor-pointer'
                  )}
                >
                  {unitsPerBox > 1 ? `Caja x${unitsPerBox}` : 'Caja'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          'mt-auto pt-2 border-t border-slate-100 flex items-end justify-between gap-2 min-w-0',
          isCompact && 'flex-col items-stretch sm:flex-row sm:items-end'
        )}
      >
        <div className="flex flex-col items-start min-w-0 tabular-nums">
          <span
            className={cn(
              'inline-flex items-start font-black tracking-tight leading-none text-[#0F172A]',
              isCompact ? 'text-base' : 'text-[19px] sm:text-[21px]',
              hasDiscount && 'text-[#0F172A]'
            )}
          >
            <span className="text-[0.62em] font-extrabold mr-0.5 mt-[0.12em]">$</span>
            <span>{intPart}</span>
            <span className="text-[0.58em] font-extrabold ml-0.5 mt-[0.12em]">.{decPart}</span>
          </span>
          <span className="text-xs font-bold text-slate-600 mt-1 leading-tight truncate max-w-full">
            {prices.vesFormatted}
          </span>
        </div>

        {/* Cápsula Sólida Navy '- 1 +' estilo Opción C */}
        <div
          className={cn(
            'inline-flex items-center justify-between rounded-full bg-[#0F172A] text-white px-1 py-0.5 shrink-0 tabular-nums shadow-2xs',
            isCompact ? 'w-full sm:w-auto' : 'w-auto'
          )}
        >
          <button
            type="button"
            disabled={inCartQty <= 0}
            onClick={(e) => {
              e.preventDefault();
              if (inCartQty > 0) onUpdateQuantity(inCartQty - 1);
            }}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95',
              inCartQty > 0
                ? 'text-white hover:bg-white/15 cursor-pointer'
                : 'text-white/40 cursor-not-allowed'
            )}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>

          <span className="px-2 text-xs sm:text-[13px] font-black min-w-[22px] text-center select-none">
            {inCartQty > 0 ? inCartQty : 1}
          </span>

          <button
            type="button"
            disabled={!canAddMore}
            onClick={(e) => {
              if (inCartQty > 0) {
                e.preventDefault();
                onUpdateQuantity(inCartQty + 1);
              } else {
                onQuickAdd(e);
              }
            }}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-95',
              canAddMore
                ? 'text-white hover:bg-white/15 cursor-pointer'
                : 'text-white/40 cursor-not-allowed'
            )}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </>
  );
}

