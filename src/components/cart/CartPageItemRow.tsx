'use client';

import Image from 'next/image';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { CartItem, PurchaseMode } from '@/types';
import { formatPrices } from '@/lib/currency';
import {
  canBuyBox,
  canBuyUnit,
  getEffectivePriceUsd,
  getMaxAllowedQuantity,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface CartPageItemRowProps {
  item: CartItem;
  allItems: CartItem[];
  bcvRate: number;
  cmsLogo: string;
  onUpdateQuantity: (productId: string, quantity: number, mode?: PurchaseMode) => void;
  onRemoveItem: (productId: string, mode?: PurchaseMode) => void;
  onSwitchMode: (productId: string, currentMode: PurchaseMode, nextMode: PurchaseMode) => void;
}

export function CartPageItemRow({
  item,
  allItems,
  bcvRate,
  cmsLogo,
  onUpdateQuantity,
  onRemoveItem,
  onSwitchMode,
}: CartPageItemRowProps) {
  const { product, quantity, purchaseMode } = item;
  const mode = purchaseMode || 'unidad';
  const unitPriceUsd = getEffectivePriceUsd(product, mode);
  const itemPrices = formatPrices(unitPriceUsd * quantity, bcvRate);
  const unitPrices = formatPrices(unitPriceUsd, bcvRate);
  const unitsPerBox = getUnitsPerPurchaseMode(product, 'caja');
  const unitsPerItem = getUnitsPerPurchaseMode(product, mode);
  const totalBaseUnits = quantity * unitsPerItem;
  const supportsBothModes = canBuyUnit(product) && canBuyBox(product);

  const otherItems = allItems.filter(
    (i) => !(i.product.id === product.id && (i.purchaseMode || 'unidad') === mode)
  );
  const maxAllowed = getMaxAllowedQuantity(product, mode, otherItems);
  const maxBoxes = getMaxAllowedQuantity(product, 'caja', otherItems);
  const canAddMore = product.allowBackorder || quantity < maxAllowed;
  const isOutOfStock = !product.allowBackorder && (product.stockQuantity <= 0 || maxAllowed <= 0);

  const rawImg = product.images?.[0];
  const isNoImg = !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
  const itemImg = isNoImg ? cmsLogo : rawImg;

  return (
    <div className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-white border border-slate-200 p-1.5 overflow-hidden">
          <Image src={itemImg} alt={product.name} fill sizes="80px" className={cn('object-contain', isNoImg && 'p-2 opacity-80')} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider truncate">
              {product.brand}
            </span>
            {supportsBothModes ? (
              <div className="inline-flex rounded-full bg-[#F7F8FA] p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => onSwitchMode(product.id, mode, 'unidad')}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer',
                    mode === 'unidad' ? 'bg-catador-blue text-white' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Unidad
                </button>
                <button
                  type="button"
                  disabled={!product.allowBackorder && maxBoxes <= 0}
                  onClick={() => onSwitchMode(product.id, mode, 'caja')}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-colors',
                    mode === 'caja'
                      ? 'bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/60'
                      : !product.allowBackorder && maxBoxes <= 0
                      ? 'text-slate-300 opacity-40 cursor-not-allowed'
                      : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                  )}
                >
                  <Package className="h-3 w-3" />
                  Caja x{unitsPerBox}
                </button>
              </div>
            ) : (
              <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-full', mode === 'caja' ? 'bg-catador-amber-soft text-[#8B3E03]' : 'bg-slate-100 text-slate-700')}>
                {mode === 'caja' ? `Por Caja (${unitsPerItem} und)` : 'Por Unidad'}
              </span>
            )}
          </div>
          <h3 className="text-[13px] sm:text-sm font-extrabold text-slate-900 line-clamp-2 sm:truncate mt-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {quantity > 1 ? (
              <>
                {unitPrices.usdFormatted} c/u ·{' '}
                <span className="text-emerald-700 font-bold">{totalBaseUnits} und totales</span>
              </>
            ) : (
              <span className="text-emerald-700 font-bold">
                {totalBaseUnits} {totalBaseUnits === 1 ? product.unit.toLowerCase() : 'unidades'}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
        <div className="inline-flex items-center rounded-full bg-catador-blue text-white px-1 py-0.5 tabular-nums">
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, quantity - 1, mode)}
            className="h-8 w-8 flex items-center justify-center text-white hover:bg-white/15 transition-colors rounded-full cursor-pointer"
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
          <span className="w-7 text-center text-xs font-black">{quantity}</span>
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => onUpdateQuantity(product.id, quantity + 1, mode)}
            aria-label="Aumentar cantidad"
            className={cn(
              'h-8 w-8 flex items-center justify-center transition-colors rounded-full',
              canAddMore ? 'text-white hover:bg-white/15 cursor-pointer' : 'text-white/40 cursor-not-allowed'
            )}
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        <div className="text-right min-w-[85px] tabular-nums">
          <p className="text-sm font-black text-slate-900">{itemPrices.usdFormatted}</p>
          <p className="text-xs font-bold text-slate-600">{itemPrices.vesFormatted}</p>
        </div>

        <button
          type="button"
          onClick={() => onRemoveItem(product.id, mode)}
          className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
          aria-label={`Eliminar ${product.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isOutOfStock && (
        <div className="w-full text-left pt-1">
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5 inline-block">
            Stock insuficiente ({product.stockQuantity} und)
          </span>
        </div>
      )}
    </div>
  );
}

