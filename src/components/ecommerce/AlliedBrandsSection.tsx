'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { AlliedBrand } from '@/types';

interface AlliedBrandsSectionProps {
  brands: AlliedBrand[];
  title?: string | null;
}

export function AlliedBrandsSection({
  brands,
  title = 'Empresas y Marcas Aliadas Oficiales',
}: AlliedBrandsSectionProps) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-3.5 sm:p-6 space-y-4 sm:space-y-5 min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3 sm:pb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {title || 'Empresas y Marcas Aliadas Oficiales'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
            Distribución directa con sello de autenticidad en el estado Barinas
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-xs font-extrabold text-catador-blue hover:text-catador-blue-light inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explorar catálogo de marcas</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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
              className="group relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-catador-blue transition-colors duration-150 min-w-0"
            >
              <div
                className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg text-white font-black text-[11px] sm:text-xs overflow-hidden"
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
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-catador-blue transition-colors truncate">
                  {brand.nombre}
                </h3>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">
                  {brand.categoria_tag}
                </span>
              </div>

              <ArrowUpRight className="hidden xs:block h-4 w-4 text-slate-300 group-hover:text-catador-blue shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
