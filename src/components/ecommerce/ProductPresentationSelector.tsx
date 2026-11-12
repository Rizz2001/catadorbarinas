'use client';

import { Box, Package } from 'lucide-react';
import { Product, PurchaseMode } from '@/types';
import { cn } from '@/lib/utils';

interface ProductPresentationSelectorProps {
  product: Product;
  mode: PurchaseMode;
  unitsPerBox: number;
  maxBoxesAllowed: number;
  unitPriceFormatted: string;
  boxPriceFormatted: string;
  onModeSwitch: (nextMode: PurchaseMode) => void;
}

export function ProductPresentationSelector({
  product,
  mode,
  unitsPerBox,
  maxBoxesAllowed,
  unitPriceFormatted,
  boxPriceFormatted,
  onModeSwitch,
}: ProductPresentationSelectorProps) {
  const isBoxUnavailable = maxBoxesAllowed <= 0 && !product.allowBackorder;

  return (
    <div className="space-y-2">
      <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide block">
        Presentación de compra
      </span>
      <div
        className={cn(
          'grid grid-cols-1 gap-2.5',
          product.saleMode === 'ambos' && 'sm:grid-cols-2'
        )}
      >
        {product.saleMode !== 'solo_caja' && (
          <button
            type="button"
            onClick={() => onModeSwitch('unidad')}
            className={cn(
              'flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl border text-left transition-colors cursor-pointer',
              mode === 'unidad'
                ? 'border-catador-blue bg-blue-50/40 ring-2 ring-catador-blue/15'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900 min-w-0">
              <Box className="h-4 w-4 text-catador-blue shrink-0" strokeWidth={1.5}/>
              <span className="truncate">Unidad (1 {product.unit.toLowerCase()})</span>
            </span>
            <span className="text-sm font-black text-catador-blue tabular-nums shrink-0">
              {unitPriceFormatted}
            </span>
          </button>
        )}

        {product.saleMode !== 'solo_unidad' && (
          <button
            type="button"
            disabled={isBoxUnavailable}
            onClick={() => onModeSwitch('caja')}
            className={cn(
              'flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl border text-left transition-colors',
              mode === 'caja'
                ? 'border-catador-blue bg-blue-50/40 ring-2 ring-catador-blue/15 cursor-pointer'
                : isBoxUnavailable
                ? 'border-slate-200 bg-slate-50 opacity-55 cursor-not-allowed'
                : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-4 w-4 text-catador-amber shrink-0" strokeWidth={1.5}/>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">
                  {product.boxUnitLabel || 'Caja'} x{unitsPerBox}
                </span>
                {isBoxUnavailable && (
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Requiere {unitsPerBox} und
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm font-black text-catador-blue tabular-nums shrink-0">
              {boxPriceFormatted}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

