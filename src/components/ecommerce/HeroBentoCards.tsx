'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BentoCardNode, Product } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { DynamicLucideIcon } from '@/components/ui';
import { HeroFeaturedBento } from './HeroFeaturedBento';

interface HeroBentoCardsProps {
  cards: BentoCardNode[];
  slides: Product[];
  activeIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  bcvRate: number;
  cmsLogo: string;
  onPauseChange: (paused: boolean) => void;
  withHeroOverlap?: boolean;
}

const BENTO_CARD_CLASS =
  'w-[70vw] min-w-[235px] max-w-[265px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between min-h-[124px] sm:min-h-[146px]';

export function HeroBentoCards({
  cards,
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
  const countdownCard = cards.find((c) => c.kind === 'offers_countdown');
  const timeLeft = useCountdown(countdownCard?.endsAt || '');
  const maxDiscountPct = slides.reduce(
    (max, item) => Math.max(max, Number(item.discountPercentage || 0)),
    0
  );

  const visibleCards = cards
    .filter((card) => card.active !== false)
    .sort((a, b) => a.order - b.order);

  if (visibleCards.length === 0) return null;

  return (
    <div
      className={
        withHeroOverlap
          ? 'relative z-20 mt-3 sm:-mt-8 lg:-mt-10 px-0 sm:px-5'
          : 'relative z-20 px-0'
      }
    >
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-3.5 md:pb-0">
        {visibleCards.map((card) => {
          if (card.kind === 'featured_product') {
            return (
              <HeroFeaturedBento
                key={card.id}
                label={card.title}
                slides={slides}
                activeIndex={activeIndex}
                onPrevSlide={onPrevSlide}
                onNextSlide={onNextSlide}
                bcvRate={bcvRate}
                cmsLogo={cmsLogo}
                onPauseChange={onPauseChange}
              />
            );
          }

          if (card.kind === 'offers_countdown') {
            return (
              <Link
                key={card.id}
                href={card.href}
                className={`${BENTO_CARD_CLASS} group hover:border-[#0F172A] transition-colors`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                    {card.title}
                    {card.titleLineBreak && (
                      <span className="block">{card.titleLineBreak}</span>
                    )}
                  </h2>
                  <span className="inline-flex items-center justify-center rounded-full bg-[#D99B38] text-white px-2.5 py-0.5 text-[11px] sm:text-xs font-black tabular-nums">
                    {maxDiscountPct > 0 ? `-${maxDiscountPct}%` : card.badgeText}
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
                    <ChevronRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </Link>
            );
          }

          if (card.kind === 'delivery_action') {
            return (
              <div key={card.id} className={BENTO_CARD_CLASS}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                      {card.title}
                    </h2>
                    {card.subtitle && (
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-[#F7F8FA] border border-slate-200/70 flex items-center justify-center text-[#0F172A]">
                    <DynamicLucideIcon
                      name={card.icon}
                      fallback="MapPin"
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A]"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {card.ctaText && (
                  <div className="pt-3">
                    <Link
                      href={card.href}
                      className="w-full min-h-[40px] inline-flex items-center justify-center rounded-full bg-[#0F172A] hover:bg-[#001754] active:scale-[0.98] text-xs sm:text-[13px] font-extrabold text-white transition-all"
                    >
                      {card.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={card.id}
              href={card.href}
              className={`${BENTO_CARD_CLASS} group hover:border-[#0F172A] transition-colors`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
                  {card.title}
                  {card.titleLineBreak && <span className="block">{card.titleLineBreak}</span>}
                </h2>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white group-hover:bg-[#001754] transition-all">
                  <ChevronRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3">
                {card.subtitle && (
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    {card.subtitle}
                  </span>
                )}
                {card.pillText && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-[#EB9C53]/60 px-2.5 py-0.5 text-xs font-extrabold text-[#8B3E03]">
                    <DynamicLucideIcon
                      name={card.icon}
                      fallback="Package"
                      className="w-3.5 h-3.5"
                      strokeWidth={1.5}
                    />
                    {card.pillText}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
