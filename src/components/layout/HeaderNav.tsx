'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { DEPARTMENTS } from '@/constants/config';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo Completo', exact: true },
  { href: '/catalogo/01', label: 'Licores y Destilados' },
  { href: '/catalogo/09', label: 'Cervezas' },
  { href: '/catalogo/02', label: 'Refrescos y Bebidas' },
  { href: '/catalogo/11', label: 'Alimentos y Despensa' },
  { href: '/catalogo/05', label: 'Confitería', hideMobile: true },
];

export function HeaderNav() {
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-catador-blue text-white relative z-30 border-b border-blue-950">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-4">
        {/* Botón Comprar por Departamento (Azul Institucional según Jerarquía de Color) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="flex items-center gap-2 bg-blue-950/85 hover:bg-blue-950 text-white px-3.5 sm:px-4 py-2.5 min-h-[42px] text-[13px] sm:text-sm font-extrabold border-x border-blue-800/80 transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4 shrink-0" />
            <span>Departamentos</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200 shrink-0',
                isDeptOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Menú Desplegable de Departamentos Limpio */}
          {isDeptOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-slate-900/40"
                onClick={() => setIsDeptOpen(false)}
              />
              <div className="absolute top-full left-0 w-72 max-w-[90vw] bg-white text-slate-800 shadow-xl border border-slate-200 rounded-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[13px] font-black text-slate-900">
                    Departamentos en Sede
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                  <Link
                    href="/catalogo"
                    onClick={() => setIsDeptOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-[13px] font-extrabold text-catador-blue bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]"
                  >
                    <span>Ver Catálogo Completo</span>
                    <ArrowRight className="h-4 w-4 text-catador-blue" />
                  </Link>

                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/catalogo/${dept.slug}`}
                      onClick={() => setIsDeptOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-catador-blue transition-colors min-h-[44px]"
                    >
                      <span>{dept.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enlaces Rápidos con Un Solo Estilo de Activo Uniforme */}
        <div className="flex items-center gap-4 sm:gap-6 text-[13px] sm:text-sm overflow-x-auto scrollbar-none whitespace-nowrap px-1 min-w-0 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-2 border-b-2 transition-colors',
                  link.hideMobile && 'hidden md:inline-block',
                  isActive
                    ? 'border-catador-amber text-white font-black'
                    : 'border-transparent text-white/90 font-semibold hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Enlace Directo a Ofertas del Día */}
        <Link
          href="/#ofertas"
          className="hidden xs:inline-flex items-center gap-1.5 text-white/95 hover:text-white text-[13px] sm:text-sm font-extrabold py-1.5 transition-colors shrink-0"
        >
          <span className="h-2 w-2 rounded-full bg-catador-amber shrink-0" />
          <span>Ofertas del Día</span>
        </Link>
      </div>
    </nav>
  );
}
