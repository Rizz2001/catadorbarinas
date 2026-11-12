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
      <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3.5">
        <CopyableFieldsBox
          title="Pago Móvil"
          gridClass="grid-cols-1 sm:grid-cols-3"
          amountLabel={formatVes(totalVes)}
          copiedField={copiedField}
          onCopyAction={onCopy}
          fields={[
            { id: 'banco', label: 'Banco', value: banco, copyValue: storeConfig?.pago_movil_banco || '0134' },
            { id: 'rif', label: 'RIF / Cédula', value: rif, copyValue: rif },
            { id: 'tel', label: 'Teléfono', value: tel, copyValue: storeConfig?.pago_movil_telefono || '04145738890' },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Banco Emisor *"
          bancoPlaceholder="Ej: Banesco, Mercantil, Venezuela"
          refLabel="Referencia (Últimos 6 dígitos) *"
          refPlaceholder="Ej: 549120"
          refMaxLength={8}
          uploadLabel="Comprobante (Capture) *"
          paymentData={paymentData}
          onChangeAction={onChange}
          onFileChangeAction={onFileChange}
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
      <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3.5">
        <CopyableFieldsBox
          title="Transferencia Bancaria"
          gridClass="grid-cols-1 sm:grid-cols-2"
          amountLabel={formatVes(totalVes)}
          copiedField={copiedField}
          onCopyAction={onCopy}
          fields={[
            { id: 'tf_banco', label: 'Banco Receptor', value: banco, copyValue: storeConfig?.transferencia_banco || 'Banco Mercantil' },
            { id: 'tf_tipo', label: 'Tipo de Cuenta', value: storeConfig?.transferencia_tipo_cuenta || 'Cuenta Corriente' },
            { id: 'tf_cuenta', label: 'Número de Cuenta', value: cuenta, copyValue: cuenta, monoLarge: true, colSpanFull: true },
            { id: 'tf_titular', label: 'Titular', value: titular, copyValue: titular },
            { id: 'tf_rif', label: 'RIF / Cédula', value: rif, copyValue: rif },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Banco Emisor *"
          bancoPlaceholder="Ej: Mercantil, Banesco, Venezuela..."
          refLabel="Referencia o Comprobante *"
          refPlaceholder="Ej: 00482910"
          uploadLabel="Comprobante (Capture) *"
          paymentData={paymentData}
          onChangeAction={onChange}
          onFileChangeAction={onFileChange}
        />
      </div>
    );
  }

  if (paymentData.metodoPago === 'zelle') {
    const zelleEmail = storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com';
    const zelleTitular = storeConfig?.zelle_titular || 'Gran Catador LLC';

    return (
      <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3.5">
        <CopyableFieldsBox
          title="Datos Zelle"
          gridClass="grid-cols-1"
          amountLabel={formatUsd(totalUsd)}
          copiedField={copiedField}
          onCopyAction={onCopy}
          fields={[
            { id: 'zelle', label: `Correo · Titular: ${zelleTitular}`, value: zelleEmail, copyValue: zelleEmail },
          ]}
        />
        <ReferenceAndReceiptFields
          bancoLabel="Nombre del Titular Emisor *"
          bancoPlaceholder="Nombre completo en cuenta Zelle"
          refLabel="Confirmación Zelle *"
          refPlaceholder="Ej: ZL-894120"
          uploadLabel="Comprobante Zelle (Capture) *"
          paymentData={paymentData}
          onChangeAction={onChange}
          onFileChangeAction={onFileChange}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          ¿Con qué billete ($ USD) pagarás al recibir?
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
          {[20, 50, 100].map((bill) => (
            <button
              key={bill}
              type="button"
              onClick={() => onBillSelect(bill)}
              className={cn(
                'p-2 min-h-[40px] rounded-lg border text-center font-bold text-xs transition-colors cursor-pointer tabular-nums',
                paymentData.billetePagoUsd === bill
                  ? 'border-catador-blue bg-catador-blue text-white'
                  : 'border-gray-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              ${bill}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onBillSelect(Math.ceil(totalUsd))}
            className={cn(
              'p-2 min-h-[40px] rounded-lg border text-center font-bold text-xs transition-colors cursor-pointer',
              paymentData.billetePagoUsd === Math.ceil(totalUsd)
                ? 'border-catador-blue bg-catador-blue text-white'
                : 'border-gray-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            Exacto
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white border border-gray-100 p-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs tabular-nums">
        <div>
          <span className="text-slate-500 block text-[11px]">Total a pagar</span>
          <span className="font-bold text-slate-900">{formatUsd(totalUsd)}</span>
        </div>
        <div className="xs:text-right">
          <span className="text-slate-500 block text-[11px]">Vuelto que llevará el repartidor</span>
          <span className="font-bold text-emerald-600 text-sm">
            {formatUsd(paymentData.vueltoCalculadoUsd)} ({formatVes(paymentData.vueltoCalculadoUsd * bcvRate)})
          </span>
        </div>
      </div>
    </div>
  );
}
