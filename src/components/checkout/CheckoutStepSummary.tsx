'use client';

import Image from 'next/image';
import { ShieldCheck, ArrowLeft, Loader2, MessageSquareText, AlertTriangle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CartItem, DeliveryQuoteResult } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { CartPriceSummaryRows } from '@/components/cart/CartPriceSummaryRows';
import { DeliveryDataState } from './CheckoutDeliveryForm';
import { PaymentDataState } from './CheckoutPaymentForm';
import { CheckoutSummaryOverviewCards } from './CheckoutSummaryOverviewCards';

interface CheckoutStepSummaryProps {
  items: CartItem[];
  deliveryData: DeliveryDataState;
  paymentData: PaymentDataState;
  subtotalUsd: number;
  subtotalVes: number;
  shippingUsd: number;
  totalUsd: number;
  totalVes: number;
  bcvRate: number;
  deliveryQuote: DeliveryQuoteResult;
  isSubmitting: boolean;
  isEmailConfirmed?: boolean;
  onResendConfirmEmail?: () => void;
  resendingEmail?: boolean;
  resendEmailMsg?: string | null;
  onEditStep: (step: 1 | 2) => void;
  onProcessOrder: () => void;
}

export function CheckoutStepSummary({
  items,
  deliveryData,
  paymentData,
  subtotalUsd,
  subtotalVes,
  shippingUsd,
  totalUsd,
  totalVes,
  bcvRate,
  deliveryQuote,
  isSubmitting,
  isEmailConfirmed = true,
  onResendConfirmEmail,
  resendingEmail = false,
  resendEmailMsg,
  onEditStep,
  onProcessOrder,
}: CheckoutStepSummaryProps) {
  const deliveryLabel =
    deliveryQuote.transportType === 'vehiculo_carga'
      ? 'Delivery Vehículo de Carga'
      : deliveryQuote.transportType === 'pickup'
      ? 'Retiro en Sede (Pick-Up)'
      : 'Delivery Motorizado';

  return (
    <div className="space-y-4">
      <CheckoutSummaryOverviewCards
        deliveryData={deliveryData}
        paymentData={paymentData}
        onEditStep={onEditStep}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 border-b border-gray-100 pb-2.5">
          Artículos ({items.reduce((acc, it) => acc + it.quantity, 0)})
        </h3>

        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 text-xs">
          {items.map(({ product, quantity, purchaseMode }) => {
            const mode = purchaseMode || 'unidad';
            const effectivePrice = getEffectivePriceUsd(product, mode);
            const unitsPerBox = getUnitsPerPurchaseMode(product, mode);

            return (
              <div
                key={`${product.id}-${mode}`}
                className="py-2.5 first:pt-0 flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-11 w-11 shrink-0 rounded-xl bg-slate-50/70 p-1 overflow-hidden">
                    <Image
                      src={product.images[0] || IMAGE_FALLBACKS.product}
                      alt={product.name}
                      fill
                      sizes="44px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {quantity}x {mode === 'caja' ? `Caja (${unitsPerBox} und)` : 'Unidad'} ·{' '}
                      {formatUsd(effectivePrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="font-bold text-slate-900 block">
                    {formatUsd(effectivePrice * quantity)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatVes(effectivePrice * quantity * bcvRate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 pt-3">
          <CartPriceSummaryRows
            subtotalUsd={subtotalUsd}
            subtotalVes={subtotalVes}
            discountUsd={0}
            discountVes={0}
            deliveryLabel={deliveryLabel}
            shippingUsd={shippingUsd}
            bcvRate={bcvRate}
            totalUsd={totalUsd}
            totalVes={totalVes}
          />
        </div>

        {!isEmailConfirmed && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2 text-xs text-amber-950">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Confirma tu correo ({deliveryData.email || 'tu email'})</strong> antes de
                procesar el pedido.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onResendConfirmEmail && (
                <button
                  type="button"
                  onClick={onResendConfirmEmail}
                  disabled={resendingEmail}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{resendingEmail ? 'Reenviando...' : 'Reenviar enlace'}</span>
                </button>
              )}
              {resendEmailMsg && (
                <span className="text-xs font-semibold text-amber-900">{resendEmailMsg}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onEditStep(2)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Atrás</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || items.length === 0 || !isEmailConfirmed}
            onClick={onProcessOrder}
            className={cn(
              'w-full sm:flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-full p-3.5 text-sm font-extrabold text-white shadow-sm transition-all active:scale-[0.99]',
              !isEmailConfirmed
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando orden...</span>
              </>
            ) : !isEmailConfirmed ? (
              <span>Confirma tu correo para ordenar</span>
            ) : (
              <>
                <MessageSquareText className="h-4 w-4" />
                <span>Confirmar Pedido y Abrir Chat</span>
              </>
            )}
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Al confirmar pasarás al Chat en Vivo con el Administrador</span>
        </p>
      </div>
    </div>
  );
}
