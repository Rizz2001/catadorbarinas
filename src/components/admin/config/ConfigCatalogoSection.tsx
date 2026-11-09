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
        {/* 0. Banda de Métricas / Garantías de Confianza */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div>
              <span className="font-black text-slate-900 text-xs block">
                Banda de Garantías y Métricas de Confianza (4 Bloques)
              </span>
              <span className="text-[11px] text-slate-500">
                Modifica el texto, cifras y subtítulos de cada tarjeta de la barra superior
              </span>
            </div>
            <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={form.seccion_confianza_activa !== false}
                onChange={(e) => onChange({ seccion_confianza_activa: e.target.checked })}
              />
              <span className="text-[11px] font-bold">Visible</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {([0, 1, 2, 3] as const).map((idx) => {
              const currentMetric = (form.metricas_confianza && form.metricas_confianza[idx]) || {
                figura: idx === 0 ? '< 45 min' : idx === 1 ? 'Tasa BCV' : idx === 2 ? 'Stock Garantizado' : 'Bs. / $ USD',
                titulo: idx === 0 ? 'Despacho Express' : idx === 1 ? 'Cotización Bimonetaria' : idx === 2 ? 'Inventario Real' : 'Métodos de Pago',
                subtitulo: '',
              };

              const updateMetric = (field: 'figura' | 'titulo' | 'subtitulo', val: string) => {
                const list = [...(form.metricas_confianza || [
                  { figura: '< 45 min', titulo: 'Despacho Express en Barinas', subtitulo: 'Alto Barinas, Centro, Palma Sola y Varyná en motorizado o carga' },
                  { figura: 'Tasa BCV', titulo: 'Cotización Bimonetaria Exacta', subtitulo: 'Precios sincronizados al día en Dólares ($ USD) y Bolívares' },
                  { figura: 'Stock Garantizado', titulo: 'Inventario Real por Unidad o Caja', subtitulo: 'Licores con precinto oficial y víveres directo de nuestro almacén' },
                  { figura: 'Bs. / $ USD', titulo: 'Pago Móvil, Zelle y Efectivo', subtitulo: 'Verificación inmediata y atención directa en nuestro Chat en Vivo' },
                ])];
                while (list.length < 4) {
                  list.push({ figura: '', titulo: '', subtitulo: '' });
                }
                list[idx] = { ...list[idx], [field]: val };
                onChange({ metricas_confianza: list });
              };

              return (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-catador-blue">
                      Bloque #{idx + 1}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Cifra o Destacado:
                    </label>
                    <input
                      type="text"
                      value={currentMetric.figura}
                      onChange={(e) => updateMetric('figura', e.target.value)}
                      placeholder="Ej: < 45 min"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Título:
                    </label>
                    <input
                      type="text"
                      value={currentMetric.titulo}
                      onChange={(e) => updateMetric('titulo', e.target.value)}
                      placeholder="Título de la garantía"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Descripción:
                    </label>
                    <textarea
                      rows={2}
                      value={currentMetric.subtitulo}
                      onChange={(e) => updateMetric('subtitulo', e.target.value)}
                      placeholder="Breve descripción"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-[11px] text-slate-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
          <p className="text-[11px] text-slate-500">
            Nota: Se muestra automáticamente en la portada cuando hay 6 o más marcas activas en Empresas Aliadas.
          </p>
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
            placeholder="Catálogo General Bodegón"
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

        {/* 5. Personalización del Footer / Pie de Página */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2 space-y-3">
          <div className="border-b border-slate-200/80 pb-2">
            <span className="font-black text-slate-900 text-xs block">
              5. Personalización del Pie de Página (Footer)
            </span>
            <span className="text-[11px] text-slate-500">
              Modifica la descripción comercial de la empresa, texto de transparencia bimonetaria y dirección del pie de página
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                Descripción Comercial de la Empresa (Bajo el Logo en el Footer):
              </label>
              <textarea
                rows={3}
                value={form.footer_descripcion || ''}
                onChange={(e) => onChange({ footer_descripcion: e.target.value })}
                placeholder="Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada con despacho express."
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                Texto de Transparencia Bimonetaria y Legal:
              </label>
              <textarea
                rows={3}
                value={form.footer_transparencia_texto || ''}
                onChange={(e) => onChange({ footer_transparencia_texto: e.target.value })}
                placeholder="Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV)."
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">
              Dirección Resumida (Fila inferior de Copyright):
            </label>
            <input
              type="text"
              value={form.footer_subdireccion || ''}
              onChange={(e) => onChange({ footer_subdireccion: e.target.value })}
              placeholder="Av. 23 de Enero • Barinas, Estado Barinas, Venezuela"
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
            />
          </div>

          {/* Bloques de Garantías Superiores del Footer */}
          <div className="pt-2 border-t border-slate-200/80">
            <span className="font-bold text-slate-800 text-[11px] block mb-2">
              Banda Superior de Garantías del Footer (4 Columnas):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {([0, 1, 2, 3] as const).map((idx) => {
                const current = (form.footer_garantias && form.footer_garantias[idx]) || {
                  figura: idx === 0 ? 'Despacho en Barinas' : idx === 1 ? '100% Original' : idx === 2 ? 'Bs. BCV / $ USD' : 'Sala en Vivo',
                  titulo: idx === 0 ? 'Delivery en Barinas' : idx === 1 ? 'Precinto Oficial' : idx === 2 ? 'Pagos Bimonetarios' : 'Atención Directa',
                  subtitulo: '',
                };

                const updateFooterGarantia = (field: 'figura' | 'titulo' | 'subtitulo', val: string) => {
                  const list = [...(form.footer_garantias || [
                    { figura: 'Despacho en Barinas', titulo: 'Delivery en Barinas', subtitulo: 'Cotización automática por GPS y volumen' },
                    { figura: '100% Original', titulo: 'Precinto Oficial', subtitulo: 'Licores importados y despensa garantizada' },
                    { figura: 'Bs. BCV / $ USD', titulo: 'Pagos Bimonetarios', subtitulo: 'Pago Móvil, Zelle y Efectivo Divisas' },
                    { figura: 'Sala en Vivo', titulo: 'Atención Directa', subtitulo: 'Chat en tiempo real en cada pedido' },
                  ])];
                  while (list.length < 4) list.push({ figura: '', titulo: '', subtitulo: '' });
                  list[idx] = { ...list[idx], [field]: val };
                  onChange({ footer_garantias: list });
                };

                return (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black text-catador-amber uppercase block">
                      Columna #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={current.figura}
                      onChange={(e) => updateFooterGarantia('figura', e.target.value)}
                      placeholder="Cifra / Destacado"
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1 text-[11px] font-bold"
                    />
                    <input
                      type="text"
                      value={current.titulo}
                      onChange={(e) => updateFooterGarantia('titulo', e.target.value)}
                      placeholder="Título"
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1 text-[11px] font-bold"
                    />
                    <input
                      type="text"
                      value={current.subtitulo}
                      onChange={(e) => updateFooterGarantia('subtitulo', e.target.value)}
                      placeholder="Subtítulo"
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1 text-[10px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
