'use client';

import Image from 'next/image';
import { Flame, Package, Plus, Trash2 } from 'lucide-react';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { formatUsd } from '@/lib/currency';

interface FlashSaleProductRowProps {
  sku: string;
  name: string;
  imageUrl?: string;
  basePriceUsd?: number;
  offerPriceDraft: string;
  isDeal: boolean;
  isSaving: boolean;
  onDraftChange: (val: string) => void;
  onApplyOrToggle: (nextActive: boolean) => void;
}

/**
 * Fila compartida para activar/desactivar y fijar precio de oferta relámpago de un producto.
 */
export function FlashSaleProductRow({
  sku,
  name,
  imageUrl,
  basePriceUsd,
  offerPriceDraft,
  isDeal,
  isSaving,
  onDraftChange,
  onApplyOrToggle,
}: FlashSaleProductRowProps) {
  return (
    <div
      className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 rounded-xl border p-2.5 ${
        isDeal ? 'border-amber-200/80 bg-amber-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-slate-50 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl || IMAGE_FALLBACKS.product}
              alt={name}
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          ) : (
            <Package className="h-4 w-4 text-slate-400 m-auto mt-3" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 truncate">{name}</p>
          <p className="text-[11px] text-slate-500 tabular-nums">
            SKU {sku}
            {basePriceUsd !== undefined ? ` · Base ${formatUsd(basePriceUsd)}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          step="0.01"
          min="0"
          value={offerPriceDraft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="$ Oferta"
          className="w-20 h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold tabular-nums"
        />

        {isDeal ? (
          <>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onApplyOrToggle(true)}
              className="h-8 px-2.5 rounded-lg bg-catador-blue text-white text-[11px] font-bold cursor-pointer"
            >
              Aplicar $
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onApplyOrToggle(false)}
              title="Quitar de Ofertas"
              className="h-8 w-8 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onApplyOrToggle(true)}
            className="h-8 px-2.5 rounded-lg bg-[#0F172A] hover:bg-catador-blue text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            {isSaving ? (
              <Flame className="h-3 w-3 animate-pulse" strokeWidth={2} />
            ) : (
              <Plus className="h-3 w-3" strokeWidth={2} />
            )}
            <span>En Oferta</span>
          </button>
        )}
      </div>
    </div>
  );
}

