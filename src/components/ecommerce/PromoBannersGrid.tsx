import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Banner } from '@/types';
import { buildPromoScrimGradient, resolveBannerImageVisual } from '@/lib/hero-config';

interface PromoBannersGridProps {
  banners: Banner[];
}

export function PromoBannersGrid({ banners }: PromoBannersGridProps) {
  const promo1 = banners.find(
    (b) => (b.tipo === 'promo_1' || b.tipo === 'promocion_grid') && b.activo !== false
  );
  const promo2 = banners.find(
    (b) => (b.tipo === 'promo_2' || b.tipo === 'secundario') && b.activo !== false
  );
  const promo3 = banners.find(
    (b) => b.tipo === 'promo_3' && b.activo !== false
  );

  const buildCard = (
    b: Banner | undefined,
    fallbackOrder: number,
    defaults: { id: string; image: string; title: string; subtitle: string; ctaText: string; ctaUrl: string }
  ) => {
    if (!b) return null;
    const { overlayOpacity, objectPosition } = resolveBannerImageVisual(b, 85);
    return {
      id: b.id || defaults.id,
      image: b.imagen_url || defaults.image,
      title: b.titulo || defaults.title,
      subtitle: b.subtitulo || defaults.subtitle,
      badge: b.badge_texto,
      ctaText: b.boton_texto || defaults.ctaText,
      ctaUrl: b.boton_url || defaults.ctaUrl,
      orden: b.orden ?? fallbackOrder,
      overlayOpacity,
      objectPosition,
    };
  };

  const activeCards = [
    buildCard(promo1, 1, {
      id: 'promo-1',
      image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
      title: 'Whiskies Escoceses',
      subtitle: "Buchanan's, Old Parr, Chivas y Black Label al mejor precio oficial.",
      ctaText: 'Ver selección',
      ctaUrl: '/catalogo/01/01',
    }),
    buildCard(promo2, 2, {
      id: 'promo-2',
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
      title: 'Cervezas & Refrescos',
      subtitle: 'Polar Pilsen, Solera, Corona y combos con hielo.',
      ctaText: 'Ver cervezas frías',
      ctaUrl: '/catalogo/09',
    }),
    buildCard(promo3, 3, {
      id: 'promo-3',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      title: 'Víveres & Despensa',
      subtitle: 'Harina P.A.N., arroz, aceites de oliva y productos esenciales.',
      ctaText: 'Explorar víveres',
      ctaUrl: '/catalogo/11',
    }),
  ]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.orden - b.orden);

  if (activeCards.length === 0) {
    return null;
  }

  const gridColsClass =
    activeCards.length === 1
      ? 'md:grid-cols-1'
      : activeCards.length === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-3';

  return (
    <section
      aria-label="Colecciones Destacadas del Bodegón"
      className={`flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 scrollbar-none md:grid ${gridColsClass} md:gap-4 md:pb-0`}
    >
      {activeCards.map((card) => (
        <Link
          key={card.id}
          href={card.ctaUrl}
          className="w-[78vw] min-w-[255px] max-w-[310px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none group relative overflow-hidden rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[146px] sm:min-h-[208px] transition-colors duration-150 hover:border-catador-blue"
          style={{
            backgroundImage: `${buildPromoScrimGradient(card.overlayOpacity)}, url(${card.image})`,
            backgroundSize: 'cover',
            backgroundPosition: card.objectPosition,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            {card.badge && card.badge.trim() !== '' ? (
              <span className="inline-block rounded-full bg-catador-amber-soft border border-catador-amber-oak/70 px-2.5 py-0.5 text-xs font-extrabold text-[#8B3E03]">
                {card.badge.replace(/^[★✨\s]+/, '')}
              </span>
            ) : (
              <span />
            )}
            <span className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-catador-blue text-white group-hover:bg-white group-hover:text-catador-blue transition-colors shadow-xs">
              <ChevronRight className="h-4 w-4" strokeWidth={1.5}/>
            </span>
          </div>

          <div className="space-y-1 pt-3">
            <h2 className="text-base sm:text-xl font-black text-white leading-tight tracking-tight">
              {card.title}
            </h2>
            <p className="hidden sm:block text-[13px] text-slate-200 leading-relaxed line-clamp-2">
              {card.subtitle}
            </p>
            <span className="inline-block pt-0.5 text-xs sm:text-[13px] font-extrabold text-catador-amber-oak group-hover:text-white transition-colors">
              {card.ctaText}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
