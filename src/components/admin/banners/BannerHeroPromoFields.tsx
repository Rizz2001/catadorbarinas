'use client';

import { Banner } from '@/types';

interface BannerHeroPromoFieldsProps {
  currentBanner: Partial<Banner>;
  onUpdate: (patch: Partial<Banner>) => void;
}

/**
 * Campos de la píldora promocional destacada dentro del Hero principal.
 */
export function BannerHeroPromoFields({
  currentBanner,
  onUpdate,
}: BannerHeroPromoFieldsProps) {
  return (
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
            onChange={(e) => onUpdate({ promo_titulo: e.target.value })}
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
              onUpdate({ promo_precio: parseFloat(e.target.value) || 0 })
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
            onChange={(e) => onUpdate({ promo_ahorro: e.target.value })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>
    </>
  );
}

