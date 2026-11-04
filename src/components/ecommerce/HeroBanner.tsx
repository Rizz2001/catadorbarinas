'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Banner, Product, QuickCategory } from '@/types';
import { getBanners, getQuickCategories } from '@/services/cms.service';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { QuickCategoriesStrip } from './QuickCategoriesStrip';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  initialBanner?: Banner | null;
  initialQuickCategories?: QuickCategory[];
  starProduct?: Product;
}

export function HeroBanner({
  initialBanner,
  initialQuickCategories,
  starProduct,
}: HeroBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(initialBanner || null);
  const [quickCategories, setQuickCategories] = useState<QuickCategory[]>(
    initialQuickCategories || []
  );
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const cmsLogo = storeConfig?.logo_url || '/logo-catador.svg';

  useEffect(() => {
    let mounted = true;
    async function loadCMSData() {
      try {
        const [bannersList, categoriesList] = await Promise.all([
          getBanners(true),
          getQuickCategories(true),
        ]);
        if (mounted) {
          const hero = bannersList.find((b) => b.tipo === 'hero');
          if (hero) setBanner(hero);
          if (categoriesList.length > 0) setQuickCategories(categoriesList);
        }
      } catch {
        // Silencioso
      }
    }
    loadCMSData();
    return () => {
      mounted = false;
    };
  }, []);

  const titulo =
    banner?.titulo || 'Licores Importados y Víveres al Precio Oficial en Barinas';
  const subtitulo =
    banner?.subtitulo ||
    'Inventario real garantizado en nuestra sede (Av. 23 de Enero). Compra por unidad o por caja cerrada en Dólares ($ USD) y Bolívares (Bs. BCV).';
  const botonTexto = banner?.boton_texto || 'Ver Ofertas del Día';
  const botonUrl = banner?.boton_url || '/catalogo';

  const hasPromo = Boolean(
    banner?.promo_titulo &&
      banner.promo_titulo.trim() !== '' &&
      banner.promo_titulo.trim() !== '0'
  );
  const promoPrecio =
    banner?.promo_precio !== undefined && banner?.promo_precio !== null
      ? Number(banner.promo_precio)
      : null;

  const rawStarImg = starProduct?.images?.[0];
  const isStarNoImg =
    !rawStarImg || rawStarImg === '/logo-catador.svg' || rawStarImg.includes('logo');
  const starImage = isStarNoImg ? cmsLogo : rawStarImg;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-catador-blue p-4 sm:p-8 lg:p-10 text-white border border-blue-950">
        {banner?.imagen_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${banner.imagen_url})` }}
          />
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
          {/* Columna Editorial Izquierda */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5 text-left min-w-0">
            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-950/75 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-blue-100 border border-blue-800/80 max-w-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Sede Barinas • Av. 23 de Enero</span>
              <span className="text-amber-300 font-black tabular-nums">
                BCV Bs. {bcvRate.toFixed(2)}
              </span>
            </div>

            <h1 className="text-[clamp(1.35rem,4vw,2.75rem)] font-black tracking-[-0.03em] leading-[1.1] text-white max-w-2xl">
              {titulo}
            </h1>

            <p className="text-xs sm:text-base text-blue-100/95 max-w-xl leading-relaxed line-clamp-3 sm:line-clamp-none">
              {subtitulo}
            </p>

            <div className="pt-1 grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={botonUrl}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-catador-amber hover:bg-catador-amber-dark min-h-[44px] px-3 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-white transition-colors text-center"
              >
                <span className="truncate">{botonTexto}</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 min-h-[44px] px-3 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-catador-blue transition-colors text-center"
              >
                <span className="truncate">Catálogo</span>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Pieza Real del Inventario (Compacta en Móvil, Editorial en Desktop) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end min-w-0">
            {hasPromo ? (
              <div className="w-full lg:max-w-sm rounded-2xl bg-blue-950/80 border border-blue-800 p-4 sm:p-6 space-y-2">
                <p className="text-xs font-bold text-amber-300">{banner?.promo_titulo}</p>
                {promoPrecio !== null && promoPrecio > 0 && (
                  <div className="tabular-nums">
                    <p className="text-2xl sm:text-3xl font-black text-white">${promoPrecio.toFixed(2)}</p>
                    <p className="text-xs font-bold text-blue-200 mt-0.5">
                      {formatVes(convertUsdToVes(promoPrecio, bcvRate))}
                    </p>
                  </div>
                )}
                {banner?.promo_ahorro && banner.promo_ahorro !== '0' && (
                  <p className="text-xs text-blue-100">{banner.promo_ahorro}</p>
                )}
              </div>
            ) : starProduct ? (
              <Link
                href={`/producto/${starProduct.id}${starProduct.codGrupo ? `?grupo=${starProduct.codGrupo}` : ''}`}
                className="group w-full lg:max-w-sm rounded-2xl bg-white text-slate-900 p-3 sm:p-5 border border-slate-200 transition-transform duration-200 hover:-translate-y-0.5 min-w-0"
              >
                {/* Vista Compacta Horizontal en Móvil/Tablet (< 1024px) */}
                <div className="flex items-center gap-3 lg:hidden min-w-0">
                  <div className="relative h-16 w-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1.5">
                    <Image
                      src={starImage}
                      alt={starProduct.name}
                      fill
                      sizes="64px"
                      className={cn(
                        'object-contain',
                        isStarNoImg ? 'p-2 opacity-80' : ''
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded tabular-nums">
                        ★ Destacado • {starProduct.stockQuantity} disp.
                      </span>
                    </div>
                    <h2 className="text-xs font-extrabold text-slate-900 truncate mt-0.5">
                      {starProduct.name}
                    </h2>
                    <div className="flex items-baseline gap-2 mt-0.5 tabular-nums">
                      <span className="text-sm font-black text-catador-blue">
                        ${starProduct.priceUsd.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 truncate">
                        {formatVes(convertUsdToVes(starProduct.priceUsd, bcvRate))}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-catador-blue shrink-0" />
                </div>

                {/* Vista Editorial Completa en Escritorio (>= 1024px) */}
                <div className="hidden lg:block">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {starProduct.brand || 'Selección Gran Catador'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                      {starProduct.stockQuantity} und en stock
                    </span>
                  </div>

                  <div className="relative h-40 w-full my-3 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden p-3">
                    <Image
                      src={starImage}
                      alt={starProduct.name}
                      fill
                      sizes="340px"
                      className={cn(
                        'object-contain transition-transform duration-200 group-hover:scale-105',
                        isStarNoImg ? 'p-6 opacity-80' : ''
                      )}
                    />
                  </div>

                  <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-catador-blue transition-colors">
                        {starProduct.name}
                      </h2>
                      <span className="text-[11px] font-bold text-catador-blue inline-flex items-center gap-1 mt-0.5">
                        Comprar por unidad o caja <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-lg font-black text-slate-900 leading-none">
                        ${starProduct.priceUsd.toFixed(2)}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-1">
                        {formatVes(convertUsdToVes(starProduct.priceUsd, bcvRate))}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <QuickCategoriesStrip categories={quickCategories} />
    </div>
  );
}
