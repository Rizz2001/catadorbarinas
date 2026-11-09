'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  LayoutTemplate,
  Tag,
  Wine,
  ShoppingBag,
  Grid,
} from 'lucide-react';
import { Banner } from '@/types';
import { getBanners, upsertBanner } from '@/services/cms.service';
import {
  BannerPreview,
  BannerImageUploader,
  PromoCardPreview,
  QuickCategoriesEditor,
} from '@/components/admin';

type MainTab = 'banners' | 'quick_categories';
type BannerSlot = 'hero' | 'promo_1' | 'promo_2' | 'promo_3';

const DEFAULT_BANNER_SLOTS: Record<BannerSlot, Partial<Banner>> = {
  hero: {
    tipo: 'hero',
    titulo: 'Licores Importados y Víveres al Precio Oficial en Barinas',
    subtitulo:
      'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.',
    badge_texto: '',
    boton_texto: 'Ver Ofertas del Día',
    boton_url: '/catalogo',
    promo_titulo: '',
    promo_precio: 0,
    promo_badge: '',
    promo_ahorro: '',
    activo: true,
  },
  promo_1: {
    tipo: 'promo_1',
    titulo: 'Whiskies Escoceses',
    subtitulo: "Buchanan's, Old Parr, Chivas y Black Label al mejor precio oficial.",
    badge_texto: '',
    boton_texto: 'Ver selección',
    boton_url: '/catalogo/01/01',
    imagen_url:
      'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
    activo: true,
  },
  promo_2: {
    tipo: 'promo_2',
    titulo: 'Cervezas & Refrescos',
    subtitulo:
      'Polar Pilsen, Solera, Corona y combos con hielo para tus celebraciones.',
    badge_texto: '',
    boton_texto: 'Ver cervezas frías',
    boton_url: '/catalogo/09',
    imagen_url:
      'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
    activo: true,
  },
  promo_3: {
    tipo: 'promo_3',
    titulo: 'Víveres & Despensa',
    subtitulo:
      'Harina P.A.N., arroz, aceites de oliva, salsas y productos esenciales para tu hogar.',
    badge_texto: '',
    boton_texto: 'Explorar víveres',
    boton_url: '/catalogo/11',
    imagen_url:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    activo: true,
  },
};

export default function AdminBannersPage() {
  const [mainTab, setMainTab] = useState<MainTab>('banners');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSlot, setActiveSlot] = useState<BannerSlot>('hero');
  const [banners, setBanners] = useState<Record<BannerSlot, Partial<Banner>>>(
    DEFAULT_BANNER_SLOTS
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getBanners();
        setBanners((prev) => {
          const next = { ...prev };
          list.forEach((b) => {
            const slot = (
              b.tipo === 'promocion_grid'
                ? 'promo_1'
                : b.tipo === 'secundario'
                  ? 'promo_2'
                  : b.tipo
            ) as BannerSlot;
            if (next[slot]) {
              next[slot] = b;
            }
          });
          return next;
        });
      } catch (err) {
        console.error('Error cargando banners:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentBanner = banners[activeSlot];

  const updateCurrent = (patch: Partial<Banner>) => {
    setBanners((prev) => ({
      ...prev,
      [activeSlot]: { ...prev[activeSlot], ...patch },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await upsertBanner({
        ...currentBanner,
        tipo: activeSlot,
        badge_texto: '',
      });
      setBanners((prev) => ({ ...prev, [activeSlot]: updated }));

      try {
        await fetch('/api/admin/revalidate', { method: 'POST' });
      } catch {
        // Silencioso
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(
        'Error guardando banner: ' +
          (err instanceof Error ? err.message : 'Intenta nuevamente')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" />
        <span className="text-xs font-bold text-slate-500">
          Cargando Banners y Promociones...
        </span>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 space-y-5 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400">
            Dirección Visual de Portada
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-[-0.025em] mt-0.5">
            Banners, Promociones &amp; Accesos Rápidos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza el Hero principal, la fila de 3 promociones editoriales y los 6 accesos directos
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setMainTab('banners')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              mainTab === 'banners'
                ? 'bg-white text-slate-900 border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>Banners &amp; Promociones</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('quick_categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              mainTab === 'quick_categories'
                ? 'bg-white text-slate-900 border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Categorías Rápidas (6 Accesos)</span>
          </button>
        </div>
      </div>

      {mainTab === 'quick_categories' ? (
        <QuickCategoriesEditor />
      ) : (
        <>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'hero' as const, label: 'Hero Principal Superior', icon: LayoutTemplate },
              { id: 'promo_1' as const, label: 'Promo 1: Whiskies Escoceses', icon: Wine },
              { id: 'promo_2' as const, label: 'Promo 2: Cervezas & Refrescos', icon: Tag },
              { id: 'promo_3' as const, label: 'Promo 3: Víveres & Despensa', icon: ShoppingBag },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSlot(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeSlot === id
                    ? 'bg-white text-catador-blue ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Banner guardado con éxito. Los cambios ya son visibles en la tienda en tiempo real.
              </span>
            </div>
          )}

          <section className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Eye className="h-4 w-4 text-catador-blue" />
              <span>Vista Previa en Vivo ({activeSlot.toUpperCase()})</span>
            </div>
            {activeSlot === 'hero' ? (
              <BannerPreview banner={currentBanner} />
            ) : (
              <PromoCardPreview banner={currentBanner} />
            )}
          </section>

          <form
            onSubmit={handleSave}
            className="space-y-6 text-xs bg-white p-6 rounded-xl border border-slate-200"
          >
            <BannerImageUploader
              imageUrl={currentBanner.imagen_url}
              onImageChange={(url) => updateCurrent({ imagen_url: url })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Título Principal *
                </label>
                <input
                  type="text"
                  required
                  value={currentBanner.titulo || ''}
                  onChange={(e) => updateCurrent({ titulo: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Subtítulo Descriptivo
                </label>
                <textarea
                  rows={2}
                  value={currentBanner.subtitulo || ''}
                  onChange={(e) => updateCurrent({ subtitulo: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={currentBanner.boton_texto || ''}
                  onChange={(e) => updateCurrent({ boton_texto: e.target.value })}
                  placeholder="ej. Ver selección"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enlace del Botón
                </label>
                <input
                  type="text"
                  value={currentBanner.boton_url || ''}
                  onChange={(e) => updateCurrent({ boton_url: e.target.value })}
                  placeholder="ej. /catalogo/01/01"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>
            </div>

            {activeSlot === 'hero' && (
              <>
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-2 pt-2">
                  Caja Promocional Destacada (Lado Derecho del Hero)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Título de la Promo
                    </label>
                    <input
                      type="text"
                      value={currentBanner.promo_titulo || ''}
                      onChange={(e) => updateCurrent({ promo_titulo: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Precio Promocional ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentBanner.promo_precio ?? ''}
                      onChange={(e) =>
                        updateCurrent({ promo_precio: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Texto de Ahorro
                    </label>
                    <input
                      type="text"
                      value={currentBanner.promo_ahorro || ''}
                      onChange={(e) => updateCurrent({ promo_ahorro: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(currentBanner.activo)}
                  onChange={(e) => updateCurrent({ activo: e.target.checked })}
                  className="h-4 w-4 rounded text-catador-blue focus:ring-catador-blue/20"
                />
                <span>Banner Activo en la Tienda</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-6 py-2.5 font-extrabold text-white text-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Guardar Banner ({activeSlot})</span>
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
