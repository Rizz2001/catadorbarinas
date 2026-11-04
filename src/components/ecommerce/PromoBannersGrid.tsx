import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';

interface PromoBannersGridProps {
  banners: Banner[];
}

const DEFAULT_PROMO_IMAGES = {
  whisky: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
  cervezas: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
  despensa: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
};

export function PromoBannersGrid({ banners }: PromoBannersGridProps) {
  const promo1 = banners.find((b) => b.tipo === 'promo_1' || b.tipo === 'promocion_grid') || null;
  const promo2 = banners.find((b) => b.tipo === 'promo_2' || b.tipo === 'secundario') || null;
  const promo3 = banners.find((b) => b.tipo === 'promo_3') || null;

  const cards = [
    {
      id: 'promo-1',
      image: promo1?.imagen_url || DEFAULT_PROMO_IMAGES.whisky,
      title: promo1?.titulo || 'Whiskies Escoceses y Reservas',
      subtitle:
        promo1?.subtitulo ||
        "Buchanan's, Old Parr, Chivas Regal y Johnnie Walker por botella o caja.",
      ctaText: promo1?.boton_texto || 'Explorar whiskies',
      ctaUrl: promo1?.boton_url || '/catalogo/01/01',
    },
    {
      id: 'promo-2',
      image: promo2?.imagen_url || DEFAULT_PROMO_IMAGES.cervezas,
      title: promo2?.titulo || 'Cervezas Frías y Cajas por Mayor',
      subtitle:
        promo2?.subtitulo ||
        'Polar Pilsen, Solera, Zulia, Corona y bolsas de hielo listas para tu evento.',
      ctaText: promo2?.boton_texto || 'Ver cervezas y cajas',
      ctaUrl: promo2?.boton_url || '/catalogo/09',
    },
    {
      id: 'promo-3',
      image: promo3?.imagen_url || DEFAULT_PROMO_IMAGES.despensa,
      title: promo3?.titulo || 'Despensa, Aceites y Alimentos',
      subtitle:
        promo3?.subtitulo ||
        'Harina P.A.N., pastas, aceites de oliva, cafés y productos esenciales del hogar.',
      ctaText: promo3?.boton_texto || 'Ir a despensa',
      ctaUrl: promo3?.boton_url || '/catalogo/11',
    },
  ];

  return (
    <section
      aria-label="Colecciones Destacadas del Bodegón"
      className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
    >
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.ctaUrl}
          className="group relative overflow-hidden rounded-2xl p-4 sm:p-6 border border-slate-800/40 flex flex-col justify-end min-h-[148px] sm:min-h-[205px] transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.55) 60%, rgba(15, 23, 42, 0.25) 100%), url(${card.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="space-y-1">
            <h2 className="text-base sm:text-xl font-black text-white leading-tight tracking-tight">
              {card.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed line-clamp-2">
              {card.subtitle}
            </p>
            <div className="pt-1.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 group-hover:text-white transition-colors">
              <span>{card.ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

