'use client';

import { Product } from '@/types';

interface ProductOverlayBadgeProps {
  hasDiscount: boolean;
  discountPercentage?: number;
  isDealOfTheDay?: boolean;
  inStock: boolean;
  allowBackorder?: boolean;
  saleMode?: Product['saleMode'];
  unitsPerBox: number;
}

export function ProductOverlayBadge({
  hasDiscount,
  discountPercentage,
  isDealOfTheDay,
  inStock,
  allowBackorder,
  saleMode,
  unitsPerBox,
}: ProductOverlayBadgeProps) {
  return (
    <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1">
      {hasDiscount && discountPercentage ? (
        <span className="inline-block rounded-full bg-gradient-to-r from-[#D99B38] to-[#C88A28] px-2.5 py-0.5 text-xs font-black text-white tabular-nums shadow-2xs">
          -{discountPercentage}%
        </span>
      ) : !inStock && !allowBackorder ? (
        <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-white">
          Agotado
        </span>
      ) : isDealOfTheDay ? (
        <span className="inline-block rounded-full bg-gradient-to-r from-[#D99B38] to-[#C88A28] px-2.5 py-0.5 text-xs font-black text-white shadow-2xs">
          Oferta
        </span>
      ) : saleMode === 'solo_caja' || unitsPerBox > 1 ? (
        <span className="inline-block rounded-full bg-gradient-to-r from-[#D99B38] to-[#C88A28] px-2.5 py-0.5 text-xs font-extrabold text-white tabular-nums shadow-2xs">
          Caja x{unitsPerBox}
        </span>
      ) : null}
    </div>
  );
}

export function ProductStockStatus({
  stockQuantity,
  allowBackorder,
}: {
  stockQuantity: number;
  allowBackorder?: boolean;
}) {
  if (stockQuantity === 1) {
    return (
      <span className="inline-block rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-black shrink-0">
        ¡Última und!
      </span>
    );
  }
  if (stockQuantity >= 2 && stockQuantity <= 5) {
    return (
      <span className="inline-block rounded-full bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/60 px-2 py-0.5 text-[11px] font-extrabold tabular-nums shrink-0">
        ¡Últimas {stockQuantity}!
      </span>
    );
  }
  if (stockQuantity > 5) {
    return (
      <span className="text-xs font-bold text-emerald-700 tabular-nums shrink-0">
        {stockQuantity} disp.
      </span>
    );
  }
  if (allowBackorder) {
    return <span className="text-xs font-bold text-catador-blue shrink-0">Disponible</span>;
  }
  return <span className="text-xs font-bold text-rose-600 shrink-0">Sin stock</span>;
}

