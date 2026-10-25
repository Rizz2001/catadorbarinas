'use client';

import React, { useState } from 'react';
import { Smartphone, CreditCard, Banknote, Copy, Check, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUsd, formatVes } from '@/lib/currency';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

export interface PaymentDataState {
  metodoPago: 'pago_movil' | 'zelle' | 'efectivo_usd';
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

export function CheckoutPaymentForm({
  totalUsd,
  totalVes,
  bcvRate,
  paymentData,
  onChange,
}: CheckoutPaymentFormProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const storeConfig = useStoreConfigStore((state) => state.config);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBillSelect = (bill: number) => {
    const vuelto = Math.max(0, bill - totalUsd);
    onChange({ billetePagoUsd: bill, vueltoCalculadoUsd: Number(vuelto.toFixed(2)) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({ comprobanteFile: file, comprobanteUrl: previewUrl });
    }
  };

  return (
    <div className="space-y-5">
      {/* Selector de Método de Pago */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { id: 'pago_movil' as const, label: 'Pago Móvil', sub: 'Bolívares (Bs)', icon: Smartphone },
          { id: 'zelle' as const, label: 'Zelle', sub: 'Dólares ($ USD)', icon: CreditCard },
          { id: 'efectivo_usd' as const, label: 'Efectivo $', sub: 'Contra Entrega', icon: Banknote },
        ].map(({ id, label, sub, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ metodoPago: id })}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer',
              paymentData.metodoPago === id
                ? 'border-catador-amber bg-amber-50/60 text-catador-amber ring-2 ring-catador-amber/20 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-bold text-slate-900">{label}</span>
            <span className="text-[10px] text-slate-500">{sub}</span>
          </button>
        ))}
      </div>

      {/* PESTAÑA: PAGO MÓVIL */}
      {paymentData.metodoPago === 'pago_movil' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-catador-blue uppercase tracking-wider text-[10px]">
              Datos Oficiales para Pago Móvil
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div>
                  <div className="text-[10px] text-slate-600">Banco</div>
                  <div className="font-bold text-slate-900">{storeConfig?.pago_movil_banco || 'Banesco (0134)'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_banco || '0134', 'banco')} className="text-slate-600 hover:text-catador-blue">
                  {copiedField === 'banco' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div>
                  <div className="text-[10px] text-slate-600">RIF / Cédula</div>
                  <div className="font-bold text-slate-900">{storeConfig?.pago_movil_cedula || 'J-50123456-7'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_cedula || 'J-50123456-7', 'rif')} className="text-slate-600 hover:text-catador-blue">
                  {copiedField === 'rif' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div>
                  <div className="text-[10px] text-slate-600">Teléfono</div>
                  <div className="font-bold text-slate-900">{storeConfig?.pago_movil_telefono || '0414-5738890'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_telefono || '04145738890', 'tel')} className="text-slate-600 hover:text-catador-blue">
                  {copiedField === 'tel' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="text-right text-[11px] font-extrabold text-catador-blue">
              Monto exacto a transferir: {formatVes(totalVes)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Banco Emisor *</label>
              <input
                type="text"
                required
                placeholder="Ej: Banesco, Mercantil, Venezuela"
                value={paymentData.bancoOrigen}
                onChange={(e) => onChange({ bancoOrigen: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Número de Referencia (Últimos 6 dígitos) *</label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="Ej: 549120"
                value={paymentData.referencia}
                onChange={(e) => onChange({ referencia: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
          </div>

          {/* Subida de Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comprobante de Pago Móvil (Capture) *</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                {paymentData.comprobanteFile ? paymentData.comprobanteFile.name : 'Haz clic o arrastra tu comprobante aquí'}
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG o JPEG (Máximo 5MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: ZELLE */}
      {paymentData.metodoPago === 'zelle' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-catador-blue uppercase tracking-wider text-[10px]">Datos Oficiales Zelle</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
              <div>
                <div className="text-[10px] text-slate-600">Correo Zelle</div>
                <div className="font-bold text-slate-900">{storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com'}</div>
                <div className="text-[10px] text-slate-600">Titular: {storeConfig?.zelle_titular || 'Gran Catador LLC'}</div>
              </div>
              <button type="button" onClick={() => copyToClipboard(storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com', 'zelle')} className="text-slate-600 hover:text-catador-blue">
                {copiedField === 'zelle' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="text-right text-[11px] font-extrabold text-catador-blue">
              Monto exacto a transferir: {formatUsd(totalUsd)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre del Titular Emisor *</label>
              <input
                type="text"
                required
                placeholder="Nombre completo en cuenta Zelle"
                value={paymentData.bancoOrigen}
                onChange={(e) => onChange({ bancoOrigen: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Referencia o Confirmación Zelle *</label>
              <input
                type="text"
                required
                placeholder="Ej: ZL-894120"
                value={paymentData.referencia}
                onChange={(e) => onChange({ referencia: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comprobante Zelle (Capture) *</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                {paymentData.comprobanteFile ? paymentData.comprobanteFile.name : 'Haz clic o arrastra tu comprobante aquí'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: EFECTIVO USD CONTRA ENTREGA */}
      {paymentData.metodoPago === 'efectivo_usd' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ¿Con qué billete en divisas ($ USD) pagarás al recibir?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[20, 50, 100].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleBillSelect(bill)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center font-black text-xs transition-all cursor-pointer',
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
                onClick={() => handleBillSelect(Math.ceil(totalUsd))}
                className={cn(
                  'p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer',
                  paymentData.billetePagoUsd === Math.ceil(totalUsd)
                    ? 'border-catador-blue bg-catador-blue text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                Monto Exacto
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block text-[11px]">Total a pagar:</span>
              <span className="font-extrabold text-slate-900">{formatUsd(totalUsd)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-600 block text-[11px]">Vuelto que llevará el repartidor:</span>
              <span className="font-black text-emerald-600 text-sm">
                {formatUsd(paymentData.vueltoCalculadoUsd)} ({formatVes(paymentData.vueltoCalculadoUsd * bcvRate)})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
