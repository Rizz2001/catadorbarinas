'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ArrowUpRight } from 'lucide-react';
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
    <section className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catador-blue/10 text-catador-blue shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-catador-amber block">
              RESPALDO Y DISTRIBUCIÓN OFICIAL EN BARINAS
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {title || 'Empresas y Marcas Aliadas Oficiales'}
            </h2>
          </div>
        </div>
        <Link
          href="/catalogo"
          className="text-xs font-extrabold text-catador-blue hover:text-catador-blue-light inline-flex items-center gap-1 self-start sm:self-auto"
        >
          Explorar todas las marcas <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
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
              className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-catador-blue/40 hover:shadow-md transition-all duration-200"
            >
              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-black text-sm shadow-xs overflow-hidden"
                style={{ backgroundColor: brand.color_acento || '#00227B' }}
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.nombre}
                    fill
                    sizes="48px"
                    className="object-contain bg-white p-1"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {brand.categoria_tag}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-catador-blue transition-colors truncate">
                  {brand.nombre}
                </h3>
              </div>

              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-catador-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

