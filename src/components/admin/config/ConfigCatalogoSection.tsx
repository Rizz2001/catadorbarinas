'use client';

import React from 'react';
import { Tag, PackageX, LayoutTemplate } from 'lucide-react';
import { StoreConfig } from '@/types';

interface ConfigCatalogoSectionProps {
  form: StoreConfig;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigCatalogoSection({ form, onChange }: ConfigCatalogoSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
      {/* Regla Global de Venta Sin Stock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
        <div className="flex items-start gap-2.5">
          <PackageX className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase">
              Configuración Global: Vender Artículos Sin Stock (Activar / Desactivar)
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Si está activo, los clientes podrán comprar productos con existencia 0 (bajo pedido). También puedes activarlo o desactivarlo por producto individual en el Gestor de Artículos.
            </p>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={Boolean(form.permitir_venta_sin_stock_global)}
            onChange={(e) => onChange({ permitir_venta_sin_stock_global: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-catador-blue focus:ring-catador-blue"
          />
          <span className="text-xs font-extrabold text-slate-900">
            {form.permitir_venta_sin_stock_global ? 'Activado' : 'Desactivado'}
          </span>
        </label>
      </div>

      {/* Personalización de Todas las Secciones del Inicio */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-catador-blue/10 text-catador-blue">
          <LayoutTemplate className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Personalización de Secciones de la Página de Inicio
          </h2>
          <p className="text-[11px] text-slate-500">
            Activa, oculta o cambia los títulos de cada bloque en la portada de la tienda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Tendencias */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 text-xs">1. Sección Tendencias de la Semana</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.seccion_tendencias_activa !== false}
                onChange={(e) => onChange({ seccion_tendencias_activa: e.target.checked })}
              />
              <span className="text-[11px] font-bold">Visible</span>
            </label>
          </div>
          <input
            type="text"
            value={form.seccion_tendencias_titulo || ''}
            onChange={(e) => onChange({ seccion_tendencias_titulo: e.target.value })}
            placeholder="Tendencias de la Semana"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
          <input
            type="text"
            value={form.seccion_tendencias_subtitulo || ''}
            onChange={(e) => onChange({ seccion_tendencias_subtitulo: e.target.value })}
            placeholder="Subtítulo de Tendencias"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
        </div>

        {/* 2. Ofertas */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 text-xs">2. Sección Ofertas Destacadas</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.seccion_ofertas_activa !== false}
                onChange={(e) => onChange({ seccion_ofertas_activa: e.target.checked })}
              />
              <span className="text-[11px] font-bold">Visible</span>
            </label>
          </div>
          <input
            type="text"
            value={form.seccion_ofertas_titulo || ''}
            onChange={(e) => onChange({ seccion_ofertas_titulo: e.target.value })}
            placeholder="Ofertas Relámpago del Día"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
        </div>

        {/* 3. Marcas Aliadas */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 text-xs">3. Sección Empresas Aliadas</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.seccion_aliados_activa !== false}
                onChange={(e) => onChange({ seccion_aliados_activa: e.target.checked })}
              />
              <span className="text-[11px] font-bold">Visible</span>
            </label>
          </div>
          <input
            type="text"
            value={form.seccion_aliados_titulo || ''}
            onChange={(e) => onChange({ seccion_aliados_titulo: e.target.value })}
            placeholder="Empresas y Marcas Aliadas Oficiales"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
        </div>

        {/* 4. Catálogo en Vivo */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-catador-blue" />
            <span className="font-black text-slate-900 text-xs">4. Encabezado del Catálogo en Vivo</span>
          </div>
          <input
            type="text"
            value={form.catalogo_titulo || ''}
            onChange={(e) => onChange({ catalogo_titulo: e.target.value })}
            placeholder="Catálogo Bodegón & Supermercado (Depósito 01)"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
          <input
            type="text"
            value={form.catalogo_subtitulo || ''}
            onChange={(e) => onChange({ catalogo_subtitulo: e.target.value })}
            placeholder="Inventario en tiempo real sincronizado con precios oficiales"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          />
        </div>
      </div>
    </section>
  );
}
