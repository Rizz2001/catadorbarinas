'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { CartItem, PurchaseMode } from '@/types';
import { formatPrices } from '@/lib/currency';
import {
  canBuyBox,
  canBuyUnit,
  getEffectivePriceUsd,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface CartDrawerItemRowProps {
  item: CartItem;
  bcvRate: number;
  cmsLogo: string;
  onUpdateQuantity: (productId: string, quantity: number, mode: PurchaseMode) => void;
  onRemoveItem: (productId: string, mode: PurchaseMode) => void;
  onSwitchMode: (productId: string, currentMode: PurchaseMode, nextMode: PurchaseMode) => void;
}

export function CartDrawerItemRow({
  item,
  bcvRate,
  cmsLogo,
  onUpdateQuantity,
  onRemoveItem,
  onSwitchMode,
}: CartDrawerItemRowProps) {
  const { product, quantity, purchaseMode } = item;
  const mode: PurchaseMode = purchaseMode || 'unidad';
  const unitPriceUsd = getEffectivePriceUsd(product, mode);
  const itemPrices = formatPrices(unitPriceUsd * quantity, bcvRate);
  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const supportsBothModes = canBuyUnit(product) && canBuyBox(product);

  const rawImg = product.images?.[0];
  const isNoImg = !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
  const itemImg = isNoImg ? cmsLogo : rawImg;

  return (
    <div className="py-3.5 flex gap-3 items-start">
      <div className="relative h-16 w-16 shrink-0 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-1">
        <Image
          src={itemImg}
          alt={product.name}
          fill
          sizes="64px"
          className={cn('object-contain', isNoImg ? 'p-2 opacity-80' : '')}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
            {product.name}
          </h4>
          <button
            type="button"
            onClick={() => onRemoveItem(product.id, mode)}
            aria-label={`Eliminar ${product.name}`}
            className="h-7 w-7 shrink-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Selector rápido Unidad / Caja en 1 toque */}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {supportsBothModes ? (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => onSwitchMode(product.id, mode, 'unidad')}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer',
                  mode === 'unidad'
                    ? 'bg-white text-catador-blue shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Unidad
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode(product.id, mode, 'caja')}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer',
                  mode === 'caja'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Package className="h-2.5 w-2.5" />
                Caja x{unitsPerBox}
              </button>
            </div>
          ) : (
            <span
              className={cn(
                'text-[10px] font-black uppercase px-2 py-0.5 rounded-md',
                mode === 'caja'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              )}
            >
              {mode === 'caja' ? `Solo Caja x${unitsPerBox}` : 'Por Unidad'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2.5">
          <div>
            <p className="text-sm font-black text-catador-blue leading-none">
              {itemPrices.usdFormatted}
            </p>
            <p className="text-[11px] font-bold text-slate-500 font-mono mt-0.5">
              {itemPrices.vesFormatted}
            </p>
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(product.id, quantity - 1, mode)}
              aria-label="Disminuir cantidad"
              className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-l-xl cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2rem] px-1 text-center text-xs font-black text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(product.id, quantity + 1, mode)}
              aria-label="Aumentar cantidad"
              className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-r-xl cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

