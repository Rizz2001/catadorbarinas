'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Banner, BentoCardNode, CategoryPillNode, Product } from '@/types';
import { getBanners, getQuickCategories } from '@/services/cms.service';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { convertUsdToVes, DEFAULT_BCV_RATE, formatVes } from '@/lib/currency';
import { resolveHeroDisplay } from '@/lib/hero-config';
import { QuickCategoriesStrip } from './QuickCategoriesStrip';
import { HeroBentoCards } from './HeroBentoCards';

interface HeroBannerProps {
  initialBanner?: Banner | null;
  initialQuickCategories?: CategoryPillNode[];
  bentoCards: BentoCardNode[];
  starProduct?: Product;
  heroProducts?: Product[];
}

export function HeroBanner({
  initialBanner,
  initialQuickCategories = [],
  bentoCards,
  starProduct,
  heroProducts = [],
}: HeroBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(initialBanner || null);
  const [quickCategories, setQuickCategories] = useState<CategoryPillNode[]>(
    initialQuickCategories
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const storeConfig = useStoreConfigStore((state) => state.config);
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
          getBanners(false),
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

  const hero = resolveHeroDisplay(banner);
  const isHeroVisible = banner?.activo !== false;

  return (
    <div className="space-y-5 sm:space-y-7">
      <div>
        {isHeroVisible && (
          <div
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl px-4 py-6 sm:px-10 sm:pt-11 sm:pb-20 text-white shadow-sm"
            style={{ backgroundColor: hero.heroBgColor }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
              style={{ backgroundImage: `url(${hero.bgImageUrl})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, ${hero.heroBgColor}F2 0%, ${hero.heroBgColor}D9 50%, ${hero.heroBgColor}F2 100%)`,
              }}
            />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[520px] rounded-full bg-[#EB9C53]/15 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-3 sm:space-y-3.5">
              <span className="inline-block rounded-full bg-white/10 border border-[#EB9C53]/45 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#EB9C53]">
                {hero.badgeTexto}
              </span>

              <h1 className="font-serif text-[22px] sm:text-[clamp(1.85rem,4vw,3.1rem)] font-bold tracking-tight leading-[1.15] uppercase">
                <span className="block text-white">{hero.primaryTitle}</span>
                {hero.highlightedTitle && (
                  <span className="block text-[#EB9C53] mt-1">{hero.highlightedTitle}</span>
                )}
              </h1>

              <p className="hidden sm:block text-base text-slate-300 max-w-2xl leading-relaxed">
                {hero.subtitulo}
              </p>

              {hero.hasPromo && (
                <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-xs sm:text-[13px]">
                  <span className="font-extrabold text-[#EB9C53]">{hero.promoTitulo}</span>
                  {hero.promoPrecio !== null && hero.promoPrecio > 0 && (
                    <span className="font-black text-white tabular-nums">
                      ${hero.promoPrecio.toFixed(2)} (
                      {formatVes(convertUsdToVes(hero.promoPrecio, bcvRate))})
                    </span>
                  )}
                  {hero.promoAhorro && (
                    <span className="hidden sm:inline text-xs font-bold text-[#FEF3C7]">
                      · {hero.promoAhorro}
                    </span>
                  )}
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                <Link
                  href={hero.botonUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D99B38] hover:bg-[#C88A28] active:scale-[0.98] text-white min-h-[42px] px-5 sm:px-6 py-2 text-[13px] sm:text-sm font-black transition-all shadow-xs"
                >
                  <span>{hero.botonTexto}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
                </Link>
                {hero.secondaryBtnText && (
                  <Link
                    href={hero.secondaryBtnUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/25 min-h-[42px] px-4 sm:px-5 py-2 text-[13px] sm:text-sm font-extrabold text-white transition-all"
                  >
                    <span>{hero.secondaryBtnText}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <HeroBentoCards
          cards={storeConfig?.bento_cards && storeConfig.bento_cards.length > 0 ? storeConfig.bento_cards : bentoCards}
          slides={slides}
          activeIndex={activeIndex}
          onPrevSlide={() =>
            setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
          }
          onNextSlide={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
          bcvRate={bcvRate}
          cmsLogo={cmsLogo}
          onPauseChange={setIsPaused}
          withHeroOverlap={isHeroVisible}
        />
      </div>

      <QuickCategoriesStrip categories={quickCategories} />
    </div>
  );
}
