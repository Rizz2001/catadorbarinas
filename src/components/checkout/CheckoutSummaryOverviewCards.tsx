'use client';

import { MapPin, CreditCard, Edit3 } from 'lucide-react';
import { formatUsd } from '@/lib/currency';
import { DeliveryDataState } from './CheckoutDeliveryForm';
import { PaymentDataState } from './CheckoutPaymentForm';

const PAYMENT_LABELS: Record<PaymentDataState['metodoPago'], string> = {
  pago_movil: 'Pago Móvil (Bs. BCV)',
  transferencia_bancaria: 'Transferencia Bancaria (BCV)',
  zelle: 'Zelle ($ USD)',
  efectivo_usd: 'Efectivo USD contra entrega',
};

interface CheckoutSummaryOverviewCardsProps {
  deliveryData: DeliveryDataState;
  paymentData: PaymentDataState;
  onEditStep: (step: 1 | 2) => void;
}

export function CheckoutSummaryOverviewCards({
  deliveryData,
  paymentData,
  onEditStep,
}: CheckoutSummaryOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-catador-blue" strokeWidth={1.5}/>
            Cliente y Entrega
          </span>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs font-semibold text-catador-blue hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="h-3 w-3" strokeWidth={1.5}/> Editar
          </button>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">
            {deliveryData.nombre} · {deliveryData.cedula}
          </p>
          <p>{deliveryData.telefono}</p>
          <p className="text-slate-500 pt-0.5">
            {deliveryData.tipoEntrega === 'pickup' ? (
              <span className="font-semibold text-emerald-700">Retiro en Sede Barinas</span>
            ) : (
              `${deliveryData.zonaBarinas} — ${deliveryData.direccion}`
            )}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-catador-amber" strokeWidth={1.5}/>
            Método de Pago
          </span>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs font-semibold text-catador-blue hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="h-3 w-3" strokeWidth={1.5}/> Editar
          </button>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">{PAYMENT_LABELS[paymentData.metodoPago]}</p>
          {paymentData.metodoPago !== 'efectivo_usd' ? (
            <>
              <p>Origen: {paymentData.bancoOrigen || 'No especificado'}</p>
              <p className="font-mono text-catador-blue font-semibold">
                Ref: #{paymentData.referencia || 'Pendiente'}
              </p>
            </>
          ) : (
            <p className="text-emerald-700 font-medium">
              Billete de {formatUsd(paymentData.billetePagoUsd)} · Vuelto:{' '}
              {formatUsd(paymentData.vueltoCalculadoUsd)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

