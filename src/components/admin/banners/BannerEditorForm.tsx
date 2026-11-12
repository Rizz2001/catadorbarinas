'use client';

import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@/components/admin/ui';
import { Banner } from '@/types';
import { BannerImageUploader } from '../BannerImageUploader';
import { ImageControls } from './ImageControls';
import { BannerHeroPromoFields } from './BannerHeroPromoFields';
import { BannerCtaFields } from './BannerCtaFields';

export type BannerSlotKey = 'hero' | 'promo_1' | 'promo_2' | 'promo_3';

const HERO_COLOR_PRESETS = [
  { label: 'Midnight Navy', hex: '#081229' },
  { label: 'Azul Catador', hex: '#001754' },
  { label: 'Slate Oscuro', hex: '#0F172A' },
  { label: 'Negro Carbón', hex: '#111827' },
  { label: 'Roble Añejo', hex: '#2B160B' },
];

interface BannerEditorFormProps {
  activeSlot: BannerSlotKey;
  currentBanner: Partial<Banner>;
  saving: boolean;
  onUpdate: (patch: Partial<Banner>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Formulario de edición de imagen, copywriting, colores, CTAs y estado de un Banner CMS.
 */
export function BannerEditorForm({
  activeSlot,
  currentBanner,
  saving,
  onUpdate,
  onSubmit,
}: BannerEditorFormProps) {
  const isHero = activeSlot === 'hero';

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 text-xs bg-white p-6 rounded-xl border border-slate-200"
    >
      <div className="space-y-3">
        <BannerImageUploader
          imageUrl={currentBanner.imagen_url}
          onImageChange={(url) => onUpdate({ imagen_url: url })}
        />

        <ImageControls
          overlayOpacity={currentBanner.overlay_opacity ?? 85}
          objectPosition={currentBanner.object_position ?? 'center'}
          onOverlayChange={(opacity) => onUpdate({ overlay_opacity: opacity })}
          onPositionChange={(pos) => onUpdate({ object_position: pos })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {isHero ? 'Título Principal Línea 1 (Blanco) *' : 'Título Principal *'}
          </label>
          <input
            type="text"
            required
            value={currentBanner.titulo || ''}
            onChange={(e) => onUpdate({ titulo: e.target.value })}
            placeholder={isHero ? 'CAVAS, LICORES & BODEGÓN ·' : ''}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        {isHero ? (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Título Destacado Línea 2 (Dorado Ámbar)
            </label>
            <input
              type="text"
              value={currentBanner.titulo_destacado || ''}
              onChange={(e) => onUpdate({ titulo_destacado: e.target.value })}
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
              onChange={(e) => onUpdate({ badge_texto: e.target.value })}
              placeholder="ej. SELECCIÓN PREMIUM"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        )}

        {isHero && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pill Superior Dorado (Cintillo Arriba del Título)
            </label>
            <input
              type="text"
              value={currentBanner.badge_texto || ''}
              onChange={(e) => onUpdate({ badge_texto: e.target.value })}
              placeholder="ej. BODEGÓN MODERNO · C.C. CIUDAD CATADOR LOCAL N1"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        )}

        {isHero && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Color de Fondo del Hero
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={currentBanner.color_fondo || '#081229'}
                onChange={(e) => onUpdate({ color_fondo: e.target.value })}
                className="h-9 w-11 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
              />
              {HERO_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => onUpdate({ color_fondo: preset.hex })}
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
            onChange={(e) => onUpdate({ subtitulo: e.target.value })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <BannerCtaFields
          isHero={isHero}
          currentBanner={currentBanner}
          onUpdate={onUpdate}
        />
      </div>

      {isHero && (
        <BannerHeroPromoFields currentBanner={currentBanner} onUpdate={onUpdate} />
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Switch
          label="Banner Activo en la Tienda"
          value={Boolean(currentBanner.activo)}
          onChange={(checked) => onUpdate({ activo: checked })}
        />

        <Button
          type="submit"
          label={`Guardar Banner (${activeSlot})`}
          variant="primary"
          size="lg"
          icon={<Save className="h-4 w-4" strokeWidth={1.5}/>}
          isLoading={saving}
        />
      </div>
    </form>
  );
}

