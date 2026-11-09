'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { Banner, Product, QuickCategory } from '@/types';
import { getBanners, getQuickCategories } from '@/services/cms.service';
import { useBcvStore } from '@/store/useBcvStore';
import { useCartStore } from '@/store/useCartStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { getDefaultPurchaseMode, getMaxAllowedQuantity } from '@/lib/inventory';
import { QuickCategoriesStrip } from './QuickCategoriesStrip';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  initialBanner?: Banner | null;
  initialQuickCategories?: QuickCategory[];
  starProduct?: Product;
  heroProducts?: Product[];
}

export function HeroBanner({
  initialBanner,
  initialQuickCategories,
  starProduct,
  heroProducts = [],
}: HeroBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(initialBanner || null);
  const [quickCategories, setQuickCategories] = useState<QuickCategory[]>(
    initialQuickCategories || []
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const cmsLogo = storeConfig?.logo_url || '/logo-catador.svg';

  const slides = React.useMemo(() => {
    if (heroProducts.length > 0) return heroProducts.slice(0, 5);
    return starProduct ? [starProduct] : [];
  }, [heroProducts, starProduct]);

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

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const titulo =
    banner?.titulo || 'Licores Importados y Víveres al Precio Oficial en Barinas';
  const subtitulo =
    banner?.subtitulo ||
    'Inventario real garantizado en nuestra sede (C.C. Ciudad Catador). Compra por unidad o por caja cerrada en Dólares ($ USD) y Bolívares (Bs. BCV).';
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

  const isBgPhotoValid = Boolean(
    banner?.imagen_url &&
      !banner.imagen_url.toLowerCase().includes('logo') &&
      !banner.imagen_url.toLowerCase().includes('catador')
  );

  const currentSlide = slides[activeIndex] || slides[0];
  const rawSlideImg = currentSlide?.images?.[0];
  const isSlideNoImg =
    !rawSlideImg || rawSlideImg === '/logo-catador.svg' || rawSlideImg.includes('logo');
  const slideImage = isSlideNoImg ? cmsLogo : rawSlideImg;

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const mode = getDefaultPurchaseMode(product);
    const maxAllowed = getMaxAllowedQuantity(product, mode, cartItems);
    if (!product.allowBackorder && maxAllowed <= 0) return;
    const res = addItem(product, 1, mode, false);
    if (res.added) {
      setJustAddedId(product.id);
      setTimeout(() => setJustAddedId(null), 1100);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-catador-blue p-5 sm:p-8 lg:p-10 text-white border border-blue-950">
        {/* Si hay foto real de góndola/producto en CMS (sin texto de logo), se muestra nítida en el extremo derecho sin ensuciar el titular */}
        {isBgPhotoValid && (
          <>
            <div
              className="hidden lg:block absolute inset-y-0 right-0 w-1/2 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner?.imagen_url})` }}
            />
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-catador-blue via-catador-blue/95 to-catador-blue/40" />
          </>
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          {/* Columna Editorial Izquierda */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 text-left min-w-0">
            {banner?.badge_texto && banner.badge_texto.trim() !== '' && (
              <span className="inline-block text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-amber-300">
                {banner.badge_texto.replace(/^[★✨\s]+/, '')}
              </span>
            )}

            <h1 className="text-[clamp(1.45rem,3.8vw,2.65rem)] font-black tracking-[-0.03em] leading-[1.08] text-white max-w-2xl">
              {titulo}
            </h1>

            <p className="text-[13px] sm:text-base text-blue-100 max-w-xl leading-relaxed">
              {subtitulo}
            </p>

            {hasPromo && (
              <div className="inline-flex flex-wrap items-center gap-3 rounded-lg bg-blue-950/90 border border-blue-800 px-3.5 py-2 text-[13px]">
                <span className="font-extrabold text-amber-300">{banner?.promo_titulo}</span>
                {promoPrecio !== null && promoPrecio > 0 && (
                  <span className="font-black text-white tabular-nums">
                    ${promoPrecio.toFixed(2)} ({formatVes(convertUsdToVes(promoPrecio, bcvRate))})
                  </span>
                )}
                {banner?.promo_ahorro && banner.promo_ahorro !== '0' && (
                  <span className="text-blue-200 font-semibold">{banner.promo_ahorro}</span>
                )}
              </div>
            )}

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href={botonUrl}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-catador-amber hover:bg-catador-amber-dark min-h-[44px] px-5 sm:px-6 py-2.5 text-[13px] sm:text-sm font-black text-white transition-colors"
              >
                <span>{botonTexto}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 min-h-[44px] px-5 py-2.5 text-[13px] sm:text-sm font-black text-white transition-colors"
              >
                <span>Catálogo Completo</span>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Carrusel de 3 a 5 Ofertas / Destacados con Botella Grande */}
          <div
            className="lg:col-span-5 flex justify-center lg:justify-end min-w-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {currentSlide ? (
              <div className="w-full lg:max-w-[400px] rounded-xl bg-white text-slate-900 p-4 sm:p-5 border border-slate-200 shadow-lg min-w-0">
                {/* Cabecera del Carrusel: Badges de Oferta/Stock + Controles */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {currentSlide.discountPercentage && currentSlide.discountPercentage > 0 ? (
                      <span className="inline-block rounded bg-catador-discount px-2 py-0.5 text-xs font-black text-white tabular-nums shrink-0">
                        -{currentSlide.discountPercentage}% OFF
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-blue-50 text-catador-blue border border-blue-200 px-2 py-0.5 text-xs font-extrabold shrink-0">
                        Destacado
                      </span>
                    )}

                    {currentSlide.stockQuantity === 1 ? (
                      <span className="inline-block rounded bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-xs font-black truncate">
                        ¡Última unidad!
                      </span>
                    ) : currentSlide.stockQuantity > 1 && currentSlide.stockQuantity <= 5 ? (
                      <span className="inline-block rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-extrabold truncate tabular-nums">
                        ¡Últimas {currentSlide.stockQuantity} und!
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 truncate tabular-nums">
                        {currentSlide.stockQuantity} disp.
                      </span>
                    )}
                  </div>

                  {slides.length > 1 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
                        }
                        aria-label="Producto anterior"
                        className="h-7 w-7 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-500 tabular-nums px-1">
                        {activeIndex + 1}/{slides.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
                        aria-label="Siguiente producto"
                        className="h-7 w-7 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Escenario Fotográfico Blanco con Botella Grande */}
                <Link
                  href={`/producto/${currentSlide.id}${currentSlide.codGrupo ? `?grupo=${currentSlide.codGrupo}` : ''}`}
                  className="relative h-44 sm:h-52 w-full my-2.5 rounded-lg bg-white flex items-center justify-center overflow-hidden p-2 group block"
                >
                  <Image
                    src={slideImage}
                    alt={currentSlide.name}
                    fill
                    sizes="(max-width: 1024px) 280px, 360px"
                    className={cn(
                      'object-contain transition-transform duration-200 group-hover:scale-105',
                      isSlideNoImg ? 'p-6 opacity-80' : 'p-1'
                    )}
                  />
                </Link>

                {/* Pie de Ficha: Nombre + Precio Bimonetario + Botón Naranja '+ Agregar' */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                      {currentSlide.brand || currentSlide.category}
                    </span>
                    <Link
                      href={`/producto/${currentSlide.id}${currentSlide.codGrupo ? `?grupo=${currentSlide.codGrupo}` : ''}`}
                      className="text-sm sm:text-[15px] font-extrabold text-slate-900 hover:text-catador-blue line-clamp-1 mt-0.5 block transition-colors"
                    >
                      {currentSlide.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <div className="tabular-nums min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900 leading-none">
                          ${currentSlide.priceUsd.toFixed(2)}
                        </span>
                        {currentSlide.originalPriceUsd &&
                          currentSlide.originalPriceUsd > currentSlide.priceUsd && (
                            <span className="text-xs font-bold text-slate-400 line-through">
                              ${currentSlide.originalPriceUsd.toFixed(2)}
                            </span>
                          )}
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        {formatVes(convertUsdToVes(currentSlide.priceUsd, bcvRate))}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, currentSlide)}
                      className={cn(
                        'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 min-h-[42px] text-[13px] font-black text-white transition-colors cursor-pointer shrink-0',
                        justAddedId === currentSlide.id
                          ? 'bg-emerald-600'
                          : 'bg-catador-amber hover:bg-catador-amber-dark'
                      )}
                    >
                      {justAddedId === currentSlide.id ? (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Agregado</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 stroke-[3]" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <QuickCategoriesStrip categories={quickCategories} />
    </div>
  );
}
