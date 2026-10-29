'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { StoreConfig } from '@/types';

interface ConfigCatalogoSectionProps {
  form: StoreConfig;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigCatalogoSection({ form, onChange }: ConfigCatalogoSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-catador-blue/10 text-catador-blue">
          <Tag className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Textos de la Vitrina del Catálogo (Depósito 01)
          </h2>
          <p className="text-[11px] text-slate-500">
            Personaliza el título y subtítulo que aparecen sobre el listado de productos en la página principal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">
            Título de la Sección del Catálogo *
          </label>
          <input
            type="text"
            required
            value={form.catalogo_titulo || ''}
            onChange={(e) => onChange({ catalogo_titulo: e.target.value })}
            placeholder="Catálogo Bodegón & Supermercado (Depósito 01)"
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">
            Subtítulo / Leyenda Informativa *
          </label>
          <textarea
            rows={2}
            required
            value={form.catalogo_subtitulo || ''}
            onChange={(e) => onChange({ catalogo_subtitulo: e.target.value })}
            placeholder="Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV"
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      {/* Mini Previsualización del Encabezado */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 mt-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
          Vista Previa en Tienda:
        </span>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-catador-blue text-white shrink-0">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {form.catalogo_titulo || 'Catálogo Bodegón & Supermercado (Depósito 01)'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {form.catalogo_subtitulo || 'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
