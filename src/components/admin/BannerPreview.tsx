import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';
import { useBcvStore } from '@/store/useBcvStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { buildHeroScrimGradient, resolveHeroDisplay } from '@/lib/hero-config';
import { cn } from '@/lib/utils';

interface BannerPreviewProps {
  banner: Partial<Banner>;
  previewMode?: 'desktop' | 'mobile';
}

export function BannerPreview({ banner, previewMode = 'desktop' }: BannerPreviewProps) {
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const hero = resolveHeroDisplay(banner);
  const isMobile = previewMode === 'mobile';

  return (
    <div
      className={cn(
        'relative overflow-hidden text-white border border-slate-900',
        isMobile ? 'rounded-2xl px-4 py-6' : 'rounded-3xl px-6 py-8 md:px-10 md:py-10'
      )}
      style={{ backgroundColor: hero.heroBgColor }}
    >
      <div
        className="absolute inset-0 bg-cover transition-all duration-200"
        style={{
          backgroundImage: `url(${hero.bgImageUrl})`,
          backgroundPosition: hero.objectPosition,
        }}
      />
      <div
        className="absolute inset-0 transition-all duration-200"
        style={{
          background: buildHeroScrimGradient(hero.heroBgColor, hero.overlayOpacity),
        }}
      />

      <div
        className={cn(
          'relative z-10 flex flex-col items-center text-center mx-auto',
          isMobile ? 'space-y-2.5' : 'max-w-2xl space-y-3'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white/10 border border-[#EB9C53]/45 px-3 py-0.5 font-extrabold uppercase tracking-widest text-[#EB9C53]',
            isMobile ? 'text-[9px]' : 'text-[10px]'
          )}
        >
          {hero.badgeTexto}
        </span>

        <h2
          className={cn(
            'font-serif font-bold tracking-tight leading-tight uppercase',
            isMobile ? 'text-[20px]' : 'text-xl sm:text-2xl'
          )}
        >
          <span className="block text-white">{hero.primaryTitle}</span>
          {hero.highlightedTitle && (
            <span className="block text-[#EB9C53] mt-0.5">{hero.highlightedTitle}</span>
          )}
        </h2>

        {!isMobile && (
          <p className="text-xs text-slate-300 max-w-lg line-clamp-2 leading-relaxed">
            {hero.subtitulo}
          </p>
        )}

        {hero.hasPromo && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px]">
            <span className="font-extrabold text-[#EB9C53]">{hero.promoTitulo}</span>
            {hero.promoPrecio !== null && hero.promoPrecio > 0 && (
              <span className="font-black text-white tabular-nums">
                ${hero.promoPrecio.toFixed(2)} ({formatVes(convertUsdToVes(hero.promoPrecio, bcvRate))})
              </span>
            )}
            {!isMobile && hero.promoAhorro && (
              <span className="text-[10px] font-bold text-[#FEF3C7]">· {hero.promoAhorro}</span>
            )}
          </div>
        )}

        <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D99B38] px-4 py-2 text-xs font-black text-white">
            {hero.botonTexto} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
          {hero.secondaryBtnText && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/25 px-4 py-2 text-xs font-extrabold text-white">
              {hero.secondaryBtnText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
