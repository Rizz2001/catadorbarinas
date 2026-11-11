'use client';

import { ChangeEvent, useState } from 'react';
import { Smartphone, CreditCard, Banknote, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { CheckoutPaymentDetails } from './CheckoutPaymentPanels';

export interface PaymentDataState {
  metodoPago: 'pago_movil' | 'transferencia_bancaria' | 'zelle' | 'efectivo_usd';
  bancoOrigen: string;
  telefonoOrigen: string;
  referencia: string;
  comprobanteUrl?: string;
  comprobanteFile?: File | null;
  billetePagoUsd: number;
  vueltoCalculadoUsd: number;
}

interface CheckoutPaymentFormProps {
  totalUsd: number;
  totalVes: number;
  bcvRate: number;
  paymentData: PaymentDataState;
  onChange: (data: Partial<PaymentDataState>) => void;
}

const PAYMENT_OPTIONS = [
  { id: 'pago_movil' as const, label: 'Pago Móvil', sub: 'Bolívares (Bs)', icon: Smartphone },
  { id: 'transferencia_bancaria' as const, label: 'Transferencia', sub: 'Bolívares (Bs)', icon: Building2 },
  { id: 'zelle' as const, label: 'Zelle', sub: 'Dólares ($ USD)', icon: CreditCard },
  { id: 'efectivo_usd' as const, label: 'Efectivo $', sub: 'Contra Entrega', icon: Banknote },
];

export function CheckoutPaymentForm({
  totalUsd,
  totalVes,
  bcvRate,
  paymentData,
  onChange,
}: CheckoutPaymentFormProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const isTransferActive = storeConfig?.transferencia_activa !== false;
  const visiblePaymentOptions = PAYMENT_OPTIONS.filter(
    (opt) => opt.id !== 'transferencia_bancaria' || isTransferActive
  );

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBillSelect = (bill: number) => {
    const vuelto = Math.max(0, bill - totalUsd);
    onChange({ billetePagoUsd: bill, vueltoCalculadoUsd: Number(vuelto.toFixed(2)) });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({ comprobanteFile: file, comprobanteUrl: previewUrl });
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'grid grid-cols-2 gap-2',
          visiblePaymentOptions.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
        )}
      >
        {visiblePaymentOptions.map(({ id, label, sub, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ metodoPago: id })}
            className={cn(
              'flex flex-col items-center justify-center p-2.5 min-h-[54px] rounded-xl border text-center transition-colors cursor-pointer',
              paymentData.metodoPago === id
                ? 'border-catador-blue bg-catador-blue/5 text-catador-blue'
                : 'border-gray-200 bg-white text-slate-500 hover:bg-slate-50'
            )}
          >
            <Icon className="h-4 w-4 mb-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">{label}</span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{sub}</span>
            </div>
          </button>
        ))}
      </div>

      <CheckoutPaymentDetails
        paymentData={paymentData}
        storeConfig={storeConfig}
        totalUsd={totalUsd}
        totalVes={totalVes}
        bcvRate={bcvRate}
        copiedField={copiedField}
        onCopy={copyToClipboard}
        onChange={onChange}
        onFileChange={handleFileChange}
        onBillSelect={handleBillSelect}
      />
    </div>
  );
}
