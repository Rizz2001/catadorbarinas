'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, CheckCircle2, Loader2, Eye, LayoutTemplate, Tag, Sparkles } from 'lucide-react';
import { Banner } from '@/types';
import { getBanners, upsertBanner } from '@/services/cms.service';
import { BannerPreview, BannerImageUploader } from '@/components/admin';

type BannerSlot = 'hero' | 'promocion_grid' | 'secundario';

const DEFAULT_BANNER_SLOTS: Record<BannerSlot, Partial<Banner>> = {
  hero: {
    tipo: 'hero',
    titulo: 'Los Mejores Licores y Víveres Directo a tu Puerta',
    subtitulo: 'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.',
    badge_texto: '★ DISTRIBUIDORA & BODEGÓN OFICIAL',
    boton_texto: 'Ver Ofertas del Día',
    boton_url: '/catalogo',
    promo_titulo: 'COMBO PARRILLERO & WHISKY',
    promo_precio: 49.99,
    promo_badge: 'Edición Limitada',
    promo_ahorro: 'Ahorra hasta 25% hoy',
    activo: true,
  },
  promocion_grid: {
    tipo: 'promocion_grid',
    titulo: 'Fin de Semana de Parrilla y Cervezas',
    subtitulo: 'Aprovecha nuestras promociones exclusivas en carnes selectas y combos parrilleros.',
    badge_texto: 'OFERTA DE LA SEMANA',
    boton_texto: 'Comprar Combo',
    boton_url: '/catalogo?depto=carniceria',
    promo_titulo: 'PACK POLAR PILSEN + HIELO',
    promo_precio: 18.5,
    promo_badge: 'Super Ahorro',
    promo_ahorro: 'Incluye bolsa de hielo',
    activo: true,
  },
  secundario: {
    tipo: 'secundario',
    titulo: 'Delivery Express en Menos de 45 Minutos',
    subtitulo: 'Entregamos tu pedido frío y listo en toda la zona metropolitana de Barinas.',
    badge_texto: 'DESPACHO INMEDIATO',
    boton_texto: 'Pedir Ahora',
    boton_url: '/catalogo',
    promo_titulo: 'ENVÍO GRATIS > $30',
    promo_precio: 0.0,
    promo_badge: 'Barinas City',
    promo_ahorro: '100% Garantizado',
    activo: true,
  },
};

export default function AdminBannersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSlot, setActiveSlot] = useState<BannerSlot>('hero');
  const [banners, setBanners] = useState<Record<BannerSlot, Partial<Banner>>>(DEFAULT_BANNER_SLOTS);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getBanners();
        setBanners((prev) => {
          const next = { ...prev };
          list.forEach((b) => {
            const slot = b.tipo as BannerSlot;
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
      const updated = await upsertBanner({ ...currentBanner, tipo: activeSlot });
      setBanners((prev) => ({ ...prev, [activeSlot]: updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error guardando banner: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" />
        <span className="text-xs font-bold text-slate-500">Cargando Banners...</span>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Banners &amp; Promociones</h1>
            <p className="text-xs text-slate-500">Configura cualquier banner, cabecera y llamados a la acción de la tienda</p>
          </div>
        </div>

        {/* Selector de Slot de Banner */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'hero' as const, label: 'Hero Principal', icon: LayoutTemplate },
            { id: 'promocion_grid' as const, label: 'Promo Grid', icon: Tag },
            { id: 'secundario' as const, label: 'Express Secundario', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSlot(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSlot === id ? 'bg-white text-catador-blue shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Banner guardado con éxito. Los cambios ya son visibles en la tienda.</span>
        </div>
      )}

      {/* Previsualización en Vivo */}
      <section className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Eye className="h-4 w-4 text-catador-blue" />
          <span>Vista Previa en Vivo ({activeSlot.toUpperCase()})</span>
        </div>
        <BannerPreview banner={currentBanner} />
      </section>

      {/* Formulario de Configuración del Banner */}
      <form onSubmit={handleSave} className="space-y-6 text-xs bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <BannerImageUploader
          imageUrl={currentBanner.imagen_url}
          onImageChange={(url) => updateCurrent({ imagen_url: url })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título Principal *</label>
            <input
              type="text"
              required
              value={currentBanner.titulo || ''}
              onChange={(e) => updateCurrent({ titulo: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Badge Superior</label>
            <input
              type="text"
              value={currentBanner.badge_texto || ''}
              onChange={(e) => updateCurrent({ badge_texto: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Subtítulo Descriptivo</label>
            <textarea
              rows={2}
              value={currentBanner.subtitulo || ''}
              onChange={(e) => updateCurrent({ subtitulo: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Texto del Botón</label>
            <input
              type="text"
              value={currentBanner.boton_texto || ''}
              onChange={(e) => updateCurrent({ boton_texto: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Enlace del Botón</label>
            <input
              type="text"
              value={currentBanner.boton_url || ''}
              onChange={(e) => updateCurrent({ boton_url: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-2 pt-2">
          Caja Promocional Destacada (Lado Derecho)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título de la Promo</label>
            <input
              type="text"
              value={currentBanner.promo_titulo || ''}
              onChange={(e) => updateCurrent({ promo_titulo: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Precio Promocional ($)</label>
            <input
              type="number"
              step="0.01"
              value={currentBanner.promo_precio ?? ''}
              onChange={(e) => updateCurrent({ promo_precio: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Etiqueta Promo</label>
            <input
              type="text"
              value={currentBanner.promo_badge || ''}
              onChange={(e) => updateCurrent({ promo_badge: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Texto de Ahorro</label>
            <input
              type="text"
              value={currentBanner.promo_ahorro || ''}
              onChange={(e) => updateCurrent({ promo_ahorro: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

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
            className="flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-6 py-2.5 font-extrabold text-white text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Guardar Banner ({activeSlot})</span>
          </button>
        </div>
      </form>
    </main>
  );
}
