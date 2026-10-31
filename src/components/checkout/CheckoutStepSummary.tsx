'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Truck,
  Bike,
  MapPin,
  CreditCard,
  Edit3,
  MessageSquareText,
} from 'lucide-react';
import { CartItem, DeliveryQuoteResult } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { DeliveryDataState } from './CheckoutDeliveryForm';
import { PaymentDataState } from './CheckoutPaymentForm';

interface CheckoutStepSummaryProps {
  items: CartItem[];
  deliveryData: DeliveryDataState;
  paymentData: PaymentDataState;
  subtotalUsd: number;
  subtotalVes: number;
  shippingUsd: number;
  shippingVes: number;
  totalUsd: number;
  totalVes: number;
  bcvRate: number;
  deliveryQuote: DeliveryQuoteResult;
  isSubmitting: boolean;
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
  shippingVes,
  totalUsd,
  totalVes,
  bcvRate,
  deliveryQuote,
  isSubmitting,
  onEditStep,
  onProcessOrder,
}: CheckoutStepSummaryProps) {
  const paymentMethodLabel =
    paymentData.metodoPago === 'pago_movil'
      ? 'Pago Móvil en Bolívares (BCV)'
      : paymentData.metodoPago === 'zelle'
      ? 'Transferencia Zelle ($ USD)'
      : 'Efectivo en Divisas ($ USD contra entrega)';

  return (
    <div className="space-y-5">
      {/* Tarjetas de verificación rápida de Pasos 1 y 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-catador-blue" />
              1. Cliente y Entrega
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] font-bold text-catador-blue hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="h-3 w-3" /> Editar
            </button>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">
              {deliveryData.nombre} • <span className="font-mono">{deliveryData.cedula}</span>
            </p>
            <p>Teléfono: {deliveryData.telefono}</p>
            <p className="text-[11px] text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100">
              {deliveryData.tipoEntrega === 'pickup' ? (
                <strong className="text-emerald-700">Retiro en Tienda (Pick-Up Av. 23 de Enero)</strong>
              ) : (
                <>
                  <strong>{deliveryData.zonaBarinas}:</strong> {deliveryData.direccion}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-catador-amber" />
              2. Método de Pago
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-[11px] font-bold text-catador-blue hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="h-3 w-3" /> Editar
            </button>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{paymentMethodLabel}</p>
            {paymentData.metodoPago !== 'efectivo_usd' ? (
              <>
                <p>Origen / Titular: {paymentData.bancoOrigen || 'No especificado'}</p>
                <p className="font-mono text-catador-blue font-bold">
                  Referencia: #{paymentData.referencia || 'Pendiente'}
                </p>
              </>
            ) : (
              <p className="text-emerald-700 font-semibold">
                Paga con billete de {formatUsd(paymentData.billetePagoUsd)} • Vuelto:{' '}
                {formatUsd(paymentData.vueltoCalculadoUsd)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumen Completo de Artículos y Totales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          3. Artículos y Total de la Orden ({items.reduce((acc, it) => acc + it.quantity, 0)} ítems)
        </h3>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
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
                  <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-50 border p-1 overflow-hidden">
                    <Image
                      src={product.images[0] || IMAGE_FALLBACKS.product}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-600">
                      {quantity}x{' '}
                      <span className="font-bold text-catador-blue">
                        {mode === 'caja' ? `Caja (${unitsPerBox} und)` : 'Unidad'}
                      </span>{' '}
                      • {formatUsd(effectivePrice)} c/u
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-900 block">
                    {formatUsd(effectivePrice * quantity)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {formatVes(effectivePrice * quantity * bcvRate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal Mercancía</span>
            <span className="font-bold text-slate-800">
              {formatUsd(subtotalUsd)} / {formatVes(subtotalVes)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              {deliveryQuote.transportType === 'vehiculo_carga' ? (
                <Truck className="h-4 w-4 text-amber-600" />
              ) : (
                <Bike className="h-4 w-4 text-catador-blue" />
              )}
              <span>
                {deliveryQuote.transportType === 'vehiculo_carga'
                  ? 'Delivery Vehículo de Carga'
                  : deliveryQuote.transportType === 'pickup'
                  ? 'Retiro en Tienda (Pick-Up)'
                  : 'Delivery Motorizado'}
              </span>
            </span>
            <span className="font-bold text-slate-800">
              {shippingUsd === 0 ? (
                <span className="text-emerald-600 font-extrabold">¡Gratis!</span>
              ) : (
                `${formatUsd(shippingUsd)} / ${formatVes(shippingVes)}`
              )}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between bg-slate-50 -mx-5 px-5 py-3">
          <div>
            <span className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Total Final a Pagar
            </span>
            <span className="text-2xl font-black text-catador-blue">{formatUsd(totalUsd)}</span>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-slate-900 font-mono block">
              {formatVes(totalVes)}
            </span>
            <span className="text-[10px] text-slate-500">Tasa BCV: Bs. {bcvRate.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onEditStep(2)}
            className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Atrás: Método de Pago</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || items.length === 0}
            onClick={onProcessOrder}
            className="w-full sm:flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 p-3.5 text-sm font-extrabold text-white shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando Orden y Abriendo Chat...</span>
              </>
            ) : (
              <>
                <MessageSquareText className="h-4 w-4" />
                <span>Confirmar Pedido e Iniciar Chat en Vivo</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Al confirmar pasarás de inmediato al Chat en Vivo con el Administrador</span>
        </div>
      </div>
    </div>
  );
}

