'use client';

import type { ChangeEvent } from 'react';
import { Copy, Check, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentDataState } from './CheckoutPaymentForm';
import { CHECKOUT_INPUT_CLASS, CHECKOUT_LABEL_CLASS } from './checkoutStyles';

export interface BankFieldRow {
  id: string;
  label: string;
  value: string;
  copyValue?: string;
  monoLarge?: boolean;
  colSpanFull?: boolean;
}

export function CopyableFieldsBox({
  title,
  fields,
  gridClass,
  amountLabel,
  copiedField,
  onCopy,
}: {
  title: string;
  fields: BankFieldRow[];
  gridClass: string;
  amountLabel: string;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
}) {
  return (
    <div className="space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          {title}
        </span>
        <span className="font-bold text-catador-blue tabular-nums">{amountLabel}</span>
      </div>
      <div className={cn('grid gap-2 text-slate-700', gridClass)}>
        {fields.map((field) => (
          <div
            key={field.id}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-100 gap-2',
              field.colSpanFull && 'sm:col-span-2'
            )}
          >
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500">{field.label}</div>
              <div
                className={cn(
                  'font-semibold text-slate-900',
                  field.monoLarge
                    ? 'font-mono font-bold text-sm text-catador-blue tracking-wider select-all break-all'
                    : 'truncate'
                )}
              >
                {field.value}
              </div>
            </div>
            {field.copyValue && (
              <button
                type="button"
                onClick={() => onCopy(field.copyValue!, field.id)}
                className="p-1.5 text-slate-400 hover:text-catador-blue cursor-pointer shrink-0 rounded-lg hover:bg-slate-50 transition-colors"
                aria-label={`Copiar ${field.label}`}
              >
                {copiedField === field.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5}/>
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5}/>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferenceAndReceiptFields({
  bancoLabel,
  bancoPlaceholder,
  refLabel,
  refPlaceholder,
  refMaxLength,
  uploadLabel,
  paymentData,
  onChange,
  onFileChange,
}: {
  bancoLabel: string;
  bancoPlaceholder: string;
  refLabel: string;
  refPlaceholder: string;
  refMaxLength?: number;
  uploadLabel: string;
  paymentData: PaymentDataState;
  onChange: (patch: Partial<PaymentDataState>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={CHECKOUT_LABEL_CLASS}>{bancoLabel}</label>
          <input
            type="text"
            required
            placeholder={bancoPlaceholder}
            value={paymentData.bancoOrigen}
            onChange={(e) => onChange({ bancoOrigen: e.target.value })}
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={CHECKOUT_LABEL_CLASS}>{refLabel}</label>
          <input
            type="text"
            required
            maxLength={refMaxLength}
            placeholder={refPlaceholder}
            value={paymentData.referencia}
            onChange={(e) => onChange({ referencia: e.target.value })}
            className={cn(CHECKOUT_INPUT_CLASS, 'font-mono')}
          />
        </div>
      </div>

      <div>
        <label className={CHECKOUT_LABEL_CLASS}>{uploadLabel}</label>
        <div className="relative border border-dashed border-gray-300 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className="h-5 w-5 text-catador-blue mx-auto mb-1" strokeWidth={1.5}/>
          <p className="text-xs font-semibold text-slate-700 truncate">
            {paymentData.comprobanteFile
              ? paymentData.comprobanteFile.name
              : 'Subir captura del comprobante'}
          </p>
          <p className="text-[11px] text-slate-400">PNG o JPG (Máx. 5MB)</p>
        </div>
      </div>
    </>
  );
}

