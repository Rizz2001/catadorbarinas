'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wine, ShoppingBasket, Sandwich, Cookie, CupSoda, Sparkles } from 'lucide-react';
import { Banner, Product, QuickCategory } from '@/types';
import { getBanners, getQuickCategories } from '@/services/cms.service';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  initialBanner?: Banner | null;
  initialQuickCategories?: QuickCategory[];
  starProduct?: Product;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wine,
  CupSoda,
  ShoppingBasket,
  Cookie,
  Sandwich,
  Sparkles,
};

const DEFAULT_ACCENTS = [
  { accentColor: 'group-hover:bg-amber-500 group-hover:text-white', badgeBg: 'bg-amber-100/70 text-amber-800' },
  { accentColor: 'group-hover:bg-blue-600 group-hover:text-white', badgeBg: 'bg-blue-100/70 text-blue-800' },
  { accentColor: 'group-hover:bg-emerald-600 group-hover:text-white', badgeBg: 'bg-emerald-100/70 text-emerald-800' },
  { accentColor: 'group-hover:bg-cyan-600 group-hover:text-white', badgeBg: 'bg-cyan-100/70 text-cyan-800' },
  { accentColor: 'group-hover:bg-rose-500 group-hover:text-white', badgeBg: 'bg-rose-100/70 text-rose-800' },
  { accentColor: 'group-hover:bg-purple-600 group-hover:text-white', badgeBg: 'bg-purple-100/70 text-purple-800' },
];

export function HeroBanner({ initialBanner, initialQuickCategories, starProduct }: HeroBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(initialBanner || null);
  const [quickCategories, setQuickCategories] = useState<QuickCategory[]>(initialQuickCategories || []);
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



  const titulo = banner?.titulo || 'Los Mejores Licores y Víveres Directo a tu Puerta';
  const subtitulo =
    banner?.subtitulo ||
    'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.';
  const badge = banner?.badge_texto || '★ DISTRIBUIDORA & BODEGÓN OFICIAL';
  const botonTexto = banner?.boton_texto || 'Ver Ofertas del Día';
  const botonUrl = banner?.boton_url || '/catalogo';

  // Verificación de promo activa según configuración CMS
  const hasPromo = Boolean(
    banner?.promo_titulo &&
      banner.promo_titulo.trim() !== '' &&
      banner.promo_titulo.trim() !== '0'
  );
  const promoTitulo = banner?.promo_titulo || '';
  const promoPrecio =
    banner?.promo_precio !== undefined && banner?.promo_precio !== null
      ? Number(banner.promo_precio)
      : null;
  const promoAhorro = banner?.promo_ahorro && banner.promo_ahorro !== '0' ? banner.promo_ahorro : '';
  const promoBadge = banner?.promo_badge && banner.promo_badge !== '0' ? banner.promo_badge : '';

  // Datos del producto estrella real desde FoxData
  const rawStarImg = starProduct?.images?.[0];
  const isStarNoImg =
    !rawStarImg ||
    rawStarImg === '/logo-catador.svg' ||
    rawStarImg.includes('logo');
  const starImage = isStarNoImg ? cmsLogo : rawStarImg;

  return (
    <div className="space-y-6">
      {/* Banner Principal con Degradado Azul Rey y Showcase Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-catador-blue via-[#002e9e] to-catador-blue-dark p-6 sm:p-8 md:p-10 text-white shadow-xl border border-blue-800/40">
        {/* Imagen de fondo desde CMS si está configurada */}
        {banner?.imagen_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{ backgroundImage: `url(${banner.imagen_url})` }}
          />
        )}

        {/* Adornos visuales de luz */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-catador-amber/20 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Columna Izquierda: Información Principal */}
          <div className="max-w-xl space-y-4 text-center lg:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-catador-amber px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {badge}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-blue-100 border border-white/15">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Despachos activos Barinas
              </span>
            </div>

            <h1 className="text-[clamp(1.5rem,4vw,3rem)] font-black tracking-tight leading-[1.12]">
              {titulo}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {subtitulo}
            </p>

            <div className="pt-2 flex flex-col xs:flex-row flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
              <Link
                href={botonUrl}
                className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white min-h-[44px] px-5 sm:px-6 py-3 text-xs sm:text-sm font-black text-catador-blue shadow-lg hover:bg-slate-100 hover:shadow-xl transition-all"
              >
                {botonTexto} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/catalogo"
                className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 min-h-[44px] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition-all"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Promo CMS o Showcase Real desde FoxData */}
          {hasPromo ? (
            <div className="relative shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-6 text-center w-full sm:w-auto min-w-[220px] max-w-xs shadow-2xl">
              <span className="text-xs font-extrabold text-catador-amber uppercase tracking-wider">
                {promoTitulo}
              </span>
              {promoPrecio !== null && promoPrecio > 0 && (
                <div className="mt-2 text-center">
                  <p className="text-3xl font-black text-white">${promoPrecio.toFixed(2)}</p>
                  <p className="text-xs font-extrabold text-amber-300">
                    {formatVes(convertUsdToVes(promoPrecio, bcvRate))}
                  </p>
                </div>
              )}
              {promoAhorro && (
                <span className="mt-1 text-xs text-blue-100 font-medium">{promoAhorro}</span>
              )}
              {promoBadge && (
                <span className="mt-3 rounded-lg bg-catador-amber px-3.5 py-1 text-xs font-extrabold text-white shadow-xs">
                  {promoBadge}
                </span>
              )}
            </div>
          ) : starProduct ? (
            <div className="relative shrink-0 w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-300 uppercase tracking-wider truncate">
                  ★ DESTACADO EN INVENTARIO
                </span>
                <span className="text-[10px] font-bold bg-catador-amber text-white px-2 py-0.5 rounded-full shrink-0">
                  Stock Disponible
                </span>
              </div>

              <div className="relative h-40 sm:h-44 w-full rounded-xl overflow-hidden bg-slate-900/40 flex items-center justify-center">
                <Image
                  src={starImage}
                  alt={starProduct.name}
                  fill
                  sizes="(max-width: 640px) 90vw, 360px"
                  className={cn(
                    'object-contain',
                    isStarNoImg ? 'p-8 opacity-80' : 'object-cover'
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
                  <div className="max-w-[62%] min-w-0">
                    <p className="text-xs font-black text-white leading-tight line-clamp-1">
                      {starProduct.name}
                    </p>
                    <p className="text-[10px] text-amber-300 font-bold truncate">
                      {starProduct.brand || 'Gran Catador'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-white leading-tight">
                      ${starProduct.priceUsd.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-extrabold text-amber-300 font-mono">
                      {formatVes(convertUsdToVes(starProduct.priceUsd, bcvRate))}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={`/producto/${starProduct.id}${starProduct.codGrupo ? `?grupo=${starProduct.codGrupo}` : ''}`}
                className="w-full min-h-[40px] flex items-center justify-center py-2 text-xs font-extrabold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Ver detalle y comprar →
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tira Circular de Categorías Rápidas Oficiales Editables en CMS */}
      {quickCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickCategories.map((cat, idx) => {
            const Icon = ICON_MAP[cat.icono] || Wine;
            const style = DEFAULT_ACCENTS[idx % DEFAULT_ACCENTS.length];
            return (
              <Link
                key={cat.id || cat.nombre}
                href={cat.url}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs hover:border-catador-blue/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-catador-blue transition-colors duration-200 ${style.accentColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-extrabold text-slate-800 group-hover:text-catador-blue transition-colors">
                    {cat.nombre}
                  </span>
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${style.badgeBg}`}
                  >
                    {cat.descripcion}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
