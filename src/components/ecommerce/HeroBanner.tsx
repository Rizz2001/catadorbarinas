'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wine, ShoppingBasket, Sandwich, Beef, Cookie, CupSoda } from 'lucide-react';
import { DEPARTMENTS } from '@/constants/config';

export function HeroBanner() {
  const quickCategories = [
    { name: 'Licores', icon: Wine, href: '#licores-vinos' },
    { name: 'Víveres', icon: ShoppingBasket, href: '#viveres' },
    { name: 'Charcutería', icon: Sandwich, href: '#charcuteria-quesos' },
    { name: 'Carnicería', icon: Beef, href: '#carniceria' },
    { name: 'Snacks', icon: Cookie, href: '#snacks-dulces' },
    { name: 'Bebidas', icon: CupSoda, href: '#bebidas-refrescos' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Principal con Degradado Azul Rey */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-catador-blue via-catador-blue-light to-blue-900 p-6 md:p-10 text-white shadow-lg">
        {/* Adorno visual de fondo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-catador-amber/15 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="inline-block rounded-full bg-catador-amber px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              ★ Distribuidora &amp; Bodegón Oficial
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Los Mejores Licores y Víveres Directo a tu Puerta
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
              Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                href="#ofertas"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-catador-blue shadow-md hover:bg-slate-100 transition-colors"
              >
                Ver Ofertas del Día <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#departamentos"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          {/* Destacado de Oferta en Banner */}
          <div className="relative shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-center min-w-[200px]">
            <span className="text-[11px] font-bold text-catador-amber uppercase tracking-wider">
              Combo Parrillero &amp; Whisky
            </span>
            <p className="text-2xl font-black text-white mt-1">$49.99</p>
            <span className="text-[11px] text-blue-200">Ahorra hasta 25% hoy</span>
            <span className="mt-3 rounded-lg bg-catador-amber px-3 py-1 text-[11px] font-extrabold text-white">
              Edición Limitada
            </span>
          </div>
        </div>
      </div>

      {/* Tira Circular de Categorías Rápidas */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {quickCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs hover:border-catador-blue hover:shadow-card transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-catador-blue group-hover:bg-catador-blue group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-catador-blue transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
