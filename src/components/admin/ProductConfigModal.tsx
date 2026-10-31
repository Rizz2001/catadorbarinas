'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, Package, EyeOff, Flame, TrendingUp, FileText } from 'lucide-react';
import { Product, ProductCmsConfig, SaleMode, TrendCategoryTab } from '@/types';
import { upsertProductCmsConfig } from '@/services/cms.service';

interface ProductConfigModalProps {
  product: Product;
  existingConfig?: ProductCmsConfig;
  onClose: () => void;
  onSaved: (saved: ProductCmsConfig) => void;
}

export function ProductConfigModal({
  product,
  existingConfig,
  onClose,
  onSaved,
}: ProductConfigModalProps) {
  const [modalidadVenta, setModalidadVenta] = useState<SaleMode>(
    existingConfig?.modalidad_venta || product.saleMode || 'ambos'
  );
  const [unidadesPorCaja, setUnidadesPorCaja] = useState<string>(
    String(existingConfig?.unidades_por_caja_custom || product.unitsPerBox || 12)
  );
  const [precioCajaUsd, setPrecioCajaUsd] = useState<string>(
    existingConfig?.precio_caja_usd_custom
      ? String(existingConfig.precio_caja_usd_custom)
      : String(product.boxPriceUsd || Number((product.priceUsd * (product.unitsPerBox || 12)).toFixed(2)))
  );
  const [permitirSinStock, setPermitirSinStock] = useState<string>(
    existingConfig?.permitir_venta_sin_stock === true
      ? 'true'
      : existingConfig?.permitir_venta_sin_stock === false
      ? 'false'
      : 'global'
  );
  const [ocultoEnWeb, setOcultoEnWeb] = useState<boolean>(
    Boolean(existingConfig?.oculto_en_web ?? product.hiddenFromStore)
  );
  const [descripcionCustom, setDescripcionCustom] = useState<string>(
    existingConfig?.descripcion_custom || product.description || ''
  );
  const [esTendencia, setEsTendencia] = useState<boolean>(
    Boolean(existingConfig?.es_tendencia ?? product.isWeeklyTrend)
  );
  const [categoriaTendencia, setCategoriaTendencia] = useState<TrendCategoryTab>(
    existingConfig?.categoria_tendencia || product.trendTab || 'mas_vendidos'
  );
  const [esOferta, setEsOferta] = useState<boolean>(
    Boolean(existingConfig?.es_oferta_destacada ?? product.isDealOfTheDay)
  );
  const [precioOfertaUsd, setPrecioOfertaUsd] = useState<string>(
    existingConfig?.precio_oferta_usd ? String(existingConfig.precio_oferta_usd) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await upsertProductCmsConfig({
        cod_articulo: product.id,
        nombre_referencia: product.name,
        modalidad_venta: modalidadVenta,
        unidades_por_caja_custom: parseInt(unidadesPorCaja, 10) || 12,
        precio_caja_usd_custom: parseFloat(precioCajaUsd) || null,
        permitir_venta_sin_stock:
          permitirSinStock === 'true' ? true : permitirSinStock === 'false' ? false : null,
        oculto_en_web: ocultoEnWeb,
        descripcion_custom: descripcionCustom.trim() || null,
        es_tendencia: esTendencia,
        categoria_tendencia: categoriaTendencia,
        es_oferta_destacada: esOferta,
        precio_oferta_usd: precioOfertaUsd ? parseFloat(precioOfertaUsd) : null,
      });
      onSaved(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase">
              SKU: {product.sku} • Stock Real: {product.stockQuantity} und
            </span>
            <h3 className="text-sm sm:text-base font-black truncate max-w-md">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* 1. Modalidad de Venta (Unidad / Caja) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase">
              <Package className="h-4 w-4 text-catador-blue" />
              1. Configuración de Venta por Unidad o por Caja
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Permitir Vender:</label>
                <select
                  value={modalidadVenta}
                  onChange={(e) => setModalidadVenta(e.target.value as SaleMode)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-900"
                >
                  <option value="ambos">Unidad y Caja (Ambos)</option>
                  <option value="solo_unidad">Solo por Unidad</option>
                  <option value="solo_caja">Solo por Caja Cerrada</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unidades por Caja:</label>
                <input
                  type="number"
                  min="2"
                  value={unidadesPorCaja}
                  onChange={(e) => setUnidadesPorCaja(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Precio de Caja ($ USD):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioCajaUsd}
                  onChange={(e) => setPrecioCajaUsd(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Control de Existencia y Visibilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="font-black text-slate-900 block">
                Vender Artículo Sin Stock (Backorder)
              </label>
              <select
                value={permitirSinStock}
                onChange={(e) => setPermitirSinStock(e.target.value)}
                className="w-full rounded-xl border border-amber-300 bg-white p-2 font-bold text-slate-900"
              >
                <option value="global">Usar regla global de la tienda</option>
                <option value="true">Activado (Permitir vender sin stock)</option>
                <option value="false">Desactivado (Exigir stock disponible)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-black text-rose-950 flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5 text-rose-600" />
                  Ocultar / No Vender en Web
                </span>
                <input
                  type="checkbox"
                  checked={ocultoEnWeb}
                  onChange={(e) => setOcultoEnWeb(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-600"
                />
              </div>
              <p className="text-[11px] text-rose-800 mt-1">
                Activa esta casilla para quitar este artículo de la tienda aunque tenga existencia en FoxData.
              </p>
            </div>
          </div>

          {/* 3. Secciones de Portada: 1. Tendencias y 2. Ofertas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <label className="flex items-center justify-between font-black text-slate-900 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-catador-blue" />
                  Incluir en «1. Tendencias»
                </span>
                <input
                  type="checkbox"
                  checked={esTendencia}
                  onChange={(e) => setEsTendencia(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
              {esTendencia && (
                <select
                  value={categoriaTendencia}
                  onChange={(e) => setCategoriaTendencia(e.target.value as TrendCategoryTab)}
                  className="w-full rounded-lg border border-blue-200 bg-white p-2 text-xs font-bold"
                >
                  <option value="mas_vendidos">Pestaña: Más Vendidos</option>
                  <option value="ofertas">Pestaña: En Oferta</option>
                  <option value="nuevos">Pestaña: Novedades</option>
                </select>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <label className="flex items-center justify-between font-black text-slate-900 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-catador-amber" />
                  Incluir en «2. Ofertas del Día»
                </span>
                <input
                  type="checkbox"
                  checked={esOferta}
                  onChange={(e) => setEsOferta(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Precio Oferta USD (Actual: $${product.priceUsd})`}
                  value={precioOfertaUsd}
                  onChange={(e) => setPrecioOfertaUsd(e.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* 4. Descripción Personalizada del Artículo */}
          <div>
            <label className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
              <FileText className="h-4 w-4 text-catador-blue" />
              Descripción Comercial del Artículo en la Tienda:
            </label>
            <textarea
              rows={3}
              value={descripcionCustom}
              onChange={(e) => setDescripcionCustom(e.target.value)}
              placeholder="Escribe la descripción comercial, notas de cata, presentación o detalles del producto..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

