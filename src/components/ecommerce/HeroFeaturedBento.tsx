'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { getDefaultPurchaseMode, getEffectivePriceUsd } from '@/lib/inventory';
import { cn } from '@/lib/utils';

interface HeroFeaturedBentoProps {
  slides: Product[];
  activeIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  bcvRate: number;
  cmsLogo: string;
  onPauseChange: (paused: boolean) => void;
}

export function HeroFeaturedBento({
  slides,
  activeIndex,
  onPrevSlide,
  onNextSlide,
  bcvRate,
  cmsLogo,
  onPauseChange,
}: HeroFeaturedBentoProps) {
  const currentSlide = slides[activeIndex] || slides[0];
  if (!currentSlide) return null;

  const rawImg = currentSlide.images?.[0];
  const isNoImg = !rawImg || rawImg === '/logo-catador.svg' || rawImg.includes('logo');
  const slideImg = isNoImg ? cmsLogo : rawImg;
  const slidePriceUsd = getEffectivePriceUsd(currentSlide, getDefaultPurchaseMode(currentSlide));

  return (
    <div
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => onPauseChange(false)}
      className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:border-catador-blue transition-colors flex flex-col justify-between min-h-[146px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-extrabold text-catador-blue uppercase tracking-wide block">
            Edición Destacada
          </span>
          <Link
            href={`/producto/${currentSlide.id}`}
            className="text-sm font-black text-slate-900 hover:text-catador-blue line-clamp-1 mt-0.5 block"
          >
            {currentSlide.name}
          </Link>
        </div>
        <Link
          href={`/producto/${currentSlide.id}`}
          aria-label={`Ver ${currentSlide.name}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-catador-blue text-white hover:bg-catador-blue-dark transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="relative h-12 w-12 shrink-0 rounded-lg bg-[#F4F6F9] border border-slate-200/70 overflow-hidden p-1">
          <Image
            src={slideImg}
            alt={currentSlide.name}
            fill
            sizes="48px"
            className={cn('object-contain mix-blend-multiply', isNoImg && 'p-1.5 opacity-80')}
          />
        </div>

        <div className="min-w-0 flex-1 tabular-nums">
          <p className="text-sm font-black text-slate-900 leading-none">
            {formatUsd(slidePriceUsd)}
          </p>
          <p className="text-xs font-bold text-slate-600 mt-1 truncate">
            {formatVes(convertUsdToVes(slidePriceUsd, bcvRate))}
          </p>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onPrevSlide}
              aria-label="Destacado anterior"
              className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-catador-blue cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onNextSlide}
              aria-label="Siguiente destacado"
              className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-catador-blue cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

