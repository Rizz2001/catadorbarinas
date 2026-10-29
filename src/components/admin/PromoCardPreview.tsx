'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
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
        className="relative overflow-hidden rounded-2xl p-6 border border-slate-700/30 flex flex-col justify-between shadow-md group min-h-[190px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.4) 100%), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
            <Sparkles className="h-3 w-3" />
            {banner.badge_texto || 'SELECCIÓN PREMIUM'}
          </span>
          <h3 className="text-lg font-black text-white mt-2 leading-tight">
            {banner.titulo || 'Título de la Promoción'}
          </h3>
          <p className="text-xs text-slate-200 mt-1 line-clamp-2">
            {banner.subtitulo || 'Descripción informativa de los productos incluidos en la oferta.'}
          </p>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300">
          <span>{banner.boton_texto || 'Ver selección'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
