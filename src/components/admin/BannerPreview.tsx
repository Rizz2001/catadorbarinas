import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';
import { useBcvStore } from '@/store/useBcvStore';
import { convertUsdToVes, formatVes, DEFAULT_BCV_RATE } from '@/lib/currency';
import { resolveHeroDisplay } from '@/lib/hero-config';

interface BannerPreviewProps {
  banner: Partial<Banner>;
}

export function BannerPreview({ banner }: BannerPreviewProps) {
  const bcvRate = useBcvStore((state) => state.rateInfo?.rate ?? DEFAULT_BCV_RATE);
  const hero = resolveHeroDisplay(banner);

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-10 md:py-10 text-white border border-slate-900"
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

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block rounded-full bg-white/10 border border-[#EB9C53]/45 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#EB9C53]">
          {hero.badgeTexto}
        </span>

        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight leading-tight uppercase">
          <span className="block text-white">{hero.primaryTitle}</span>
          {hero.highlightedTitle && (
            <span className="block text-[#EB9C53] mt-0.5">{hero.highlightedTitle}</span>
          )}
        </h2>

        <p className="text-xs text-slate-300 max-w-lg line-clamp-2 leading-relaxed">
          {hero.subtitulo}
        </p>

        {hero.hasPromo && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-[11px]">
            <span className="font-extrabold text-[#EB9C53]">{hero.promoTitulo}</span>
            {hero.promoPrecio !== null && hero.promoPrecio > 0 && (
              <span className="font-black text-white tabular-nums">
                ${hero.promoPrecio.toFixed(2)} ({formatVes(convertUsdToVes(hero.promoPrecio, bcvRate))})
              </span>
            )}
            {hero.promoAhorro && (
              <span className="text-[10px] font-bold text-[#FEF3C7]">· {hero.promoAhorro}</span>
            )}
          </div>
        )}

        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D99B38] px-4 py-2 text-xs font-black text-white">
            {hero.botonTexto} <ArrowRight className="h-3.5 w-3.5" />
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
