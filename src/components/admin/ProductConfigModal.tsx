'use client';

import React, { useState } from 'react';
import { Save, Package, EyeOff, Flame, TrendingUp, FileText } from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { useToast } from '@astryxdesign/core/Toast';
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
  const showToast = useToast();
  const [modalidadVenta, setModalidadVenta] = useState<SaleMode>(
    existingConfig?.modalidad_venta || product.saleMode || 'ambos'
  );
  const [unidadesPorCaja, setUnidadesPorCaja] = useState<string>(
    String(existingConfig?.unidades_por_caja_custom || product.unitsPerBox || 12)
  );
  const [precioCajaUsd, setPrecioCajaUsd] = useState<string>(
    existingConfig?.precio_caja_usd_custom
      ? String(existingConfig.precio_caja_usd_custom)
      : product.boxPriceUsd
      ? String(product.boxPriceUsd)
      : ''
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
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>(
    existingConfig?.porcentaje_descuento_custom
      ? String(existingConfig.porcentaje_descuento_custom)
      : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedDiscount = parseInt(porcentajeDescuento, 10);
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
        porcentaje_descuento_custom:
          parsedDiscount > 0 && parsedDiscount < 100 ? parsedDiscount : null,
      });
      try {
        await fetch('/api/admin/revalidate', { method: 'POST' });
      } catch {
        // Silencioso
      }
      showToast({ body: `Configuración guardada para ${product.name}` });
      onSaved(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
      width={680}
      purpose="form"
    >
      <Layout
        height="fill"
        header={
          <DialogHeader
            title={product.name}
            subtitle={`SKU: ${product.sku} • Stock Real: ${product.stockQuantity} und`}
            onOpenChange={(open) => {
              if (!open && !saving) onClose();
            }}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            <form id="product-config-form" onSubmit={handleSave} className="space-y-4 text-xs">
              {/* 1. Modalidad de Venta (Unidad / Caja) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase">
                  <Package className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
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
                    <label className="block font-bold text-slate-700 mb-1">
                      Unidades por Caja:
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={unidadesPorCaja}
                      onChange={(e) => setUnidadesPorCaja(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Precio de Caja ($ USD):
                    </label>
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
                    Venta Sin Stock en FoxData
                  </label>
                  <select
                    value={permitirSinStock}
                    onChange={(e) => setPermitirSinStock(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-white p-2 font-bold text-slate-900"
                  >
                    <option value="false">Desactivado (Estricto: exigir stock en FoxData)</option>
                    <option value="true">
                      Activado (Permitir vender sin stock / bajo pedido)
                    </option>
                    <option value="global">Regla global de la tienda (Exigir stock)</option>
                  </select>
                  <p className="text-[10px] text-amber-800">
                    Si está desactivado, el cliente solo podrá comprar lo que haya en existencia
                    real.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
                  <Switch
                    label="Ocultar / No Vender en Web"
                    description="Quita este artículo de la tienda aunque tenga existencia en FoxData"
                    labelIcon={<EyeOff className="h-3.5 w-3.5 text-rose-600" strokeWidth={1.5}/>}
                    labelPosition="start"
                    labelSpacing="spread"
                    value={ocultoEnWeb}
                    onChange={setOcultoEnWeb}
                  />
                </div>
              </div>

              {/* 3. Secciones de Portada: 1. Tendencias y 2. Ofertas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2.5">
                  <Switch
                    label="Incluir en «1. Tendencias»"
                    labelIcon={<TrendingUp className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>}
                    labelPosition="start"
                    labelSpacing="spread"
                    value={esTendencia}
                    onChange={setEsTendencia}
                  />
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

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                  <Switch
                    label="Incluir en «2. Ofertas del Día»"
                    labelIcon={<Flame className="h-4 w-4 text-catador-amber" strokeWidth={1.5}/>}
                    labelPosition="start"
                    labelSpacing="spread"
                    value={esOferta}
                    onChange={setEsOferta}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Precio Oferta ($${product.priceUsd})`}
                      value={precioOfertaUsd}
                      onChange={(e) => setPrecioOfertaUsd(e.target.value)}
                      className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs font-bold"
                    />
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="99"
                      placeholder="% Descuento (ej: 15)"
                      value={porcentajeDescuento}
                      onChange={(e) => setPorcentajeDescuento(e.target.value)}
                      className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Descripción Personalizada del Artículo */}
              <div>
                <label className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
                  <FileText className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
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
            </form>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                label="Cancelar"
                variant="secondary"
                isDisabled={saving}
                onClick={onClose}
              />
              <Button
                type="submit"
                form="product-config-form"
                label="Guardar Configuración"
                variant="primary"
                icon={<Save className="h-4 w-4" strokeWidth={1.5}/>}
                isLoading={saving}
              />
            </div>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
