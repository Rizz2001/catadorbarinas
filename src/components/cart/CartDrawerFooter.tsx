'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CartTotals } from '@/types';
import { CartAuthBottomSheet } from './CartAuthBottomSheet';
import { CartDeliveryAddressBox } from './CartDeliveryAddressBox';
import { CartPriceSummaryRows } from './CartPriceSummaryRows';

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

  const deliveryLabel =
    deliveryType === 'pickup' ? 'Retiro Pick-Up' : `Delivery (${tierBadge})`;

  return (
    <div className="px-4 pt-3.5 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white space-y-3.5">
      <CartDeliveryAddressBox
        isAuthenticated={isAuthenticated}
        profileAddress={profileAddress}
        variant="drawer"
        onNavigate={onCloseCart}
      />

      <CartPriceSummaryRows
        subtotalUsd={totals.subtotalUsd}
        subtotalVes={totals.subtotalVes}
        discountUsd={totals.discountUsd}
        discountVes={totals.discountVes}
        deliveryLabel={deliveryLabel}
        shippingUsd={shippingUsd}
        bcvRate={bcvRate}
        totalUsd={totalConDeliveryUsd}
        totalVes={totalConDeliveryVes}
      />

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
