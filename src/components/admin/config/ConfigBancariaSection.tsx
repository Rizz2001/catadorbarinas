'use client';

import React from 'react';
import { Smartphone, CreditCard, Building2 } from 'lucide-react';
import { Switch } from '@astryxdesign/core/Switch';
import { StoreConfig } from '@/types';

interface ConfigBancariaSectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigBancariaSection({ form, onChange }: ConfigBancariaSectionProps) {
  return (
    <div className="space-y-4">
      {/* Datos Pago Móvil */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Smartphone className="h-4 w-4 text-catador-blue" />
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Recepción de Pago Móvil (Bs. VES)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Banco Oficial</label>
            <input
              type="text"
              value={form.pago_movil_banco || ''}
              onChange={(e) => onChange({ pago_movil_banco: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: Banesco (0134)"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">RIF / Cédula Afiliada</label>
            <input
              type="text"
              value={form.pago_movil_cedula || ''}
              onChange={(e) => onChange({ pago_movil_cedula: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: J-50123456-7"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Teléfono Afiliado</label>
            <input
              type="text"
              value={form.pago_movil_telefono || ''}
              onChange={(e) => onChange({ pago_movil_telefono: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: 0414-5738890"
            />
          </div>
        </div>
      </section>

      {/* Datos Zelle */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <CreditCard className="h-4 w-4 text-catador-amber" />
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Recepción Zelle ($ USD)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Zelle</label>
            <input
              type="email"
              value={form.zelle_email || ''}
              onChange={(e) => onChange({ zelle_email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: pagos@grancatadorbarinas.com"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre del Titular</label>
            <input
              type="text"
              value={form.zelle_titular || ''}
              onChange={(e) => onChange({ zelle_titular: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: Gran Catador LLC"
            />
          </div>
        </div>
      </section>

      {/* Datos Transferencia Bancaria */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-catador-blue" />
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Recepción de Transferencias Bancarias (Bs. VES)
            </h2>
          </div>
          <Switch
            label="Habilitada"
            size="sm"
            labelPosition="start"
            value={form.transferencia_activa ?? true}
            onChange={(checked) => onChange({ transferencia_activa: checked })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Banco Oficial</label>
            <input
              type="text"
              value={form.transferencia_banco || ''}
              onChange={(e) => onChange({ transferencia_banco: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: Banco Mercantil (0105)"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block font-bold text-slate-700 mb-1">Número de Cuenta (20 dígitos)</label>
            <input
              type="text"
              maxLength={20}
              value={form.transferencia_cuenta || ''}
              onChange={(e) => onChange({ transferencia_cuenta: e.target.value.replace(/\D/g, '') })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="01050616611616161043"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Titular de la Cuenta</label>
            <input
              type="text"
              value={form.transferencia_titular || ''}
              onChange={(e) => onChange({ transferencia_titular: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: Maria Milagros Garcia"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">RIF / Cédula del Titular</label>
            <input
              type="text"
              value={form.transferencia_cedula || ''}
              onChange={(e) => onChange({ transferencia_cedula: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: V-22582611"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo de Cuenta</label>
            <input
              type="text"
              value={form.transferencia_tipo_cuenta || ''}
              onChange={(e) => onChange({ transferencia_tipo_cuenta: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              placeholder="Ej: Cuenta Corriente"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
