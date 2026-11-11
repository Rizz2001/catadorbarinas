'use client';

import type { ChangeEvent } from 'react';
import { StoreConfig } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { PaymentDataState } from './CheckoutPaymentForm';
import { CopyableFieldsBox, ReferenceAndReceiptFields } from './CheckoutBankHelpers';

interface CheckoutPaymentDetailsProps {
  paymentData: PaymentDataState;
  storeConfig: StoreConfig | null;
  totalUsd: number;
  totalVes: number;
  bcvRate: number;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
  onChange: (patch: Partial<PaymentDataState>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBillSelect: (billUsd: number) => void;
}

export function CheckoutPaymentDetails({
  paymentData,
  storeConfig,
  totalUsd,
  totalVes,
  bcvRate,
  copiedField,
  onCopy,
  onChange,
  onFileChange,
  onBillSelect,
}: CheckoutPaymentDetailsProps) {
  if (paymentData.metodoPago === 'pago_movil') {
    const banco = storeConfig?.pago_movil_banco || 'Banesco (0134)';
    const rif = storeConfig?.pago_movil_cedula || 'J-50123456-7';
    const tel = storeConfig?.pago_movil_telefono || '0414-5738890';

    return (
      <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-3.5 sm:p-4 space-y-4">
        <CopyableFieldsBox
          title="Datos Oficiales para Pago Móvil"
          gridClass="grid-cols-1 sm:grid-cols-3"
          amountLabel={`Monto exacto a transferir: ${formatVes(totalVes)}`}
          copiedField={copiedField}
          onCopy={onCopy}
          fields={[
            { id: 'banco', label: 'Banco', value: banco, copyValue: storeConfig?.pago_movil_banco || '0134' },
            { id: 'rif', label: 'RIF / Cédula', value: rif, copyValue: rif },
            { id: 'tel', label: 'Teléfono', value: tel, copyValue: storeConfig?.pago_movil_telefono || '04145738890' },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Banco Emisor *"
          bancoPlaceholder="Ej: Banesco, Mercantil, Venezuela"
          refLabel="Número de Referencia (Últimos 6 dígitos) *"
          refPlaceholder="Ej: 549120"
          refMaxLength={8}
          uploadLabel="Comprobante de Pago Móvil (Capture) *"
          paymentData={paymentData}
          onChange={onChange}
          onFileChange={onFileChange}
        />
      </div>
    );
  }

  if (paymentData.metodoPago === 'transferencia_bancaria') {
    const banco = storeConfig?.transferencia_banco || 'Banco Mercantil (0105)';
    const cuenta = storeConfig?.transferencia_cuenta || '01050616611616161043';
    const titular = storeConfig?.transferencia_titular || 'Maria Milagros Garcia';
    const rif = storeConfig?.transferencia_cedula || 'V-22582611';

    return (
      <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-3.5 sm:p-4 space-y-4">
        <CopyableFieldsBox
          title="Datos Oficiales para Transferencia Bancaria"
          gridClass="grid-cols-1 sm:grid-cols-2"
          amountLabel={`Monto exacto a transferir: ${formatVes(totalVes)}`}
          copiedField={copiedField}
          onCopy={onCopy}
          fields={[
            { id: 'tf_banco', label: 'Banco Receptor', value: banco, copyValue: storeConfig?.transferencia_banco || 'Banco Mercantil' },
            { id: 'tf_tipo', label: 'Tipo de Cuenta', value: storeConfig?.transferencia_tipo_cuenta || 'Cuenta Corriente' },
            { id: 'tf_cuenta', label: 'Número de Cuenta (20 dígitos)', value: cuenta, copyValue: cuenta, monoLarge: true, colSpanFull: true },
            { id: 'tf_titular', label: 'Titular de la Cuenta', value: titular, copyValue: titular },
            { id: 'tf_rif', label: 'RIF / Cédula', value: rif, copyValue: rif },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Banco Emisor / Origen *"
          bancoPlaceholder="Ej: Mercantil, Banesco, Venezuela, Provincial..."
          refLabel="Número de Referencia o Comprobante *"
          refPlaceholder="Ej: 00482910 o últimos dígitos"
          uploadLabel="Comprobante de Transferencia (Capture) *"
          paymentData={paymentData}
          onChange={onChange}
          onFileChange={onFileChange}
        />
      </div>
    );
  }

  if (paymentData.metodoPago === 'zelle') {
    const zelleEmail = storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com';
    const zelleTitular = storeConfig?.zelle_titular || 'Gran Catador LLC';

    return (
      <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-3.5 sm:p-4 space-y-4">
        <CopyableFieldsBox
          title="Datos Oficiales Zelle"
          gridClass="grid-cols-1"
          amountLabel={`Monto exacto a transferir: ${formatUsd(totalUsd)}`}
          copiedField={copiedField}
          onCopy={onCopy}
          fields={[
            { id: 'zelle', label: `Correo Zelle · Titular: ${zelleTitular}`, value: zelleEmail, copyValue: zelleEmail },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Nombre del Titular Emisor *"
          bancoPlaceholder="Nombre completo en cuenta Zelle"
          refLabel="Referencia o Confirmación Zelle *"
          refPlaceholder="Ej: ZL-894120"
          uploadLabel="Comprobante Zelle (Capture) *"
          paymentData={paymentData}
          onChange={onChange}
          onFileChange={onFileChange}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-3.5 sm:p-4 space-y-4">
      <div>
        <label className="block text-xs font-extrabold text-slate-700 mb-2">
          ¿Con qué billete en divisas ($ USD) pagarás al recibir?
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
          {[20, 50, 100].map((bill) => (
            <button
              key={bill}
              type="button"
              onClick={() => onBillSelect(bill)}
              className={cn(
                'p-2.5 min-h-[44px] rounded-full border text-center font-black text-xs transition-all cursor-pointer tabular-nums',
                paymentData.billetePagoUsd === bill
                  ? 'border-catador-blue bg-catador-blue text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              ${bill}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onBillSelect(Math.ceil(totalUsd))}
            className={cn(
              'p-2.5 min-h-[44px] rounded-full border text-center font-bold text-xs transition-all cursor-pointer',
              paymentData.billetePagoUsd === Math.ceil(totalUsd)
                ? 'border-catador-blue bg-catador-blue text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            Monto Exacto
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs tabular-nums">
        <div>
          <span className="text-slate-600 block text-[11px]">Total a pagar:</span>
          <span className="font-extrabold text-slate-900">{formatUsd(totalUsd)}</span>
        </div>
        <div className="xs:text-right">
          <span className="text-slate-600 block text-[11px]">Vuelto que llevará el repartidor:</span>
          <span className="font-black text-emerald-600 text-sm font-mono">
            {formatUsd(paymentData.vueltoCalculadoUsd)} ({formatVes(paymentData.vueltoCalculadoUsd * bcvRate)})
          </span>
        </div>
      </div>
    </div>
  );
}
