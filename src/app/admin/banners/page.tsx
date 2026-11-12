'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  LayoutTemplate,
  Tag,
  Wine,
  ShoppingBag,
  Grid,
} from 'lucide-react';
import {
  SegmentedControl,
  SegmentedControlItem,
  TabList,
  Tab,
} from '@/components/admin/ui';
import { Banner as AstryxBanner } from '@astryxdesign/core/Banner';
import { useToast } from '@astryxdesign/core/Toast';
import { Banner } from '@/types';
import { getBanners, upsertBanner, revalidateStorefrontCache } from '@/services/cms.service';
import {
  BannerPreview,
  PromoCardPreview,
  QuickCategoriesEditor,
  DeviceSimulator,
  SortablePromoOrderBar,
  BannerEditorForm,
  type PromoSlotKey,
} from '@/components/admin';

type MainTab = 'banners' | 'quick_categories';
type BannerSlot = 'hero' | 'promo_1' | 'promo_2' | 'promo_3';
const PROMO_SLOTS: PromoSlotKey[] = ['promo_1', 'promo_2', 'promo_3'];

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
  const [savingOrder, setSavingOrder] = useState(false);
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

  const promoOrderItems = useMemo(() => {
    return PROMO_SLOTS.map((slot, idx) => ({
      slot,
      title: banners[slot]?.titulo || `Promo ${idx + 1}`,
      orden: (banners[slot]?.orden ?? 0) > 0 ? Number(banners[slot]?.orden) : idx + 1,
    })).sort((a, b) => a.orden - b.orden);
  }, [banners]);

  const handlePromoReorder = async (orderedSlots: PromoSlotKey[]) => {
    setBanners((prev) => {
      const next = { ...prev };
      orderedSlots.forEach((slot, idx) => {
        next[slot] = { ...next[slot], orden: idx + 1 };
      });
      return next;
    });

    setSavingOrder(true);
    try {
      const updatedList = await Promise.all(
        orderedSlots.map((slot, idx) =>
          upsertBanner({
            ...banners[slot],
            tipo: slot,
            orden: idx + 1,
          })
        )
      );

      setBanners((prev) => {
        const next = { ...prev };
        orderedSlots.forEach((slot, idx) => {
          if (updatedList[idx]) next[slot] = updatedList[idx];
        });
        return next;
      });
      await revalidateStorefrontCache();
      showToast({ body: 'Orden de promociones actualizado en la portada.' });
    } catch (err) {
      showToast({
        body: 'Error actualizando orden: ' + (err instanceof Error ? err.message : 'Intenta nuevamente'),
        type: 'error',
      });
    } finally {
      setSavingOrder(false);
    }
  };

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
        <Loader2 className="h-6 w-6 animate-spin text-catador-blue" strokeWidth={1.5}/>
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
            icon={<LayoutTemplate className="h-3.5 w-3.5" strokeWidth={1.5}/>}
          />
          <SegmentedControlItem
            value="quick_categories"
            label="Categorías Rápidas (6)"
            icon={<Grid className="h-3.5 w-3.5" strokeWidth={1.5}/>}
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
              icon={<LayoutTemplate className="h-3.5 w-3.5" strokeWidth={1.5}/>}
            />
            <Tab
              value="promo_1"
              label="Promo 1: Whiskies Escoceses"
              icon={<Wine className="h-3.5 w-3.5" strokeWidth={1.5}/>}
            />
            <Tab
              value="promo_2"
              label="Promo 2: Cervezas & Refrescos"
              icon={<Tag className="h-3.5 w-3.5" strokeWidth={1.5}/>}
            />
            <Tab
              value="promo_3"
              label="Promo 3: Víveres & Despensa"
              icon={<ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5}/>}
            />
          </TabList>

          {activeSlot !== 'hero' && (
            <SortablePromoOrderBar
              items={promoOrderItems}
              activeSlot={activeSlot}
              isSavingOrder={savingOrder}
              onSelectSlot={(slot) => setActiveSlot(slot)}
              onReorder={handlePromoReorder}
            />
          )}

          {saved && (
            <AstryxBanner
              status="success"
              title="Banner guardado con éxito"
              description="Los cambios ya son visibles en la tienda en tiempo real."
              isDismissable
              onDismiss={() => setSaved(false)}
            />
          )}

          <DeviceSimulator title={`Vista Previa en Vivo (${activeSlot.toUpperCase()})`}>
            {(mode) =>
              activeSlot === 'hero' ? (
                <BannerPreview banner={currentBanner} previewMode={mode} />
              ) : (
                <PromoCardPreview banner={currentBanner} previewMode={mode} />
              )
            }
          </DeviceSimulator>

          <BannerEditorForm
            activeSlot={activeSlot}
            currentBanner={currentBanner}
            saving={saving}
            onUpdate={updateCurrent}
            onSubmit={handleSave}
          />
        </>
      )}
    </main>
  );
}
