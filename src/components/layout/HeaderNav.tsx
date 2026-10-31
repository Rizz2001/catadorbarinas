'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Flame } from 'lucide-react';
import { DEPARTMENTS } from '@/constants/config';
import { cn } from '@/lib/utils';

export function HeaderNav() {
  const [isDeptOpen, setIsDeptOpen] = useState(false);

  return (
    <nav className="bg-catador-blue text-white shadow-md relative z-30">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Botón Comprar por Departamento */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="flex items-center gap-2.5 bg-catador-amber hover:bg-catador-amber-dark text-white px-4 py-3 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
            <span>Departamentos</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', isDeptOpen && 'rotate-180')}
            />
          </button>

          {/* Menú Desplegable de Departamentos con Backdrop */}
          {isDeptOpen && (
            <>
              {/* Backdrop para cerrar al tocar fuera en móvil o desktop */}
              <div
                className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs"
                onClick={() => setIsDeptOpen(false)}
              />
              <div className="absolute top-full left-0 w-72 max-w-[90vw] bg-white text-slate-800 shadow-2xl border border-slate-200 rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Departamentos
                  </span>
                  <span className="text-[10px] bg-amber-50 text-catador-amber border border-amber-200 font-bold px-1.5 py-0.5 rounded">
                    Gran Catador
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                  <Link
                    href="/catalogo"
                    onClick={() => setIsDeptOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-xs font-bold text-catador-blue bg-blue-50/60 hover:bg-blue-100/60 transition-colors min-h-[44px]"
                  >
                    <span>🏪 Ver Todo el Catálogo</span>
                    <span className="text-[10px] bg-catador-blue text-white px-2 py-0.5 rounded-full font-bold">
                      Todos
                    </span>
                  </Link>

                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/catalogo/${dept.slug}`}
                      onClick={() => setIsDeptOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-xs font-semibold hover:bg-slate-50 hover:text-catador-blue transition-colors min-h-[44px]"
                    >
                      <span>{dept.name}</span>
                      <span className="text-[10px] text-slate-400">Ver &rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enlaces Rápidos de Navegación (Deslizables en Tablet/Móvil + Fijos en Desktop) */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap px-2">
          <Link href="/catalogo/01" className="hover:text-catador-amber transition-colors py-1">
            Licores
          </Link>
          <Link href="/catalogo/09" className="hover:text-catador-amber transition-colors py-1">
            Cervezas
          </Link>
          <Link href="/catalogo/11" className="hover:text-catador-amber transition-colors py-1">
            Alimentos
          </Link>
          <Link href="/catalogo/02" className="hover:text-catador-amber transition-colors py-1">
            Refrescos
          </Link>
          <Link href="/catalogo/05" className="hover:text-catador-amber transition-colors py-1 hidden md:inline">
            Confitería
          </Link>
          <Link href="/catalogo" className="hover:text-catador-amber transition-colors font-bold text-catador-amber py-1">
            Ver Todo el Catálogo
          </Link>
        </div>

        {/* Botón Ofertas del Día Destacado */}
        <Link
          href="#ofertas"
          className="flex items-center gap-1.5 bg-catador-blue-light/70 hover:bg-catador-blue-light text-white text-xs font-extrabold px-3 py-2 min-h-[44px] rounded-lg border border-catador-amber/40 transition-colors shrink-0"
        >
          <Flame className="h-4 w-4 text-catador-amber fill-catador-amber shrink-0" />
          <span className="whitespace-nowrap">Ofertas del Día</span>
        </Link>
      </div>
    </nav>
  );
}
