'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Wine, ShoppingBasket, Sandwich, Cookie, CupSoda } from 'lucide-react';
import { Banner } from '@/types';
import { getBanners } from '@/services/cms.service';
import { useBcvStore } from '@/store/useBcvStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';

interface HeroBannerProps {
  initialBanner?: Banner | null;
}

export function HeroBanner({ initialBanner }: HeroBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(initialBanner || null);
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);

  useEffect(() => {
    let mounted = true;
    async function loadBanner() {
      try {
        const list = await getBanners(true);
        const hero = list.find((b) => b.tipo === 'hero');
        if (hero && mounted) setBanner(hero);
      } catch (e) {
        console.error('Error cargando banner:', e);
      }
    }
    loadBanner();
    return () => {
      mounted = false;
    };
  }, []);

  const quickCategories = [
    { name: 'Licores', icon: Wine, href: '/catalogo/01' },
    { name: 'Cervezas', icon: CupSoda, href: '/catalogo/09' },
    { name: 'Víveres', icon: ShoppingBasket, href: '/catalogo/11' },
    { name: 'Refrescos', icon: CupSoda, href: '/catalogo/02' },
    { name: 'Snacks', icon: Cookie, href: '/catalogo/05' },
    { name: 'Lácteos & Jugos', icon: Sandwich, href: '/catalogo/14' },
  ];

  const titulo = banner?.titulo || 'Los Mejores Licores y Víveres Directo a tu Puerta';
  const subtitulo = banner?.subtitulo || 'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.';
  const badge = banner?.badge_texto || '★ DISTRIBUIDORA & BODEGÓN OFICIAL';
  const botonTexto = banner?.boton_texto || 'Ver Ofertas del Día';
  const botonUrl = banner?.boton_url || '/catalogo';

  // Solo se muestra la caja si hay un título promocional activo y válido
  const hasPromo = Boolean(
    banner?.promo_titulo &&
    banner.promo_titulo.trim() !== '' &&
    banner.promo_titulo.trim() !== '0'
  );
  const promoTitulo = banner?.promo_titulo || '';
  const promoPrecio = banner?.promo_precio !== undefined && banner?.promo_precio !== null
    ? Number(banner.promo_precio)
    : null;
  const promoAhorro = banner?.promo_ahorro && banner.promo_ahorro !== '0' ? banner.promo_ahorro : '';
  const promoBadge = banner?.promo_badge && banner.promo_badge !== '0' ? banner.promo_badge : '';

  return (
    <div className="space-y-6">
      {/* Banner Principal con Degradado Azul Rey */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-catador-blue via-catador-blue-light to-blue-900 p-6 md:p-10 text-white shadow-lg">
        {/* Imagen de fondo opcional */}
        {banner?.imagen_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{ backgroundImage: `url(${banner.imagen_url})` }}
          />
        )}
        {/* Adorno visual de fondo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-catador-amber/15 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center md:text-left flex-1">
            <span className="inline-block rounded-full bg-catador-amber px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              {badge}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {titulo}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
              {subtitulo}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                href={botonUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-catador-blue shadow-md hover:bg-slate-100 transition-colors"
              >
                {botonTexto} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          {/* Destacado de Oferta en Banner (Opcional según CMS) */}
          {hasPromo && (
            <div className="relative shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-center min-w-[200px]">
              <span className="text-[11px] font-bold text-catador-amber uppercase tracking-wider">
                {promoTitulo}
              </span>
              {promoPrecio !== null && promoPrecio > 0 && (
                <div className="mt-1 text-center">
                  <p className="text-2xl font-black text-white">${promoPrecio.toFixed(2)}</p>
                  <p className="text-[11px] font-extrabold text-amber-300">
                    Bs. {formatVes(convertUsdToVes(promoPrecio, bcvRate))}
                  </p>
                </div>
              )}
              {promoAhorro && <span className="text-[11px] text-blue-200">{promoAhorro}</span>}
              {promoBadge && (
                <span className="mt-3 rounded-lg bg-catador-amber px-3 py-1 text-[11px] font-extrabold text-white">
                  {promoBadge}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tira Circular de Categorías Rápidas */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {quickCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs hover:border-catador-blue hover:shadow-card transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-catador-blue group-hover:bg-catador-blue group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-catador-blue transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
