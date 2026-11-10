'use client';

import React, { useState } from 'react';
import { Smartphone, CreditCard, Banknote, Building2, Copy, Check, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUsd, formatVes } from '@/lib/currency';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {[
          { id: 'pago_movil' as const, label: 'Pago Móvil', sub: 'Bolívares (Bs)', icon: Smartphone },
          { id: 'transferencia_bancaria' as const, label: 'Transferencia', sub: 'Bolívares (Bs)', icon: Building2 },
          { id: 'zelle' as const, label: 'Zelle', sub: 'Dólares ($ USD)', icon: CreditCard },
          { id: 'efectivo_usd' as const, label: 'Efectivo $', sub: 'Contra Entrega', icon: Banknote },
        ].map(({ id, label, sub, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ metodoPago: id })}
            className={cn(
              'flex flex-col items-center justify-center p-3 min-h-[58px] rounded-xl border text-center transition-all cursor-pointer',
              paymentData.metodoPago === id
                ? 'border-catador-amber bg-amber-50/60 text-catador-amber ring-2 ring-catador-amber/20 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon className="h-5 w-5 mb-1 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">{label}</span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* PESTAÑA: PAGO MÓVIL */}
      {paymentData.metodoPago === 'pago_movil' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 space-y-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-catador-blue uppercase tracking-wider text-[10px]">
              Datos Oficiales para Pago Móvil
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Banco</div>
                  <div className="font-bold text-slate-900 truncate">{storeConfig?.pago_movil_banco || 'Banesco (0134)'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_banco || '0134', 'banco')} className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0">
                  {copiedField === 'banco' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">RIF / Cédula</div>
                  <div className="font-bold text-slate-900 truncate">{storeConfig?.pago_movil_cedula || 'J-50123456-7'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_cedula || 'J-50123456-7', 'rif')} className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0">
                  {copiedField === 'rif' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Teléfono</div>
                  <div className="font-bold text-slate-900 truncate">{storeConfig?.pago_movil_telefono || '0414-5738890'}</div>
                </div>
                <button type="button" onClick={() => copyToClipboard(storeConfig?.pago_movil_telefono || '04145738890', 'tel')} className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0">
                  {copiedField === 'tel' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="text-right text-[11px] font-extrabold text-catador-blue font-mono">
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
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
          </div>

          {/* Subida de Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comprobante de Pago Móvil (Capture) *</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 truncate">
                {paymentData.comprobanteFile ? paymentData.comprobanteFile.name : 'Haz clic o arrastra tu comprobante aquí'}
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG o JPEG (Máximo 5MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: TRANSFERENCIA BANCARIA */}
      {paymentData.metodoPago === 'transferencia_bancaria' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 space-y-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-3 text-xs">
            <span className="font-bold text-catador-blue uppercase tracking-wider text-[10px] block">
              Datos Oficiales para Transferencia Bancaria
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Banco Receptor</div>
                  <div className="font-bold text-slate-900 truncate">
                    {storeConfig?.transferencia_banco || 'Banco Mercantil (0105)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      storeConfig?.transferencia_banco || 'Banco Mercantil',
                      'tf_banco'
                    )
                  }
                  className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0"
                  aria-label="Copiar Banco"
                >
                  {copiedField === 'tf_banco' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Tipo de Cuenta</div>
                  <div className="font-bold text-slate-900 truncate">
                    {storeConfig?.transferencia_tipo_cuenta || 'Cuenta Corriente'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border sm:col-span-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Número de Cuenta (20 dígitos)</div>
                  <div className="font-mono font-black text-sm text-catador-blue tracking-wider select-all break-all">
                    {storeConfig?.transferencia_cuenta || '01050616611616161043'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      storeConfig?.transferencia_cuenta || '01050616611616161043',
                      'tf_cuenta'
                    )
                  }
                  className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0 ml-2"
                  aria-label="Copiar Número de Cuenta"
                >
                  {copiedField === 'tf_cuenta' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">Titular de la Cuenta</div>
                  <div className="font-bold text-slate-900 truncate">
                    {storeConfig?.transferencia_titular || 'Maria Milagros Garcia'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      storeConfig?.transferencia_titular || 'Maria Milagros Garcia',
                      'tf_titular'
                    )
                  }
                  className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0"
                  aria-label="Copiar Titular"
                >
                  {copiedField === 'tf_titular' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-600">RIF / Cédula</div>
                  <div className="font-bold text-slate-900 truncate">
                    {storeConfig?.transferencia_cedula || 'V-22582611'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      storeConfig?.transferencia_cedula || 'V-22582611',
                      'tf_rif'
                    )
                  }
                  className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0"
                  aria-label="Copiar Cédula o RIF"
                >
                  {copiedField === 'tf_rif' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right text-[11px] font-extrabold text-catador-blue font-mono pt-1">
              Monto exacto a transferir: {formatVes(totalVes)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Banco Emisor / Origen *</label>
              <input
                type="text"
                required
                placeholder="Ej: Mercantil, Banesco, Venezuela, Provincial..."
                value={paymentData.bancoOrigen}
                onChange={(e) => onChange({ bancoOrigen: e.target.value })}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Número de Referencia o Comprobante *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 00482910 o últimos dígitos"
                value={paymentData.referencia}
                onChange={(e) => onChange({ referencia: e.target.value })}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
          </div>

          {/* Subida de Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Comprobante de Transferencia (Capture) *
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 truncate">
                {paymentData.comprobanteFile
                  ? paymentData.comprobanteFile.name
                  : 'Haz clic o arrastra tu comprobante aquí'}
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG o JPEG (Máximo 5MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: ZELLE */}
      {paymentData.metodoPago === 'zelle' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 space-y-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-catador-blue uppercase tracking-wider text-[10px]">Datos Oficiales Zelle</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-slate-600">Correo Zelle</div>
                <div className="font-bold text-slate-900 truncate">{storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com'}</div>
                <div className="text-[10px] text-slate-600 truncate">Titular: {storeConfig?.zelle_titular || 'Gran Catador LLC'}</div>
              </div>
              <button type="button" onClick={() => copyToClipboard(storeConfig?.zelle_email || 'pagos@grancatadorbarinas.com', 'zelle')} className="p-1.5 text-slate-600 hover:text-catador-blue cursor-pointer shrink-0">
                {copiedField === 'zelle' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="text-right text-[11px] font-extrabold text-catador-blue font-mono">
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
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comprobante Zelle (Capture) *</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 truncate">
                {paymentData.comprobanteFile ? paymentData.comprobanteFile.name : 'Haz clic o arrastra tu comprobante aquí'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: EFECTIVO USD CONTRA ENTREGA */}
      {paymentData.metodoPago === 'efectivo_usd' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ¿Con qué billete en divisas ($ USD) pagarás al recibir?
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
              {[20, 50, 100].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleBillSelect(bill)}
                  className={cn(
                    'p-2.5 min-h-[44px] rounded-xl border text-center font-black text-xs transition-all cursor-pointer',
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
                  'p-2.5 min-h-[44px] rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer',
                  paymentData.billetePagoUsd === Math.ceil(totalUsd)
                    ? 'border-catador-blue bg-catador-blue text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                Monto Exacto
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs">
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
      )}
    </div>
  );
}
