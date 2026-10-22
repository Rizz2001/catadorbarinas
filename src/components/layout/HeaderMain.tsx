'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Heart, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatUsd } from '@/lib/currency';
import { DEPARTMENTS } from '@/constants/config';

export function HeaderMain() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const openCart = useCartStore((state) => state.openCart);
  const totals = useCartTotals();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Búsqueda interactiva
      console.log('Buscando:', searchTerm, 'en categoría:', selectedCategory);
    }
  };

  return (
    <div className="bg-white py-3.5 border-b border-slate-200">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4 lg:gap-8">
        {/* Logotipo Oficial */}
        <Link href="/" className="shrink-0 flex items-center">
          <div className="relative h-12 w-48 sm:w-56">
            <Image
              src="/logo-catador.svg"
              alt="Gran Catador / Distribuidora Bodegón del Catador"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Buscador Central Redondeado (Estilo Retail High-Density) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-2xl items-center rounded-full border-2 border-catador-blue bg-white p-1 pl-4 shadow-xs focus-within:ring-2 focus-within:ring-catador-blue/20"
        >
          {/* Selector de Departamento Integrado */}
          <div className="relative shrink-0 border-r border-slate-200 pr-2 mr-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.slug}>
                  {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Input de Búsqueda */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar licores, víveres, charcutería, snacks..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {/* Botón Lupa Azul Rey */}
          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-catador-blue text-white hover:bg-catador-blue-light transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Acciones de Usuario & Carrito */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Favoritos */}
          <button
            type="button"
            className="hidden sm:flex items-center text-slate-700 hover:text-catador-blue transition-colors"
            aria-label="Lista de Deseos"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Usuario / Mi Cuenta */}
          <button
            type="button"
            className="flex items-center gap-2 text-slate-700 hover:text-catador-blue transition-colors"
            aria-label="Mi Cuenta"
          >
            <User className="h-5 w-5" />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-[10px] text-slate-600 leading-tight">Bienvenido</span>
              <span className="text-xs font-bold text-slate-800">Mi Cuenta</span>
            </div>
          </button>

          {/* Disparador de Carrito con Total en USD y Badge */}
          <button
            onClick={openCart}
            type="button"
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 p-2 sm:px-3 sm:py-2 border border-slate-200 transition-colors"
            aria-label="Abrir Carrito de Compras"
          >
            <div className="relative flex items-center justify-center text-catador-blue">
              <ShoppingBag className="h-6 w-6" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-catador-amber text-[10px] font-black text-white shadow-xs animate-scale-in">
                  {totals.itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-600 leading-tight">Mi Carrito</span>
              <span className="text-xs font-extrabold text-catador-blue">
                {formatUsd(totals.totalUsd)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
