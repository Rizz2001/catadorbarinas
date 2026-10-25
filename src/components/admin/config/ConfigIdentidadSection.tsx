'use client';

import React from 'react';
import { Store, Building, FileText, Phone, MapPin, Clock } from 'lucide-react';
import { StoreConfig } from '@/types';
import { ConfigLogoUploader } from './ConfigLogoUploader';

interface ConfigIdentidadSectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
  onQuickSave?: () => Promise<void>;
}

export function ConfigIdentidadSection({ form, onChange, onQuickSave }: ConfigIdentidadSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Store className="h-4 w-4 text-catador-blue" />
        <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Identidad y Datos del Negocio
        </h2>
      </div>

      {/* Selector y Cargador de Logotipo Oficial */}
      <ConfigLogoUploader
        logoUrl={form.logo_url}
        logoAltoPx={form.logo_alto_px}
        logoAnchoPx={form.logo_ancho_px}
        onLogoChange={(url) => onChange({ logo_url: url })}
        onDimensionsChange={(dims) => onChange(dims)}
        onQuickSave={onQuickSave}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Store className="h-3.5 w-3.5 text-slate-400" />
            Nombre Comercial *
          </label>
          <input
            type="text"
            required
            value={form.nombre_tienda || ''}
            onChange={(e) => onChange({ nombre_tienda: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            Razón Social Legal *
          </label>
          <input
            type="text"
            required
            value={form.razon_social || ''}
            onChange={(e) => onChange({ razon_social: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            RIF del Negocio *
          </label>
          <input
            type="text"
            required
            value={form.rif || ''}
            onChange={(e) => onChange({ rif: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            Teléfono de Atención / WhatsApp *
          </label>
          <input
            type="text"
            required
            value={form.telefono_atencion || ''}
            onChange={(e) => onChange({ telefono_atencion: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Horario de Despacho y Tienda *
          </label>
          <input
            type="text"
            required
            value={form.horario_despacho || ''}
            onChange={(e) => onChange({ horario_despacho: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div className="md:col-span-3">
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Dirección Física en Barinas *
          </label>
          <input
            type="text"
            required
            value={form.direccion_fisica || ''}
            onChange={(e) => onChange({ direccion_fisica: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>
    </section>
  );
}
