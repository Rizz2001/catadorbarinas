'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailGalleryProps {
  name: string;
  images: string[];
  activeImage: string;
  selectedImage: string | null;
  cmsLogo: string;
  discountPercentage?: number | null;
  isFav: boolean;
  onSelectImage: (img: string) => void;
  onToggleFavorite: () => void;
  onImageError: () => void;
}

export function ProductDetailGallery({
  name,
  images,
  activeImage,
  selectedImage,
  cmsLogo,
  discountPercentage,
  isFav,
  onSelectImage,
  onToggleFavorite,
  onImageError,
}: ProductDetailGalleryProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 min-w-0">
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-none shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(img)}
              className={cn(
                'relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl bg-white border p-1 overflow-hidden cursor-pointer transition-colors',
                selectedImage === img || (!selectedImage && idx === 0)
                  ? 'border-catador-blue ring-2 ring-catador-blue/15'
                  : 'border-slate-200 hover:border-slate-400'
              )}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1 mix-blend-multiply contrast-[1.08] brightness-[1.05]"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 aspect-[4/3] max-h-[250px] sm:max-h-none sm:aspect-square rounded-2xl bg-white border border-slate-100 sm:border-slate-200 shadow-sm p-4 sm:p-7 flex items-center justify-center overflow-hidden">
        {discountPercentage ? (
          <span className="absolute top-3.5 left-3.5 z-10 rounded-full bg-catador-amber-soft border border-catador-amber-oak/70 px-3 py-1 text-xs font-black text-[#8B3E03] tabular-nums">
            -{discountPercentage}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            'absolute top-3.5 right-3.5 z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95 cursor-pointer',
            isFav
              ? 'bg-red-50 border-red-200 text-red-500'
              : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
          )}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={cn('h-4 w-4', isFav && 'fill-current')} strokeWidth={1.5}/>
        </button>

        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 34vw"
          className={cn(
            'object-contain transition-transform duration-300 mix-blend-multiply contrast-[1.08] brightness-[1.05]',
            activeImage === cmsLogo ? 'p-12 opacity-80' : 'p-4 hover:scale-105'
          )}
          onError={onImageError}
        />
      </div>
    </div>
  );
}

