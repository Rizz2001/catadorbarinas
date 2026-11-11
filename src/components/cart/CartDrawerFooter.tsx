'use client';

import Link from 'next/link';
import { ArrowRight, Truck } from 'lucide-react';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { CartTotals } from '@/types';
import { CartAuthBottomSheet } from './CartAuthBottomSheet';
import { CartDeliveryAddressBox } from './CartDeliveryAddressBox';

interface CartDrawerFooterProps {
  totals: CartTotals;
  bcvRate: number;
  deliveryType: 'delivery' | 'pickup';
  shippingUsd: number;
  tierBadge: string;
  totalConDeliveryUsd: number;
  totalConDeliveryVes: number;
  isAuthenticated: boolean;
  profileAddress?: string | null;
  showAuthSheet: boolean;
  onShowAuthSheet: (val: boolean) => void;
  onCloseCart: () => void;
}

export function CartDrawerFooter({
  totals,
  bcvRate,
  deliveryType,
  shippingUsd,
  tierBadge,
  totalConDeliveryUsd,
  totalConDeliveryVes,
  isAuthenticated,
  profileAddress,
  showAuthSheet,
  onShowAuthSheet,
  onCloseCart,
}: CartDrawerFooterProps) {
  if (showAuthSheet && !isAuthenticated) {
    return (
      <CartAuthBottomSheet
        onCloseCart={onCloseCart}
        onDismissSheet={() => onShowAuthSheet(false)}
      />
    );
  }

  return (
    <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-white space-y-3">
      <CartDeliveryAddressBox
        isAuthenticated={isAuthenticated}
        profileAddress={profileAddress}
        variant="drawer"
        onNavigate={onCloseCart}
      />

      <div className="space-y-1.5 text-[13px] text-slate-700 border-b border-slate-100 pb-2.5 tabular-nums">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-600">Costo de productos</span>
          <div className="text-right font-bold text-slate-900">
            <span>{formatUsd(totals.subtotalUsd)}</span>
            <span className="text-xs text-slate-500 ml-1.5">
              ({formatVes(totals.subtotalVes)})
            </span>
          </div>
        </div>

        {totals.discountUsd > 0 && (
          <div className="flex justify-between items-center text-emerald-700">
            <span className="font-bold">Ahorro aplicado</span>
            <span className="font-black">
              -{formatUsd(totals.discountUsd)} (-{formatVes(totals.discountVes)})
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Truck className="h-3.5 w-3.5 text-catador-blue shrink-0" />
            <span>{deliveryType === 'pickup' ? 'Retiro Pick-Up' : `Delivery (${tierBadge})`}</span>
          </span>
          <div className="text-right font-bold text-slate-900">
            <span>{shippingUsd === 0 ? 'Gratis' : formatUsd(shippingUsd)}</span>
            {shippingUsd > 0 && (
              <span className="text-xs text-slate-500 ml-1.5">
                ({formatVes(convertUsdToVes(shippingUsd, bcvRate))})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5 tabular-nums">
        <div>
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide block">
            Total
          </span>
          <span className="text-xs font-bold text-catador-blue">
            {formatVes(totalConDeliveryVes)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-900 leading-none">
            {formatUsd(totalConDeliveryUsd)}
          </p>
          <span className="text-[11px] font-semibold text-slate-500">Tasa Oficial BCV</span>
        </div>
      </div>

      {isAuthenticated ? (
        <Link
          href="/checkout"
          onClick={onCloseCart}
          className="group w-full min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] active:scale-[0.98] py-3 text-sm font-extrabold text-white transition-all"
        >
          <span>Ir a pagar</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onShowAuthSheet(true)}
          className="group w-full min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#001754] active:scale-[0.98] py-3 text-sm font-extrabold text-white transition-all cursor-pointer"
        >
          <span>Ir a pagar</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}
