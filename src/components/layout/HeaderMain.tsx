'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { formatUsd } from '@/lib/currency';
import { HeaderSearch } from './HeaderSearch';
import { UserNavMenu } from '@/components/auth';

export function HeaderMain() {
  const totals = useCartTotals();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const logoUrl = storeConfig?.logo_url || '/logo-catador.svg';
  const logoAlto = storeConfig?.logo_alto_px || 44;
  const logoAncho = storeConfig?.logo_ancho_px || 200;

  return (
    <div className="bg-white py-3 border-b border-slate-200">
      <div className="container mx-auto px-4 space-y-2.5 md:space-y-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Logotipo Oficial */}
          <Link href="/" className="shrink-0 flex items-center">
            <div
              className="relative transition-all duration-150 flex items-center"
              style={{
                height: `${logoAlto}px`,
                width: `${logoAncho}px`,
                maxHeight: `${Math.max(84, logoAlto)}px`,
                maxWidth: 'min(48vw, 340px)',
              }}
            >
              <Image
                src={logoUrl}
                alt={storeConfig?.nombre_tienda || 'Gran Catador / Distribuidora Bodegón del Catador'}
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Buscador Central Desktop */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <HeaderSearch />
          </div>

          {/* Acciones de Usuario & Carrito */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Favoritos */}
            <button
              type="button"
              className="hidden sm:flex items-center text-slate-700 hover:text-catador-blue transition-colors cursor-pointer"
              aria-label="Lista de Deseos"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Usuario / Mi Cuenta Dinámico con Control de Roles */}
            <UserNavMenu />

            {/* Disparador de Carrito con Total en USD y Badge */}
            <Link
              href="/carrito"
              className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 p-1.5 sm:px-3 sm:py-2 border border-slate-200 transition-colors shrink-0"
              aria-label="Ver Carrito de Compras"
            >
              <div className="relative flex items-center justify-center text-catador-blue">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                {totals.itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-catador-amber text-[10px] font-black text-white shadow-xs animate-scale-in">
                    {totals.itemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-600 leading-tight hidden sm:block">Mi Carrito</span>
                <span className="text-xs font-extrabold text-catador-blue">
                  {formatUsd(totals.totalUsd)}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Buscador en Móvil (visible bajo el logo) */}
        <div className="block md:hidden w-full pt-1">
          <HeaderSearch />
        </div>
      </div>
    </div>
  );
}
