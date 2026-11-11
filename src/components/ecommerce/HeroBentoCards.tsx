'use client';

import Link from 'next/link';
import { ChevronRight, MapPin, Package } from 'lucide-react';
import { Product } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { HeroFeaturedBento } from './HeroFeaturedBento';

interface HeroBentoCardsProps {
  slides: Product[];
  activeIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  bcvRate: number;
  cmsLogo: string;
  onPauseChange: (paused: boolean) => void;
  withHeroOverlap?: boolean;
}

export function HeroBentoCards({
  slides,
  activeIndex,
  onPrevSlide,
  onNextSlide,
  bcvRate,
  cmsLogo,
  onPauseChange,
  withHeroOverlap = true,
}: HeroBentoCardsProps) {
  const hydrated = useIsHydrated();
  const timeLeft = useCountdown(
    new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  );
  const maxDiscountPct = slides.reduce(
    (max, item) => Math.max(max, Number(item.discountPercentage || 0)),
    0
  );

  return (
    <div
      className={
        withHeroOverlap
          ? 'relative z-20 mt-3 sm:-mt-8 lg:-mt-10 px-0 sm:px-5'
          : 'relative z-20 px-0'
      }
    >
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-3.5 md:pb-0">
        {/* Bento 1: Ofertas Especiales con Countdown */}
        <Link
          href="/#ofertas"
          className="w-[70vw] min-w-[235px] max-w-[265px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none group rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-3.5 sm:p-4 shadow-sm hover:border-[#0F172A] transition-colors flex flex-col justify-between min-h-[124px] sm:min-h-[146px]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                Ofertas
                <span className="block">Especiales</span>
              </h2>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-[#D99B38] text-white px-2.5 py-0.5 text-[11px] sm:text-xs font-black tabular-nums">
              {maxDiscountPct > 0 ? `-${maxDiscountPct}%` : 'HOY'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-1 tabular-nums text-xs sm:text-[13px] font-black">
              <span className="rounded-lg bg-slate-100 border border-slate-200 text-slate-900 px-2 py-1">
                {hydrated ? String(timeLeft.hours).padStart(2, '0') : '12'}
              </span>
              <span className="text-slate-400">:</span>
              <span className="rounded-lg bg-slate-100 border border-slate-200 text-slate-900 px-2 py-1">
                {hydrated ? String(timeLeft.minutes).padStart(2, '0') : '00'}
              </span>
              <span className="text-slate-400">:</span>
              <span className="rounded-lg bg-slate-100 border border-slate-200 text-slate-900 px-2 py-1">
                {hydrated ? String(timeLeft.seconds).padStart(2, '0') : '00'}
              </span>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white group-hover:bg-[#001754] transition-all">
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Bento 2: Delivery GPS Barinas */}
        <div className="w-[70vw] min-w-[235px] max-w-[265px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between min-h-[124px] sm:min-h-[146px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                Delivery GPS
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Barinas
              </p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-[#F7F8FA] border border-slate-200/70 flex items-center justify-center text-[#0F172A]">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#0F172A]" />
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/carrito#cotizar-delivery"
              className="w-full min-h-[40px] inline-flex items-center justify-center rounded-full bg-[#0F172A] hover:bg-[#001754] active:scale-[0.98] text-xs sm:text-[13px] font-extrabold text-white transition-all"
            >
              Cotizar delivery
            </Link>
          </div>
        </div>

        {/* Bento 3: Compra por Caja Cerrada */}
        <Link
          href="/catalogo?caja=1"
          className="w-[70vw] min-w-[235px] max-w-[265px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none group rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-3.5 sm:p-4 shadow-sm hover:border-[#0F172A] transition-colors flex flex-col justify-between min-h-[124px] sm:min-h-[146px]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                Compra por
                <span className="block">Caja Cerrada</span>
              </h2>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white group-hover:bg-[#001754] transition-all">
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Precios al mayor
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 px-2.5 py-0.5 text-xs font-extrabold text-[#8B3E03]">
              <Package className="h-3.5 w-3.5" />
              Mayor
            </span>
          </div>
        </Link>

        <HeroFeaturedBento
          slides={slides}
          activeIndex={activeIndex}
          onPrevSlide={onPrevSlide}
          onNextSlide={onNextSlide}
          bcvRate={bcvRate}
          cmsLogo={cmsLogo}
          onPauseChange={onPauseChange}
        />
      </div>
    </div>
  );
}
