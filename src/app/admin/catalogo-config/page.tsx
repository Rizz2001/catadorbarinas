'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Reglas de Artículos, Unidad/Caja y Secciones (1. Tendencias / 2. Ofertas)
            </h1>
            <p className="text-xs text-slate-500">
              Configura venta por unidad o caja, artículos sin stock, ocultar productos, descripción y secciones de inicio
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda, Grupos y Filtros Rápidos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artículo por nombre, marca o código SKU..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSearchQuery('');
                setSelectedGroup(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-slate-800 bg-slate-50"
            >
              {DEFAULT_GROUPS.map((g) => (
                <option key={g.CodGrupo} value={g.CodGrupo}>
                  Grupo {g.CodGrupo}: {g.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'trends', label: '1. Tendencias' },
                { id: 'deals', label: '2. Ofertas' },
                { id: 'hidden', label: 'Ocultos' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer',
                  filterTab === tab.id ? 'bg-white text-catador-blue shadow-xs' : 'text-slate-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla / Tarjetas de Configuración de Productos */}
      {loading ? (
        <div className="p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-catador-blue" />
          <span>Cargando inventario y reglas del CMS...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredProducts.slice(0, 60).map((product) => {
              const cfg = configsMap.get(product.id);
              const saleMode = cfg?.modalidad_venta || product.saleMode || 'ambos';
              const isTrend = Boolean(cfg?.es_tendencia ?? product.isWeeklyTrend);
              const isDeal = Boolean(cfg?.es_oferta_destacada ?? product.isDealOfTheDay);
              const isHidden = Boolean(cfg?.oculto_en_web ?? product.hiddenFromStore);

              return (
                <div
                  key={product.id}
                  className={cn(
                    'p-3.5 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors',
                    isHidden ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{product.sku}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Stock: {product.stockQuantity} und
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-catador-blue">
                        <Package className="h-3 w-3 inline mr-0.5" />
                        {saleMode === 'solo_unidad'
                          ? 'Solo Unidad'
                          : saleMode === 'solo_caja'
                          ? `Solo Caja x${cfg?.unidades_por_caja_custom || product.unitsPerBox || 12}`
                          : `Unidad y Caja x${cfg?.unidades_por_caja_custom || product.unitsPerBox || 12}`}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 truncate">
                      {product.name} — <span className="text-catador-blue">{formatUsd(product.priceUsd)}</span>
                    </h3>
                  </div>

                  {/* Controles rápidos de 1 clic */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'es_tendencia')}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer',
                        isTrend
                          ? 'bg-blue-600 text-white border-blue-600'
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
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer',
                        isDeal
                          ? 'bg-amber-500 text-white border-amber-500'
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
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer',
                        isHidden
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{isHidden ? 'Oculto en Web' : 'Visible'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingProduct(product)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Configurar Caja / Descripción</span>
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

