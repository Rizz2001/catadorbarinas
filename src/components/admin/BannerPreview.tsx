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
  const titulo = banner.titulo || 'Los Mejores Licores y Víveres Directo a tu Puerta';
  const subtitulo = banner.subtitulo || 'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.';
  const badge = banner.badge_texto || '★ DISTRIBUIDORA & BODEGÓN OFICIAL';
  const botonTexto = banner.boton_texto || 'Ver Ofertas del Día';

  // Solo se muestra la caja si hay un título promocional activo y válido
  const hasPromo = Boolean(
    banner.promo_titulo &&
    banner.promo_titulo.trim() !== '' &&
    banner.promo_titulo.trim() !== '0'
  );
  const promoTitulo = banner.promo_titulo || '';
  const promoPrecio = banner.promo_precio !== undefined && banner.promo_precio !== null
    ? Number(banner.promo_precio)
    : null;
  const promoBadge = banner.promo_badge && banner.promo_badge !== '0' ? banner.promo_badge : '';
  const promoAhorro = banner.promo_ahorro && banner.promo_ahorro !== '0' ? banner.promo_ahorro : '';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-catador-blue via-catador-blue-light to-blue-900 p-6 md:p-8 text-white shadow-md">
      {banner.imagen_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${banner.imagen_url})` }}
        />
      )}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-md space-y-2.5 text-center md:text-left flex-1">
          <span className="inline-block rounded-full bg-catador-amber px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
            {badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {titulo}
          </h2>
          <p className="text-xs text-blue-100 max-w-sm line-clamp-2">
            {subtitulo}
          </p>
          <div className="pt-1 flex items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-catador-blue shadow-sm">
              {botonTexto} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Destacado de Oferta en Banner (Opcional según CMS) */}
        {hasPromo && (
          <div className="relative shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center min-w-[170px]">
            <span className="text-[10px] font-bold text-catador-amber uppercase tracking-wider">
              {promoTitulo}
            </span>
            {promoPrecio !== null && promoPrecio > 0 && (
              <div className="mt-0.5 text-center">
                <p className="text-xl font-black text-white">${promoPrecio.toFixed(2)}</p>
                <p className="text-[10px] font-extrabold text-amber-300">
                  Bs. {formatVes(convertUsdToVes(promoPrecio, bcvRate))}
                </p>
              </div>
            )}
            {promoAhorro && <span className="text-[10px] text-blue-200">{promoAhorro}</span>}
            {promoBadge && (
              <span className="mt-2 rounded-lg bg-catador-amber px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                {promoBadge}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
