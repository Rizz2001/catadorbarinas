'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Package,
  TrendingUp,
  Flame,
  EyeOff,
  Eye,
  Edit3,
  Loader2,
  PackageOpen,
} from 'lucide-react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { useToast } from '@astryxdesign/core/Toast';
import { Product, ProductCmsConfig } from '@/types';
import { getProductCmsConfigs, upsertProductCmsConfig } from '@/services/cms.service';
import { DEFAULT_GROUPS } from '@/constants/fallback-products';
import { ProductConfigModal } from '@/components/admin/ProductConfigModal';
import { formatUsd } from '@/lib/currency';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'trends' | 'deals' | 'hidden';

export default function AdminCatalogoConfigPage() {
  const showToast = useToast();
  const [selectedGroup, setSelectedGroup] = useState('01');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [configsMap, setConfigsMap] = useState<Map<string, ProductCmsConfig>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        searchQuery.trim().length >= 2
          ? `/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=80&includeHidden=true`
          : `/api/catalog?codGrupo=${selectedGroup}&includeHidden=true`;

      const [prodRes, cmsList] = await Promise.all([fetch(url), getProductCmsConfigs()]);
      const prodData = await prodRes.json();
      const map = new Map<string, ProductCmsConfig>();
      cmsList.forEach((c) => map.set(c.cod_articulo.trim(), c));

      setConfigsMap(map);
      setProducts(prodData.products || []);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleQuickToggle = async (
    product: Product,
    field: 'es_tendencia' | 'es_oferta_destacada' | 'oculto_en_web'
  ) => {
    const existing = configsMap.get(product.id);
    const currentValue =
      field === 'es_tendencia'
        ? Boolean(existing?.es_tendencia ?? product.isWeeklyTrend)
        : field === 'es_oferta_destacada'
          ? Boolean(existing?.es_oferta_destacada ?? product.isDealOfTheDay)
          : Boolean(existing?.oculto_en_web ?? product.hiddenFromStore);

    const saved = await upsertProductCmsConfig({
      ...existing,
      cod_articulo: product.id,
      nombre_referencia: product.name,
      modalidad_venta: existing?.modalidad_venta || product.saleMode || 'ambos',
      [field]: !currentValue,
    });

    setConfigsMap((prev) => {
      const next = new Map(prev);
      next.set(product.id, saved);
      return next;
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
            ...p,
            isWeeklyTrend: saved.es_tendencia,
            isDealOfTheDay: saved.es_oferta_destacada,
            hiddenFromStore: saved.oculto_en_web,
          }
          : p
      )
    );
    showToast({ body: `Regla actualizada para ${product.name}` });
  };

  const tabCounts = useMemo(() => {
    let trends = 0;
    let deals = 0;
    let hidden = 0;
    products.forEach((p) => {
      const cfg = configsMap.get(p.id);
      if (cfg?.es_tendencia ?? p.isWeeklyTrend) trends++;
      if (cfg?.es_oferta_destacada ?? p.isDealOfTheDay) deals++;
      if (cfg?.oculto_en_web ?? p.hiddenFromStore) hidden++;
    });
    return { all: products.length, trends, deals, hidden };
  }, [products, configsMap]);

  const filteredProducts = products.filter((p) => {
    const cfg = configsMap.get(p.id);
    const isTrend = Boolean(cfg?.es_tendencia ?? p.isWeeklyTrend);
    const isDeal = Boolean(cfg?.es_oferta_destacada ?? p.isDealOfTheDay);
    const isHidden = Boolean(cfg?.oculto_en_web ?? p.hiddenFromStore);

    if (filterTab === 'trends') return isTrend;
    if (filterTab === 'deals') return isDeal;
    if (filterTab === 'hidden') return isHidden;
    return true;
  });

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
            Artículos, Modalidad Unidad/Caja y Secciones de Portada
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configura venta por unidad o caja, artículos sin stock, visibilidad web y secciones (1. Tendencias / 2. Ofertas)
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg tabular-nums self-start sm:self-auto">
          {filteredProducts.length} artículos listados
        </span>
      </div>

      {/* Barra de Búsqueda, Grupos y Filtros Rápidos */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o SKU..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-catador-blue"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSearchQuery('');
                setSelectedGroup(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-800 bg-slate-50"
            >
              {DEFAULT_GROUPS.map((g) => (
                <option key={g.CodGrupo} value={g.CodGrupo}>
                  Grupo {g.CodGrupo}: {g.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 overflow-x-auto no-scrollbar tabular-nums flex items-center">
            <SegmentedControl
              size="sm"
              layout="fill"
              label="Filtrar artículos"
              value={filterTab}
              onChange={(val) => setFilterTab(val as FilterTab)}
              className="w-full"
            >
              <SegmentedControlItem value="all" label={`Todos (${tabCounts.all})`} />
              <SegmentedControlItem value="trends" label={`Tendencias (${tabCounts.trends})`} />
              <SegmentedControlItem value="deals" label={`Ofertas (${tabCounts.deals})`} />
              <SegmentedControlItem value="hidden" label={`Ocultos (${tabCounts.hidden})`} />
            </SegmentedControl>
          </div>
        </div>
      </div>

      {/* Tabla Operativa de Reglas de Artículos */}
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
          <span>Cargando inventario y reglas del CMS...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <EmptyState
            icon={<PackageOpen className="h-10 w-10 text-slate-400" />}
            title="Sin artículos en este filtro"
            description="Cambia el departamento o selecciona otra pestaña de visualización."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredProducts.slice(0, 60).map((product) => {
              const cfg = configsMap.get(product.id);
              const saleMode = cfg?.modalidad_venta || product.saleMode || 'ambos';
              const isTrend = Boolean(cfg?.es_tendencia ?? product.isWeeklyTrend);
              const isDeal = Boolean(cfg?.es_oferta_destacada ?? product.isDealOfTheDay);
              const isHidden = Boolean(cfg?.oculto_en_web ?? product.hiddenFromStore);
              const unitsBox = cfg?.unidades_por_caja_custom || product.unitsPerBox || 12;

              return (
                <div
                  key={product.id}
                  className={cn(
                    'p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 transition-colors',
                    isHidden ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 tabular-nums">
                      <span className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{product.sku}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        Stock: {product.stockQuantity} und
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-50 text-catador-blue border border-blue-200">
                        <Package className="h-3.5 w-3.5 inline mr-1" />
                        {saleMode === 'solo_unidad'
                          ? 'Solo Unidad'
                          : saleMode === 'solo_caja'
                            ? `Solo Caja x${unitsBox}`
                            : `Unidad y Caja x${unitsBox}`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <h3 className="text-sm font-black text-slate-900 truncate">
                        {product.name}
                      </h3>
                      <span className="text-sm font-black text-catador-blue tabular-nums shrink-0">
                        {formatUsd(product.priceUsd)}
                      </span>
                    </div>
                  </div>

                  {/* Botonera de Acciones Adaptada para Móvil (2x2) y Desktop */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'es_tendencia')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer',
                        isTrend
                          ? 'bg-catador-blue text-white border-catador-blue shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <TrendingUp className="h-4 w-4 shrink-0" />
                      <span>1. Tendencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'es_oferta_destacada')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer',
                        isDeal
                          ? 'bg-catador-amber text-white border-catador-amber shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Flame className="h-4 w-4 shrink-0" />
                      <span>2. Oferta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'oculto_en_web')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer',
                        isHidden
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {isHidden ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                      <span>{isHidden ? 'Oculto' : 'Visible'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingProduct(product)}
                      className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4 shrink-0" />
                      <span>Caja / Ficha</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingProduct && (
        <ProductConfigModal
          product={editingProduct}
          existingConfig={configsMap.get(editingProduct.id)}
          onClose={() => setEditingProduct(null)}
          onSaved={(saved) => {
            setConfigsMap((prev) => {
              const next = new Map(prev);
              next.set(editingProduct.id, saved);
              return next;
            });
            setEditingProduct(null);
            void loadData();
          }}
        />
      )}
    </main>
  );
}
