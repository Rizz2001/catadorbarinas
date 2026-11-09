import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';
import { useBcvStore } from '@/store/useBcvStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';

interface BannerPreviewProps {
  banner: Partial<Banner>;
}

export function BannerPreview({ banner }: BannerPreviewProps) {
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const titulo =
    banner.titulo || 'Licores Importados y Víveres al Precio Oficial en Barinas';
  const subtitulo =
    banner.subtitulo ||
    'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.';
  const botonTexto = banner.boton_texto || 'Ver Ofertas del Día';

  const hasPromo = Boolean(
    banner.promo_titulo &&
      banner.promo_titulo.trim() !== '' &&
      banner.promo_titulo.trim() !== '0'
  );
  const promoTitulo = banner.promo_titulo || '';
  const promoPrecio =
    banner.promo_precio !== undefined && banner.promo_precio !== null
      ? Number(banner.promo_precio)
      : null;
  const promoAhorro =
    banner.promo_ahorro && banner.promo_ahorro !== '0' ? banner.promo_ahorro : '';

  return (
    <div className="relative overflow-hidden rounded-xl bg-catador-blue p-6 md:p-8 text-white border border-blue-950">
      {banner.imagen_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${banner.imagen_url})` }}
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-md space-y-3 text-left flex-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {titulo}
          </h2>
          <p className="text-xs text-blue-100/90 max-w-sm line-clamp-2 leading-relaxed">
            {subtitulo}
          </p>
          <div className="pt-1 flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-catador-amber px-4 py-2 text-xs font-black text-white">
              {botonTexto} <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-black text-catador-blue">
              Catálogo Completo
            </span>
          </div>
        </div>

        {hasPromo && (
          <div className="relative shrink-0 flex flex-col items-start justify-center rounded-xl bg-blue-950/90 border border-blue-800 p-4 min-w-[180px] space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              {promoTitulo}
            </span>
            {promoPrecio !== null && promoPrecio > 0 && (
              <div className="tabular-nums">
                <p className="text-xl font-black text-white">${promoPrecio.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-blue-200">
                  {formatVes(convertUsdToVes(promoPrecio, bcvRate))}
                </p>
              </div>
            )}
            {promoAhorro && <span className="text-[10px] text-blue-100">{promoAhorro}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
