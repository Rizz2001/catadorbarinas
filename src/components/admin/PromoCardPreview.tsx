'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
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
        className="relative overflow-hidden rounded-xl p-6 border border-slate-800/40 flex flex-col justify-end group min-h-[190px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.58) 60%, rgba(15, 23, 42, 0.25) 100%), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="space-y-1.5">
          {banner.badge_texto && banner.badge_texto.trim() !== '' && (
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              {banner.badge_texto.replace(/^[★✨\s]+/, '')}
            </span>
          )}
          <h3 className="text-lg font-black text-white leading-tight tracking-tight">
            {banner.titulo || 'Título de la Promoción'}
          </h3>
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {banner.subtitulo || 'Descripción informativa de los productos incluidos en la oferta.'}
          </p>
          <div className="pt-1.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
            <span>{banner.boton_texto || 'Ver selección'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
