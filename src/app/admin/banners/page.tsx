'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Eye,
  LayoutTemplate,
  Tag,
  Wine,
  ShoppingBag,
  Grid,
} from 'lucide-react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Banner as AstryxBanner } from '@astryxdesign/core/Banner';
import { Switch } from '@astryxdesign/core/Switch';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
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

const HERO_COLOR_PRESETS = [
  { label: 'Midnight Navy', hex: '#081229' },
  { label: 'Azul Catador', hex: '#001754' },
  { label: 'Slate Oscuro', hex: '#0F172A' },
  { label: 'Negro Carbón', hex: '#111827' },
  { label: 'Roble Añejo', hex: '#2B160B' },
];

const DEFAULT_BANNER_SLOTS: Record<BannerSlot, Partial<Banner>> = {
  hero: {
    tipo: 'hero',
    titulo: 'CAVAS, LICORES & BODEGÓN ·',
    titulo_destacado: 'ENTREGA INMEDIATA EN BARINAS',
    subtitulo:
      'Compra por unidad o caja cerrada con inventario real en nuestra sede (C.C. Ciudad Catador Local N1) y precios bimonetarios en $ USD y Bs. BCV.',
    badge_texto: 'BODEGÓN MODERNO · C.C. CIUDAD CATADOR LOCAL N1',
    boton_texto: 'Ver Ofertas del Día',
    boton_url: '/#ofertas',
    boton_secundario_texto: 'Explorar Catálogo',
    boton_secundario_url: '/catalogo',
    color_fondo: '#081229',
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
  const showToast = useToast();
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
      });
      setBanners((prev) => ({ ...prev, [activeSlot]: updated }));

      try {
        await fetch('/api/admin/revalidate', { method: 'POST' });
      } catch {
        // Silencioso
      }

      setSaved(true);
      showToast({ body: `Banner "${activeSlot.toUpperCase()}" guardado en la tienda.` });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast({
        body: 'Error guardando banner: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
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

        <SegmentedControl
          size="md"
          label="Sección de edición de portada"
          value={mainTab}
          onChange={(val) => setMainTab(val as MainTab)}
        >
          <SegmentedControlItem
            value="banners"
            label="Banners & Promociones"
            icon={<LayoutTemplate className="h-3.5 w-3.5" />}
          />
          <SegmentedControlItem
            value="quick_categories"
            label="Categorías Rápidas (6)"
            icon={<Grid className="h-3.5 w-3.5" />}
          />
        </SegmentedControl>
      </div>

      {mainTab === 'quick_categories' ? (
        <QuickCategoriesEditor />
      ) : (
        <>
          <TabList
            value={activeSlot}
            onChange={(val) => setActiveSlot(val as BannerSlot)}
            overflow="scroll"
            hasDivider
          >
            <Tab
              value="hero"
              label="Hero Principal Superior"
              icon={<LayoutTemplate className="h-3.5 w-3.5" />}
            />
            <Tab
              value="promo_1"
              label="Promo 1: Whiskies Escoceses"
              icon={<Wine className="h-3.5 w-3.5" />}
            />
            <Tab
              value="promo_2"
              label="Promo 2: Cervezas & Refrescos"
              icon={<Tag className="h-3.5 w-3.5" />}
            />
            <Tab
              value="promo_3"
              label="Promo 3: Víveres & Despensa"
              icon={<ShoppingBag className="h-3.5 w-3.5" />}
            />
          </TabList>

          {saved && (
            <AstryxBanner
              status="success"
              title="Banner guardado con éxito"
              description="Los cambios ya son visibles en la tienda en tiempo real."
              isDismissable
              onDismiss={() => setSaved(false)}
            />
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {activeSlot === 'hero' ? 'Título Principal Línea 1 (Blanco) *' : 'Título Principal *'}
                </label>
                <input
                  type="text"
                  required
                  value={currentBanner.titulo || ''}
                  onChange={(e) => updateCurrent({ titulo: e.target.value })}
                  placeholder={activeSlot === 'hero' ? 'CAVAS, LICORES & BODEGÓN ·' : ''}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              {activeSlot === 'hero' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Título Destacado Línea 2 (Dorado Ámbar)
                  </label>
                  <input
                    type="text"
                    value={currentBanner.titulo_destacado || ''}
                    onChange={(e) => updateCurrent({ titulo_destacado: e.target.value })}
                    placeholder="ej. ENTREGA INMEDIATA EN BARINAS"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Texto Superior / Pill Dorado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={currentBanner.badge_texto || ''}
                    onChange={(e) => updateCurrent({ badge_texto: e.target.value })}
                    placeholder="ej. SELECCIÓN PREMIUM"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>
              )}

              {activeSlot === 'hero' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pill Superior Dorado (Cintillo Arriba del Título)
                  </label>
                  <input
                    type="text"
                    value={currentBanner.badge_texto || ''}
                    onChange={(e) => updateCurrent({ badge_texto: e.target.value })}
                    placeholder="ej. BODEGÓN MODERNO · C.C. CIUDAD CATADOR LOCAL N1"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                  />
                </div>
              )}

              {activeSlot === 'hero' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Color de Fondo del Hero
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={currentBanner.color_fondo || '#081229'}
                      onChange={(e) => updateCurrent({ color_fondo: e.target.value })}
                      className="h-9 w-11 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
                    />
                    {HERO_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => updateCurrent({ color_fondo: preset.hex })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  {activeSlot === 'hero' ? 'Texto Botón Primario (Dorado)' : 'Texto del Botón'}
                </label>
                <input
                  type="text"
                  value={currentBanner.boton_texto || ''}
                  onChange={(e) => updateCurrent({ boton_texto: e.target.value })}
                  placeholder="ej. Ver Ofertas del Día"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {activeSlot === 'hero' ? 'Enlace Botón Primario' : 'Enlace del Botón'}
                </label>
                <input
                  type="text"
                  value={currentBanner.boton_url || ''}
                  onChange={(e) => updateCurrent({ boton_url: e.target.value })}
                  placeholder="ej. /#ofertas"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              {activeSlot === 'hero' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Texto Botón Secundario (Opcional · Dejar vacío para ocultar)
                    </label>
                    <input
                      type="text"
                      value={currentBanner.boton_secundario_texto ?? ''}
                      onChange={(e) =>
                        updateCurrent({ boton_secundario_texto: e.target.value })
                      }
                      placeholder="ej. Explorar Catálogo"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Enlace Botón Secundario
                    </label>
                    <input
                      type="text"
                      value={currentBanner.boton_secundario_url ?? ''}
                      onChange={(e) =>
                        updateCurrent({ boton_secundario_url: e.target.value })
                      }
                      placeholder="ej. /catalogo"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
                    />
                  </div>
                </>
              )}
            </div>

            {activeSlot === 'hero' && (
              <>
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-2 pt-2">
                  Píldora Promocional Destacada del Hero
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

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Switch
                label="Banner Activo en la Tienda"
                value={Boolean(currentBanner.activo)}
                onChange={(checked) => updateCurrent({ activo: checked })}
              />

              <Button
                type="submit"
                label={`Guardar Banner (${activeSlot})`}
                variant="primary"
                size="lg"
                icon={<Save className="h-4 w-4" />}
                isLoading={saving}
              />
            </div>
          </form>
        </>
      )}
    </main>
  );
}
