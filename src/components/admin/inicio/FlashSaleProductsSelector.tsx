'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Flame, Loader2, Search } from 'lucide-react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { useToast } from '@astryxdesign/core/Toast';
import { Product, ProductCmsConfig } from '@/types';
import { DEFAULT_GROUPS } from '@/constants/fallback-products';
import {
  getProductCmsConfigs,
  upsertProductCmsConfig,
  revalidateStorefrontCache,
} from '@/services/cms.service';
import { FlashSaleProductRow } from './FlashSaleProductRow';

export function FlashSaleProductsSelector() {
  const showToast = useToast();
  const [viewMode, setViewMode] = useState<'active' | 'browse'>('active');
  const [selectedGroup, setSelectedGroup] = useState('01');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [configs, setConfigs] = useState<ProductCmsConfig[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [offerPriceDrafts, setOfferPriceDrafts] = useState<Record<string, string>>({});

  const loadCatalogAndDeals = useCallback(async () => {
    try {
      const url =
        searchQuery.trim().length >= 2
          ? `/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=60&includeHidden=true`
          : `/api/catalog?codGrupo=${selectedGroup}&includeHidden=true`;

      const [res, cmsList] = await Promise.all([fetch(url), getProductCmsConfigs()]);
      const data = await res.json();
      setCatalogProducts((data.products || []) as Product[]);
      setConfigs(cmsList);
    } finally {
      setLoadingCatalog(false);
    }
  }, [selectedGroup, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadCatalogAndDeals();
    }, 200);
    return () => clearTimeout(t);
  }, [loadCatalogAndDeals]);

  const configMap = useMemo(() => {
    const map = new Map<string, ProductCmsConfig>();
    configs.forEach((cfg) => map.set(cfg.cod_articulo.trim(), cfg));
    return map;
  }, [configs]);

  const activeDealConfigs = useMemo(
    () => configs.filter((cfg) => cfg.es_oferta_destacada),
    [configs]
  );

  const toggleProductOffer = async (sku: string, name: string, nextActive: boolean) => {
    setSavingId(sku);
    try {
      const existing = configMap.get(sku);
      const rawDraft = offerPriceDrafts[sku];
      const parsedDraft = rawDraft !== undefined ? parseFloat(rawDraft) || null : undefined;

      const saved = await upsertProductCmsConfig({
        ...existing,
        cod_articulo: sku,
        nombre_referencia: existing?.nombre_referencia || name,
        modalidad_venta: existing?.modalidad_venta || 'ambos',
        es_oferta_destacada: nextActive,
        precio_oferta_usd:
          parsedDraft !== undefined ? parsedDraft : existing?.precio_oferta_usd ?? null,
      });

      setConfigs((prev) => {
        const exists = prev.some((c) => c.cod_articulo.trim() === sku);
        if (!exists) return [saved, ...prev];
        return prev.map((c) => (c.cod_articulo.trim() === sku ? saved : c));
      });
      await revalidateStorefrontCache();
      showToast({
        body: nextActive
          ? `${name} actualizado en Ofertas Relámpago.`
          : `${name} retirado de Ofertas Relámpago.`,
      });
    } catch (err) {
      showToast({
        body: err instanceof Error ? err.message : 'Error actualizando oferta del producto.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Productos en Oferta (<code className="text-xs font-mono">productos_config_cms</code>)
          </h2>
          <p className="text-xs text-slate-500">
            Activa artículos del inventario real en tiempo real y define precio especial de oferta.
          </p>
        </div>

        <SegmentedControl
          label="Filtro de ofertas relámpago"
          value={viewMode}
          onChange={(val) => setViewMode(val as 'active' | 'browse')}
          size="sm"
        >
          <SegmentedControlItem value="active" label={`En Oferta (${activeDealConfigs.length})`} />
          <SegmentedControlItem value="browse" label="Explorar Inventario" />
        </SegmentedControl>
      </div>

      {viewMode === 'active' ? (
        activeDealConfigs.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 text-center space-y-2">
            <Flame className="h-6 w-6 text-amber-500 mx-auto" strokeWidth={1.5} />
            <p className="text-xs font-bold text-slate-700">
              Aún no has fijado productos destacados manualmente.
            </p>
            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className="px-3.5 py-1.5 rounded-xl bg-catador-blue text-white text-xs font-bold cursor-pointer"
            >
              Seleccionar Productos del Inventario
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeDealConfigs.map((cfg) => {
              const sku = cfg.cod_articulo.trim();
              const matched = catalogProducts.find((p) => p.id === sku);
              const draft =
                offerPriceDrafts[sku] ??
                (cfg.precio_oferta_usd ? String(cfg.precio_oferta_usd) : '');
              return (
                <FlashSaleProductRow
                  key={sku}
                  sku={sku}
                  name={cfg.nombre_referencia || matched?.name || sku}
                  imageUrl={matched?.images[0]}
                  basePriceUsd={matched?.priceUsd}
                  offerPriceDraft={draft}
                  isDeal
                  isSaving={savingId === sku}
                  onDraftChange={(val) => setOfferPriceDrafts((p) => ({ ...p, [sku]: val }))}
                  onApplyOrToggle={(next) =>
                    toggleProductOffer(sku, cfg.nombre_referencia || sku, next)
                  }
                />
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-5 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setLoadingCatalog(true);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Buscar producto por nombre o SKU..."
                className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900"
              />
            </div>

            <div className="sm:col-span-7 flex items-center gap-2 overflow-x-auto pb-1">
              {DEFAULT_GROUPS.slice(0, 6).map((grp) => (
                <button
                  key={grp.CodGrupo}
                  type="button"
                  onClick={() => {
                    setLoadingCatalog(true);
                    setSearchQuery('');
                    setSelectedGroup(grp.CodGrupo);
                  }}
                  className={`shrink-0 h-9 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    !searchQuery && selectedGroup === grp.CodGrupo
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {grp.Nombre}
                </button>
              ))}
            </div>
          </div>

          {loadingCatalog ? (
            <div className="py-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-catador-blue" strokeWidth={1.5} />
              <span>Consultando productos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {catalogProducts.map((product) => {
                const cfg = configMap.get(product.id);
                const isDeal = Boolean(cfg?.es_oferta_destacada ?? product.isDealOfTheDay);
                const draft =
                  offerPriceDrafts[product.id] ??
                  (cfg?.precio_oferta_usd ? String(cfg.precio_oferta_usd) : '');
                return (
                  <FlashSaleProductRow
                    key={product.id}
                    sku={product.id}
                    name={product.name}
                    imageUrl={product.images[0]}
                    basePriceUsd={product.priceUsd}
                    offerPriceDraft={draft}
                    isDeal={isDeal}
                    isSaving={savingId === product.id}
                    onDraftChange={(val) =>
                      setOfferPriceDrafts((p) => ({ ...p, [product.id]: val }))
                    }
                    onApplyOrToggle={(next) =>
                      toggleProductOffer(product.id, product.name, next)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
