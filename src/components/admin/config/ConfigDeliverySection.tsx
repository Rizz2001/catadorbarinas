'use client';

import React from 'react';
import { Truck, DollarSign, Gift } from 'lucide-react';
import { StoreConfig } from '@/types';

interface ConfigDeliverySectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigDeliverySection({ form, onChange }: ConfigDeliverySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Truck className="h-4 w-4 text-emerald-600" />
        <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Políticas de Despacho &amp; Delivery en Barinas
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            Tarifa Plana de Envío ($ USD) *
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            required
            value={form.delivery_base_usd ?? 2.0}
            onChange={(e) => onChange({ delivery_base_usd: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
          <p className="text-[11px] text-slate-400 mt-1">Costo estándar de entrega aplicado en el checkout.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Gift className="h-3.5 w-3.5 text-slate-400" />
            Monto Mínimo para Envío Gratis ($ USD) *
          </label>
          <input
            type="number"
            step="1"
            min="0"
            required
            value={form.delivery_gratis_minimo_usd ?? 30.0}
            onChange={(e) => onChange({ delivery_gratis_minimo_usd: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
          <p className="text-[11px] text-slate-400 mt-1">A partir de este subtotal, el delivery es totalmente gratuito.</p>
        </div>
      </div>
    </section>
  );
}
