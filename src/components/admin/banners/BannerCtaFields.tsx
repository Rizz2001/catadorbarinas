'use client';

import { Banner } from '@/types';

interface BannerCtaFieldsProps {
  isHero: boolean;
  currentBanner: Partial<Banner>;
  onUpdate: (patch: Partial<Banner>) => void;
}

/**
 * Campos de botones CTA (primario y secundario) del editor de Banners CMS.
 */
export function BannerCtaFields({
  isHero,
  currentBanner,
  onUpdate,
}: BannerCtaFieldsProps) {
  return (
    <>
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {isHero ? 'Texto Botón Primario (Dorado)' : 'Texto del Botón'}
        </label>
        <input
          type="text"
          value={currentBanner.boton_texto || ''}
          onChange={(e) => onUpdate({ boton_texto: e.target.value })}
          placeholder="ej. Ver Ofertas del Día"
          className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {isHero ? 'Enlace Botón Primario' : 'Enlace del Botón'}
        </label>
        <input
          type="text"
          value={currentBanner.boton_url || ''}
          onChange={(e) => onUpdate({ boton_url: e.target.value })}
          placeholder="ej. /#ofertas"
          className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
        />
      </div>

      {isHero && (
        <>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Texto Botón Secundario (Opcional · Dejar vacío para ocultar)
            </label>
            <input
              type="text"
              value={currentBanner.boton_secundario_texto ?? ''}
              onChange={(e) =>
                onUpdate({ boton_secundario_texto: e.target.value })
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
                onUpdate({ boton_secundario_url: e.target.value })
              }
              placeholder="ej. /catalogo"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </>
      )}
    </>
  );
}

