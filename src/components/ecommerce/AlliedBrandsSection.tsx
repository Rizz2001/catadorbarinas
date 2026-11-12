'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { AlliedBrand } from '@/types';

interface AlliedBrandsSectionProps {
  brands: AlliedBrand[];
  title?: string | null;
}

export function AlliedBrandsSection({
  brands,
  title = 'Empresas y Marcas Aliadas Oficiales',
}: AlliedBrandsSectionProps) {
  if (!brands || brands.length < 6) return null;

  return (
    <section className="rounded-2xl bg-white border border-slate-100 sm:border-slate-200 p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-5 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 sm:border-slate-200 pb-3 sm:pb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {title || 'Empresas y Marcas Aliadas Oficiales'}
          </h2>
          <p className="hidden sm:block text-sm text-slate-500 mt-1">
            Distribución directa con sello de autenticidad en el estado Barinas
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-xs sm:text-sm font-extrabold text-catador-blue hover:text-catador-blue-dark inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explorar catálogo</span>
          <ChevronRight className="h-4 w-4" strokeWidth={1.5}/>
        </Link>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-3 sm:pb-0">
        {brands.map((brand) => {
          const initials = brand.nombre
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

          return (
            <Link
              key={brand.id}
              href={brand.url_destino || '/catalogo'}
              className="w-[168px] shrink-0 snap-start sm:w-auto group relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F7F8FA] hover:bg-white border border-slate-100 hover:border-catador-blue transition-colors duration-150 min-w-0"
            >
              <div
                className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-white font-black text-xs overflow-hidden"
                style={{ backgroundColor: brand.color_acento || '#00227B' }}
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.nombre}
                    fill
                    sizes="44px"
                    className="object-contain bg-white p-1"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] sm:text-sm font-extrabold text-slate-900 group-hover:text-catador-blue transition-colors truncate">
                  {brand.nombre}
                </h3>
                <span className="text-xs font-medium text-slate-600 block truncate">
                  {brand.categoria_tag}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
