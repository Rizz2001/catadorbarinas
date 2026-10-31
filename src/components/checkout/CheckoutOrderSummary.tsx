'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, ArrowRight, Loader2, Truck, Bike } from 'lucide-react';
import { CartItem, DeliveryQuoteResult } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { getEffectivePriceUsd, getUnitsPerPurchaseMode } from '@/lib/inventory';
import { IMAGE_FALLBACKS } from '@/constants/config';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotalUsd: number;
  subtotalVes: number;
  shippingUsd: number;
  shippingVes: number;
  totalUsd: number;
  totalVes: number;
  bcvRate: number;
  deliveryQuote?: DeliveryQuoteResult;
  isSubmitting: boolean;
  onProcessOrder: () => void;
}

export function CheckoutOrderSummary({
  items,
  subtotalUsd,
  subtotalVes,
  shippingUsd,
  shippingVes,
  totalUsd,
  totalVes,
  bcvRate,
  deliveryQuote,
  isSubmitting,
  onProcessOrder,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
        Resumen de la Orden ({items.reduce((acc, it) => acc + it.quantity, 0)} ítems)
      </h3>

      <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {items.map(({ product, quantity, purchaseMode }) => {
          const mode = purchaseMode || 'unidad';
          const effectivePrice = getEffectivePriceUsd(product, mode);
          const unitsPerBox = getUnitsPerPurchaseMode(product, mode);

          return (
            <div key={`${product.id}-${mode}`} className="flex items-center gap-2.5 justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative h-10 w-10 shrink-0 rounded-lg bg-slate-50 border p-1 overflow-hidden">
                  <Image
                    src={product.images[0] || IMAGE_FALLBACKS.product}
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-600">
                    {quantity}x {mode === 'caja' ? `Caja (${unitsPerBox} und)` : 'Unidad'} •{' '}
                    {formatUsd(effectivePrice)}
                  </p>
                </div>
              </div>
              <span className="font-bold text-slate-900 shrink-0">
                {formatUsd(effectivePrice * quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Desglose Bimonetario y Transporte */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal Mercancía</span>
          <span className="font-semibold text-slate-800">
            {formatUsd(subtotalUsd)} / {formatVes(subtotalVes)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            {deliveryQuote?.transportType === 'vehiculo_carga' ? (
              <Truck className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <Bike className="h-3.5 w-3.5 text-catador-blue" />
            )}
            <span>
              {deliveryQuote?.transportType === 'vehiculo_carga'
                ? 'Delivery Vehículo (Carga)'
                : deliveryQuote?.transportType === 'pickup'
                ? 'Retiro Pick-Up'
                : 'Delivery Motorizado'}
            </span>
          </span>
          <span className="font-semibold text-slate-800">
            {shippingUsd === 0 ? (
              <span className="text-emerald-600 font-bold">¡Gratis!</span>
            ) : (
              `${formatUsd(shippingUsd)} / ${formatVes(shippingVes)}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>Tasa Oficial BCV</span>
          <span>Bs. {bcvRate.toFixed(2)} / $</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
        <div>
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
            Total a Pagar
          </span>
          <span className="text-2xl font-black text-catador-blue tracking-tight">
            {formatUsd(totalUsd)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-800 block">{formatVes(totalVes)}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isSubmitting || items.length === 0}
        onClick={onProcessOrder}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 p-3.5 text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando Stock y Creando Pedido...</span>
          </>
        ) : (
          <>
            <span>Procesar Pedido en Línea</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Validación matemática de inventario en tiempo real</span>
      </div>
    </div>
  );
}
