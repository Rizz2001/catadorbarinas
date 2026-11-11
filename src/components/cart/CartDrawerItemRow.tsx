'use client';

import Image from 'next/image';
import { X, Plus, Minus, Package } from 'lucide-react';
import { CartItem, PurchaseMode } from '@/types';
import { formatPrices } from '@/lib/currency';
import {
  canBuyBox,
  canBuyUnit,
  getEffectivePriceUsd,
  getMaxAllowedQuantity,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
import { useCartStore } from '@/store/useCartStore';
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

  const cartItems = useCartStore((state) => state.items);
  const otherItems = cartItems.filter(
    (i) => !(i.product.id === product.id && (i.purchaseMode || 'unidad') === mode)
  );
  const maxAllowed = getMaxAllowedQuantity(product, mode, otherItems);
  const canAddMore = product.allowBackorder || quantity < maxAllowed;
  const isOutOfStock = !product.allowBackorder && (product.stockQuantity <= 0 || maxAllowed <= 0);

  const rawImg = product.images?.[0];
  const isNoImg = !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
  const itemImg = isNoImg ? cmsLogo : rawImg;

  return (
    <div className="py-3.5 flex gap-3 items-start">
      <div className="relative h-16 w-16 shrink-0 rounded-xl bg-slate-50/70 overflow-hidden p-1.5">
        <Image
          src={itemImg}
          alt={product.name}
          fill
          sizes="64px"
          className={cn(
            'object-contain mix-blend-multiply contrast-[1.08] brightness-[1.05]',
            isNoImg ? 'p-2 opacity-80' : ''
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-extrabold text-slate-900 line-clamp-2 leading-snug">
            {product.name}
          </h4>
          <button
            type="button"
            onClick={() => onRemoveItem(product.id, mode)}
            aria-label={`Eliminar ${product.name}`}
            className="h-8 w-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {supportsBothModes ? (
            <div className="inline-flex rounded-full bg-[#F7F8FA] p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => onSwitchMode(product.id, mode, 'unidad')}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer',
                  mode === 'unidad'
                    ? 'bg-catador-blue text-white'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Unidad
              </button>
              <button
                type="button"
                disabled={!product.allowBackorder && getMaxAllowedQuantity(product, 'caja', otherItems) <= 0}
                onClick={() => onSwitchMode(product.id, mode, 'caja')}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all',
                  mode === 'caja'
                    ? 'bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/60'
                    : !product.allowBackorder && getMaxAllowedQuantity(product, 'caja', otherItems) <= 0
                    ? 'text-slate-300 opacity-40 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 cursor-pointer'
                )}
              >
                <Package className="h-3 w-3" />
                Caja x{unitsPerBox}
              </button>
            </div>
          ) : (
            <span
              className={cn(
                'text-[11px] font-extrabold px-2.5 py-0.5 rounded-full',
                mode === 'caja'
                  ? 'bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/50'
                  : 'bg-slate-100 text-slate-700'
              )}
            >
              {mode === 'caja' ? `Solo Caja x${unitsPerBox}` : 'Por Unidad'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2.5">
          <div className="tabular-nums">
            <p className="text-sm font-black text-slate-900 leading-none">
              {itemPrices.usdFormatted}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {itemPrices.vesFormatted}
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-catador-blue text-white px-1 py-0.5 shadow-2xs tabular-nums">
            <button
              type="button"
              onClick={() => onUpdateQuantity(product.id, quantity - 1, mode)}
              aria-label="Disminuir cantidad"
              className="h-8 w-8 flex items-center justify-center text-white hover:bg-white/15 rounded-full cursor-pointer transition-colors"
            >
              <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
            <span className="min-w-[1.75rem] px-1 text-center text-xs font-black">
              {quantity}
            </span>
            <button
              type="button"
              disabled={!canAddMore}
              onClick={() => onUpdateQuantity(product.id, quantity + 1, mode)}
              aria-label="Aumentar cantidad"
              title={!canAddMore ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-full transition-colors',
                canAddMore
                  ? 'text-white hover:bg-white/15 cursor-pointer'
                  : 'text-white/40 cursor-not-allowed'
              )}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {isOutOfStock && (
          <p className="text-[11px] font-bold text-rose-600 mt-1">
            Stock insuficiente para este artículo.
          </p>
        )}
      </div>
    </div>
  );
}
