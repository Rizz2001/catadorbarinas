'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart } from 'lucide-react';
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
    <div className="bg-white py-2.5 sm:py-3 border-b border-slate-200">
      <div className="container mx-auto px-3 sm:px-4 space-y-2.5 md:space-y-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Logotipo Oficial */}
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <div
              className="relative transition-all duration-150 flex items-center"
              style={{
                height: `${logoAlto}px`,
                width: `${logoAncho}px`,
                maxHeight: `${Math.min(56, Math.max(40, logoAlto))}px`,
                maxWidth: 'min(42vw, 280px)',
              }}
            >
              <Image
                src={logoUrl}
                alt={storeConfig?.nombre_tienda || 'Gran Catador / Distribuidora Bodegón del Catador'}
                fill
                priority
                sizes="(max-width: 480px) 135px, (max-width: 768px) 180px, 240px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Buscador Central Desktop */}
          <div className="hidden md:flex flex-col flex-1 max-w-2xl">
            <HeaderSearch />
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 overflow-hidden">
              <span className="font-extrabold text-slate-600 shrink-0 text-[10px] uppercase tracking-wider">
                Popular:
              </span>
              <div className="flex items-center gap-2 overflow-hidden truncate">
                {[
                  { name: "Buchanan's", query: "Buchanan's" },
                  { name: 'Santa Teresa 1796', query: 'Santa Teresa' },
                  { name: 'Polar Pilsen', query: 'Polar' },
                  { name: 'Corona', query: 'Corona' },
                  { name: 'Harina P.A.N.', query: 'Harina' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={`/buscar?q=${encodeURIComponent(item.query)}`}
                    className="text-slate-600 hover:text-catador-blue hover:underline whitespace-nowrap transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones de Usuario & Carrito */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Favoritos */}
            <button
              type="button"
              className="hidden sm:flex items-center justify-center min-h-[40px] min-w-[40px] text-slate-700 hover:text-catador-blue transition-colors cursor-pointer rounded-xl hover:bg-slate-50"
              aria-label="Lista de Deseos"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Usuario / Mi Cuenta Dinámico con Control de Roles */}
            <UserNavMenu />

            {/* Disparador de Carrito con Total en USD y Badge */}
            <Link
              href="/carrito"
              className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 min-h-[44px] px-2.5 sm:px-3 py-1.5 border border-slate-200 transition-colors shrink-0"
              aria-label="Ver Carrito de Compras"
            >
              <div className="relative flex items-center justify-center text-catador-blue">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                {totals.itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-catador-amber text-[10px] font-black text-white shadow-xs animate-scale-in">
                    {totals.itemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-600 leading-tight hidden sm:block">Mi Carrito</span>
                <span className="text-xs font-extrabold text-catador-blue font-mono">
                  {formatUsd(totals.totalUsd)}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Buscador en Móvil (visible bajo el logo) */}
        <div className="block md:hidden w-full pt-0.5">
          <HeaderSearch />
        </div>
      </div>
    </div>
  );
}
