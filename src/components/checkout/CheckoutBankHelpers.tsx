'use client';

import type { ChangeEvent } from 'react';
import { Copy, Check, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentDataState } from './CheckoutPaymentForm';

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
    <div className="rounded-xl bg-white p-3.5 border border-slate-200/90 space-y-2.5 text-xs">
      <span className="font-extrabold text-catador-blue uppercase tracking-wider text-[11px] block">
        {title}
      </span>
      <div className={cn('grid gap-2 text-slate-700', gridClass)}>
        {fields.map((field) => (
          <div
            key={field.id}
            className={cn(
              'flex items-center justify-between p-2.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 gap-2',
              field.colSpanFull && 'sm:col-span-2'
            )}
          >
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500">{field.label}</div>
              <div
                className={cn(
                  'font-bold text-slate-900',
                  field.monoLarge
                    ? 'font-mono font-black text-sm text-catador-blue tracking-wider select-all break-all'
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
                className="p-1.5 text-slate-500 hover:text-catador-blue cursor-pointer shrink-0 rounded-full hover:bg-white transition-colors"
                aria-label={`Copiar ${field.label}`}
              >
                {copiedField === field.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="text-right text-xs font-extrabold text-catador-blue font-mono tabular-nums pt-0.5">
        {amountLabel}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">{bancoLabel}</label>
          <input
            type="text"
            required
            placeholder={bancoPlaceholder}
            value={paymentData.bancoOrigen}
            onChange={(e) => onChange({ bancoOrigen: e.target.value })}
            className="w-full min-h-[44px] rounded-full border border-slate-200 px-4 py-2 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue"
          />
        </div>
        <div>
          <label className="block font-extrabold text-slate-700 mb-1.5">{refLabel}</label>
          <input
            type="text"
            required
            maxLength={refMaxLength}
            placeholder={refPlaceholder}
            value={paymentData.referencia}
            onChange={(e) => onChange({ referencia: e.target.value })}
            className="w-full min-h-[44px] rounded-full border border-slate-200 px-4 py-2 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">{uploadLabel}</label>
        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-3.5 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className="h-6 w-6 text-catador-blue mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700 truncate">
            {paymentData.comprobanteFile
              ? paymentData.comprobanteFile.name
              : 'Haz clic o arrastra tu comprobante aquí'}
          </p>
          <p className="text-[11px] text-slate-400">PNG, JPG o JPEG (Máximo 5MB)</p>
        </div>
      </div>
    </>
  );
}

