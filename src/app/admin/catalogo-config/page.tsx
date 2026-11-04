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
} from 'lucide-react';
import { Product, ProductCmsConfig } from '@/types';
import { getProductCmsConfigs, upsertProductCmsConfig } from '@/services/cms.service';
import { DEFAULT_GROUPS } from '@/constants/fallback-products';
import { ProductConfigModal } from '@/components/admin/ProductConfigModal';
import { formatUsd } from '@/lib/currency';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'trends' | 'deals' | 'hidden';

export default function AdminCatalogoConfigPage() {
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

          <div className="md:col-span-5 flex gap-1 bg-slate-100 p-1 rounded-lg tabular-nums">
            {(
              [
                { id: 'all', label: `Todos (${tabCounts.all})` },
                { id: 'trends', label: `1. Tendencias (${tabCounts.trends})` },
                { id: 'deals', label: `2. Ofertas (${tabCounts.deals})` },
                { id: 'hidden', label: `Ocultos (${tabCounts.hidden})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer truncate',
                  filterTab === tab.id ? 'bg-catador-blue text-white' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla Operativa de Reglas de Artículos */}
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
          <span>Cargando inventario y reglas del CMS...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden">
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
                    'p-3.5 sm:px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors',
                    isHidden ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 tabular-nums">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        #{product.sku}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        Stock: {product.stockQuantity} und
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-catador-blue">
                        <Package className="h-3 w-3 inline mr-1" />
                        {saleMode === 'solo_unidad'
                          ? 'Solo Unidad'
                          : saleMode === 'solo_caja'
                            ? `Solo Caja x${unitsBox}`
                            : `Unidad y Caja x${unitsBox}`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {product.name}
                      </h3>
                      <span className="text-xs font-black text-catador-blue tabular-nums shrink-0">
                        {formatUsd(product.priceUsd)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'es_tendencia')}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer',
                        isTrend
                          ? 'bg-catador-blue text-white border-catador-blue'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>1. Tendencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'es_oferta_destacada')}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer',
                        isDeal
                          ? 'bg-catador-amber text-white border-catador-amber'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <Flame className="h-3.5 w-3.5" />
                      <span>2. Oferta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'oculto_en_web')}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer',
                        isHidden
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{isHidden ? 'Oculto' : 'Visible'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingProduct(product)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Caja y Ficha</span>
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
