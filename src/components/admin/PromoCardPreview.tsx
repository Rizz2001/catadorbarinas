'use client';

import { ChevronRight } from 'lucide-react';
import { Banner } from '@/types';
import { buildPromoScrimGradient, resolveBannerImageVisual } from '@/lib/hero-config';
import { cn } from '@/lib/utils';

interface PromoCardPreviewProps {
  banner: Partial<Banner>;
  previewMode?: 'desktop' | 'mobile';
}

export function PromoCardPreview({ banner, previewMode = 'desktop' }: PromoCardPreviewProps) {
  const bgImage =
    banner.imagen_url ||
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80';
  const { overlayOpacity, objectPosition } = resolveBannerImageVisual(banner, 85);
  const isMobile = previewMode === 'mobile';

  return (
    <div className={cn(isMobile ? 'w-full' : 'max-w-md mx-auto')}>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200 flex flex-col justify-between transition-all duration-200',
          isMobile ? 'p-4 min-h-[150px]' : 'p-6 min-h-[208px]'
        )}
        style={{
          backgroundImage: `${buildPromoScrimGradient(overlayOpacity)}, url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: objectPosition,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          {banner.badge_texto && banner.badge_texto.trim() !== '' ? (
            <span className="inline-block rounded-full bg-[#FEF3C7] border border-[#EB9C53]/70 px-2.5 py-0.5 text-xs font-extrabold text-[#8B3E03]">
              {banner.badge_texto.replace(/^[★✨\s]+/, '')}
            </span>
          ) : (
            <span />
          )}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white">
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>

        <div className="space-y-1.5 pt-3">
          <h3
            className={cn(
              'font-black text-white leading-tight tracking-tight',
              isMobile ? 'text-base' : 'text-lg'
            )}
          >
            {banner.titulo || 'Título de la Promoción'}
          </h3>
          {!isMobile && (
            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
              {banner.subtitulo || 'Descripción informativa de los productos incluidos en la oferta.'}
            </p>
          )}
          <span className="inline-block pt-1 text-xs font-extrabold text-[#EB9C53]">
            {banner.boton_texto || 'Ver selección'}
          </span>
        </div>
      </div>
    </div>
  );
}
