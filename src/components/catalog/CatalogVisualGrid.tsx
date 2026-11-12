'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { QuickCategory } from '@/types';
import { DynamicLucideIcon } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CatalogVisualGridProps {
  categories: QuickCategory[];
  forceMobileLayout?: boolean;
}

/**
 * Grilla visual mobile-first del catálogo por categorías.
 * Muestra arriba tarjetas cuadradas estándar (3 cols móvil / 4 tablet / 6 desktop)
 * y debajo colecciones destacadas de ancho completo.
 */
export function CatalogVisualGrid({
  categories,
  forceMobileLayout = false,
}: CatalogVisualGridProps) {
  const activeCategories = categories.filter((cat) => cat.activo !== false);

  const orderedCategories = [
    ...activeCategories
      .filter((cat) => !cat.is_featured)
      .sort((a, b) => a.orden - b.orden),
    ...activeCategories
      .filter((cat) => Boolean(cat.is_featured))
      .sort((a, b) => a.orden - b.orden),
  ];

  if (orderedCategories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        <p className="text-sm font-bold">No hay categorías visuales activas en este momento.</p>
        <p className="text-xs text-slate-500 mt-1">
          Configura tus categorías desde el panel CMS en /admin/categorias.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Categorías del Catálogo">
      <div
        className={cn(
          'grid grid-cols-3 gap-3',
          !forceMobileLayout && 'md:grid-cols-4 lg:grid-cols-6 md:gap-4'
        )}
      >
        {orderedCategories.map((cat) => {
          const isFeatured = Boolean(cat.is_featured);
          const hasImage = Boolean(cat.image_url && cat.image_url.trim() !== '');
          const iconName = cat.icon_name || cat.icono || 'Wine';

          return (
            <Link
              key={cat.id || cat.nombre}
              href={cat.url || '/catalogo/01'}
              className={cn(
                'group relative block overflow-hidden rounded-2xl bg-[#081229] border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0016C2]',
                isFeatured
                  ? cn(
                      'col-span-3 aspect-[21/9] min-h-[124px]',
                      !forceMobileLayout && 'md:col-span-2 lg:col-span-3 sm:min-h-[144px]'
                    )
                  : 'col-span-1 aspect-square'
              )}
            >
              {hasImage ? (
                <Image
                  src={cat.image_url as string}
                  alt={cat.nombre}
                  fill
                  sizes={
                    isFeatured
                      ? '(max-width: 768px) 100vw, 50vw'
                      : '(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw'
                  }
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#081229] via-[#001754] to-[#0F172A] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <DynamicLucideIcon
                    name={iconName}
                    fallback="Wine"
                    className={cn(
                      'text-[#EB9C53]/25 transition-transform duration-300 group-hover:scale-110',
                      isFeatured ? 'h-16 w-16' : 'h-10 w-10 sm:h-12 sm:w-12'
                    )}
                    strokeWidth={1.35}
                  />
                </div>
              )}

              <div
                className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                aria-hidden="true"
              />

              {isFeatured ? (
                <div className="relative z-10 flex h-full w-full items-end justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#EB9C53] mb-0.5">
                      Colección Destacada
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-white leading-tight tracking-tight truncate">
                      {cat.nombre}
                    </h2>
                    {cat.descripcion && (
                      <p className="text-xs sm:text-[13px] font-medium text-slate-200 mt-0.5 line-clamp-1">
                        {cat.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#EB9C53] text-white transition-colors">
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
              ) : (
                <div className="relative z-10 flex h-full w-full items-end p-2.5 sm:p-3.5">
                  <div className="w-full min-w-0">
                    <h2 className="text-[13px] sm:text-sm font-black text-white leading-tight tracking-tight line-clamp-2 drop-shadow-xs">
                      {cat.nombre}
                    </h2>
                    {cat.descripcion && (
                      <p className="hidden sm:block text-[11px] font-medium text-slate-200/90 mt-0.5 line-clamp-1">
                        {cat.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

