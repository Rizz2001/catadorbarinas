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
    <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3.5 sm:pb-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {title || 'Empresas y Marcas Aliadas Oficiales'}
          </h2>
          <p className="text-[13px] sm:text-sm text-slate-600 mt-1">
            Distribución directa con sello de autenticidad en el estado Barinas
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-[13px] sm:text-sm font-extrabold text-catador-blue hover:text-catador-blue-dark inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explorar catálogo</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
              className="group relative flex items-center gap-2.5 sm:gap-3 p-3 rounded-2xl bg-[#F7F8FA] hover:bg-white border border-slate-200 hover:border-catador-blue transition-colors duration-150 min-w-0"
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
