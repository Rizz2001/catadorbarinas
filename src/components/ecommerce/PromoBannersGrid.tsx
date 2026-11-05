import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';

interface PromoBannersGridProps {
  banners: Banner[];
}

export function PromoBannersGrid({ banners }: PromoBannersGridProps) {
  // Solo incluir banners que estén explícitamente activos
  const promo1 = banners.find(
    (b) => (b.tipo === 'promo_1' || b.tipo === 'promocion_grid') && b.activo !== false
  );
  const promo2 = banners.find(
    (b) => (b.tipo === 'promo_2' || b.tipo === 'secundario') && b.activo !== false
  );
  const promo3 = banners.find(
    (b) => b.tipo === 'promo_3' && b.activo !== false
  );

  const activeCards = [
    promo1 && {
      id: promo1.id || 'promo-1',
      image: promo1.imagen_url || 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
      title: promo1.titulo || 'Whiskies Escoceses',
      subtitle: promo1.subtitulo || "Buchanan's, Old Parr, Chivas y Black Label al mejor precio oficial.",
      badge: promo1.badge_texto,
      ctaText: promo1.boton_texto || 'Ver selección',
      ctaUrl: promo1.boton_url || '/catalogo/01/01',
    },
    promo2 && {
      id: promo2.id || 'promo-2',
      image: promo2.imagen_url || 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
      title: promo2.titulo || 'Cervezas & Refrescos',
      subtitle: promo2.subtitulo || 'Polar Pilsen, Solera, Corona y combos con hielo.',
      badge: promo2.badge_texto,
      ctaText: promo2.boton_texto || 'Ver cervezas frías',
      ctaUrl: promo2.boton_url || '/catalogo/09',
    },
    promo3 && {
      id: promo3.id || 'promo-3',
      image: promo3.imagen_url || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      title: promo3.titulo || 'Víveres & Despensa',
      subtitle: promo3.subtitulo || 'Harina P.A.N., arroz, aceites de oliva y productos esenciales.',
      badge: promo3.badge_texto,
      ctaText: promo3.boton_texto || 'Explorar víveres',
      ctaUrl: promo3.boton_url || '/catalogo/11',
    },
  ].filter(Boolean) as Array<{
    id: string;
    image: string;
    title: string;
    subtitle: string;
    badge?: string | null;
    ctaText: string;
    ctaUrl: string;
  }>;

  // Si no hay ningún banner promocional activo, ocultamos la sección por completo
  if (activeCards.length === 0) {
    return null;
  }

  const gridColsClass =
    activeCards.length === 1
      ? 'grid-cols-1'
      : activeCards.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <section
      aria-label="Colecciones Destacadas del Bodegón"
      className={`grid ${gridColsClass} gap-3 sm:gap-4`}
    >
      {activeCards.map((card) => (
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
            {card.badge && (
              <span className="inline-block rounded-md bg-catador-amber px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-2xs tracking-wider mb-1">
                {card.badge}
              </span>
            )}
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

