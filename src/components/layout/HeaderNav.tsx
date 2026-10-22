'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Flame, Sparkles } from 'lucide-react';
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
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="flex items-center gap-2.5 bg-catador-amber hover:bg-catador-amber-dark text-white px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <Menu className="h-4 w-4" />
            <span>Departamentos</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', isDeptOpen && 'rotate-180')}
            />
          </button>

          {/* Menú Desplegable de Departamentos */}
          {isDeptOpen && (
            <div className="absolute top-full left-0 w-64 bg-white text-slate-800 shadow-xl border border-slate-200 rounded-b-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {DEPARTMENTS.map((dept) => (
                <Link
                  key={dept.id}
                  href={`#${dept.slug}`}
                  onClick={() => setIsDeptOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 hover:text-catador-blue transition-colors"
                >
                  <span>{dept.name}</span>
                  <span className="text-[10px] text-slate-600">Ver todo</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Enlaces Rápidos de Navegación */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold">
          <Link href="#licores-vinos" className="hover:text-catador-amber transition-colors">
            Licores & Vinos
          </Link>
          <Link href="#viveres" className="hover:text-catador-amber transition-colors">
            Víveres & Despensa
          </Link>
          <Link href="#charcuteria-quesos" className="hover:text-catador-amber transition-colors">
            Charcutería & Quesos
          </Link>
          <Link href="#carniceria" className="hover:text-catador-amber transition-colors">
            Carnicería
          </Link>
          <Link href="#snacks-dulces" className="hover:text-catador-amber transition-colors">
            Snacks & Dulces
          </Link>
          <Link href="#bebidas-refrescos" className="hover:text-catador-amber transition-colors">
            Bebidas
          </Link>
        </div>

        {/* Botón Ofertas del Día Destacado */}
        <Link
          href="#ofertas"
          className="flex items-center gap-1.5 bg-catador-blue-light/70 hover:bg-catador-blue-light text-white text-xs font-extrabold px-3 py-2 rounded-lg border border-catador-amber/40 transition-colors animate-pulse-subtle"
        >
          <Flame className="h-4 w-4 text-catador-amber fill-catador-amber" />
          <span>Ofertas del Día</span>
        </Link>
      </div>
    </nav>
  );
}
