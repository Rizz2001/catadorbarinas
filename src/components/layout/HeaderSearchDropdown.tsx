'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { Product } from '@/types';
import { formatPrices } from '@/lib/currency';
import { getDefaultPurchaseMode, getEffectivePriceUsd } from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface HeaderSearchDropdownProps {
  term: string;
  results: Product[];
  totalMatches: number;
  bcvRate: number;
  cmsLogo: string;
  addedId: string | null;
  onSelectProduct: () => void;
  onAddProduct: (product: Product) => void;
  onViewAll: (e: React.FormEvent) => void;
}

export function HeaderSearchDropdown({
  term,
  results,
  totalMatches,
  bcvRate,
  cmsLogo,
  addedId,
  onSelectProduct,
  onAddProduct,
  onViewAll,
}: HeaderSearchDropdownProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[70vh] flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 bg-[#F7F8FA] shrink-0 tabular-nums">
        <span className="truncate pr-2">Resultados para &quot;{term}&quot;</span>
        <span className="text-xs text-slate-600 font-bold shrink-0">
          {totalMatches} encontrados
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 flex-1">
        {results.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-slate-600 font-medium">
            No se encontraron productos coincidentes.
          </div>
        ) : (
          results.map((product) => {
            const effectiveUsd = getEffectivePriceUsd(product, getDefaultPurchaseMode(product));
            const prices = formatPrices(effectiveUsd, bcvRate);
            const rawImg = product.images?.[0];
            const hasNoImg =
              !rawImg || rawImg === IMAGE_FALLBACKS.product || rawImg.includes('logo');
            const imgSrc = hasNoImg ? cmsLogo : rawImg;
            const isItemAdded = addedId === product.id;
            const canBuy =
              (product.inStock || product.allowBackorder) &&
              ((product.stockQuantity ?? 0) > 0 || product.allowBackorder);

            return (
              <Link
                key={product.id}
                href={`/producto/${product.id}${product.codGrupo ? `?grupo=${product.codGrupo}` : ''}`}
                onClick={onSelectProduct}
                className="p-3 flex items-center gap-3 hover:bg-[#F7F8FA] transition-colors group"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-xl bg-white border border-slate-200 p-1 overflow-hidden flex items-center justify-center">
                  <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className={cn(
                      'object-contain transition-transform duration-200',
                      hasNoImg ? 'p-2 opacity-80' : 'group-hover:scale-105'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <span className="truncate">{product.brand}</span>
                    <span>·</span>
                    <span className={product.inStock ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {product.inStock ? `${product.stockQuantity} disp.` : 'Agotado'}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-extrabold text-slate-900 truncate group-hover:text-catador-blue transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex flex-wrap items-baseline gap-2 mt-0.5 tabular-nums">
                    <span className="text-[13px] font-black text-slate-900">
                      {prices.usdFormatted}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {prices.vesFormatted}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canBuy) onAddProduct(product);
                  }}
                  title={!canBuy ? 'Agotado en inventario' : `Agregar ${product.name} al carrito`}
                  aria-label={`Agregar ${product.name} al carrito`}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                    !canBuy
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : isItemAdded
                      ? 'bg-emerald-600 text-white cursor-pointer'
                      : 'bg-catador-blue hover:bg-catador-blue-dark text-white cursor-pointer'
                  )}
                >
                  {isItemAdded ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  )}
                </button>
              </Link>
            );
          })
        )}
      </div>

      {results.length > 0 && (
        <div className="p-2.5 bg-[#F7F8FA] border-t border-slate-200 text-center shrink-0">
          <button
            type="button"
            onClick={onViewAll}
            className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-extrabold text-catador-blue hover:text-catador-blue-dark transition-colors cursor-pointer"
          >
            Ver todos los {totalMatches} resultados <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

