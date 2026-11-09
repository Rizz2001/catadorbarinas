'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { DEPARTMENTS } from '@/constants/config';
import { cn } from '@/lib/utils';

export function HeaderNav() {
  const [isDeptOpen, setIsDeptOpen] = useState(false);

  return (
    <nav className="bg-catador-blue text-white relative z-30 border-b border-blue-950">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-4">
        {/* Botón Comprar por Departamento */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="flex items-center gap-1.5 sm:gap-2 bg-catador-amber hover:bg-catador-amber-dark text-white px-3 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[40px] text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer"
          >
            <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>Departamentos</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200 shrink-0',
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
                  <span className="text-xs font-black text-slate-900">
                    Departamentos en Sede
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                  <Link
                    href="/catalogo"
                    onClick={() => setIsDeptOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-xs font-extrabold text-catador-blue bg-slate-50 hover:bg-slate-100 transition-colors min-h-[42px]"
                  >
                    <span>Ver Catálogo Completo</span>
                    <ArrowRight className="h-3.5 w-3.5 text-catador-blue" />
                  </Link>

                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/catalogo/${dept.slug}`}
                      onClick={() => setIsDeptOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-catador-blue transition-colors min-h-[42px]"
                    >
                      <span>{dept.name}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enlaces Rápidos de Navegación Editorial */}
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none whitespace-nowrap px-1 min-w-0 flex-1">
          <Link
            href="/catalogo"
            className="text-amber-300 hover:text-white transition-colors py-1"
          >
            Catálogo Completo
          </Link>
          <Link href="/catalogo/01" className="hover:text-amber-300 transition-colors py-1">
            Licores y Destilados
          </Link>
          <Link href="/catalogo/09" className="hover:text-amber-300 transition-colors py-1">
            Cervezas
          </Link>
          <Link href="/catalogo/02" className="hover:text-amber-300 transition-colors py-1">
            Refrescos y Bebidas
          </Link>
          <Link href="/catalogo/11" className="hover:text-amber-300 transition-colors py-1">
            Alimentos y Despensa
          </Link>
          <Link
            href="/catalogo/05"
            className="hover:text-amber-300 transition-colors py-1 hidden md:inline"
          >
            Confitería
          </Link>
        </div>

        {/* Enlace Directo a Ofertas del Día */}
        <Link
          href="/#ofertas"
          className="hidden xs:inline-flex items-center gap-1.5 text-amber-300 hover:text-white text-[11px] sm:text-xs font-black py-1.5 transition-colors shrink-0"
        >
          <span>Ofertas del Día</span>
        </Link>
      </div>
    </nav>
  );
}
