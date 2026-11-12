'use client';

import { ChevronRight } from 'lucide-react';
import { Banner } from '@/types';

interface PromoCardPreviewProps {
  banner: Partial<Banner>;
}

export function PromoCardPreview({ banner }: PromoCardPreviewProps) {
  const bgImage =
    banner.imagen_url ||
    'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="max-w-md mx-auto">
      <div
        className="relative overflow-hidden rounded-2xl p-6 border border-slate-200 flex flex-col justify-between min-h-[200px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0, 23, 84, 0.94) 0%, rgba(0, 23, 84, 0.6) 60%, rgba(0, 23, 84, 0.25) 100%), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
            <ChevronRight className="h-4 w-4" strokeWidth={1.5}/>
          </span>
        </div>

        <div className="space-y-1.5 pt-4">
          <h3 className="text-lg font-black text-white leading-tight tracking-tight">
            {banner.titulo || 'Título de la Promoción'}
          </h3>
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {banner.subtitulo || 'Descripción informativa de los productos incluidos en la oferta.'}
          </p>
          <span className="inline-block pt-1 text-xs font-extrabold text-[#EB9C53]">
            {banner.boton_texto || 'Ver selección'}
          </span>
        </div>
      </div>
    </div>
  );
}
