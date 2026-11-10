'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, X } from 'lucide-react';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { formatUsd } from '@/lib/currency';
import { HeaderSearch } from './HeaderSearch';
import { UserNavMenu } from '@/components/auth';

const POPULAR_SEARCHES = [
  { name: "Buchanan's", href: "/buscar?q=buchanans" },
  { name: "Santa Teresa 1796", href: "/buscar?q=santa%20teresa%201796" },
  { name: "Polar Pilsen", href: "/buscar?q=polar%20pilsen" },
  { name: "Corona", href: "/buscar?q=corona" },
  { name: "Harina P.A.N.", href: "/buscar?q=harina%20pan" },
];

export function HeaderMain() {
  const totals = useCartTotals();
  const favCount = useWishlistStore((state) => state.items.length);
  const storeConfig = useStoreConfigStore((state) => state.config);
  const { terms: recentTerms, hasLocalTerms, removeTerm, clearAllTerms } = useRecentSearches();

  const logoUrl = storeConfig?.logo_url || '/logo-catador.svg';
  const logoAlto = storeConfig?.logo_alto_px || 44;
  const logoAncho = storeConfig?.logo_ancho_px || 200;

  return (
    <div className="bg-white py-2.5 sm:py-3.5 border-b border-slate-200">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 space-y-2 md:space-y-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 min-w-0">
          {/* Logotipo Oficial Adaptativo */}
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <div
              className="relative transition-all duration-150 flex items-center h-8 xs:h-9 w-[110px] xs:w-[135px] sm:h-11 sm:w-[200px]"
              style={{
                maxHeight: `${Math.min(52, Math.max(32, logoAlto))}px`,
                maxWidth: `${Math.min(240, Math.max(110, logoAncho))}px`,
              }}
            >
              <Image
                src={logoUrl}
                alt={
                  storeConfig?.nombre_tienda ||
                  'Gran Catador / Distribuidora Bodegón del Catador'
                }
                fill
                priority
                sizes="(max-width: 480px) 115px, (max-width: 768px) 180px, 240px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Buscador Central Desktop */}
          <div className="hidden md:flex flex-col flex-1 max-w-2xl min-w-0">
            <HeaderSearch />
            <div className="flex items-center justify-between gap-2 pt-1.5 text-[13px] text-slate-600 overflow-hidden">
              {recentTerms.length > 0 ? (
                <div className="flex items-center gap-1.5 overflow-hidden truncate">
                  <span className="font-bold text-catador-blue shrink-0">
                    RECIENTES:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {recentTerms.map((term, idx) => (
                      <React.Fragment key={term}>
                        <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                          <Link
                            href={`/buscar?q=${encodeURIComponent(term)}`}
                            className="text-slate-700 hover:text-catador-blue font-semibold transition-colors"
                          >
                            {term}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeTerm(term)}
                            title={`Quitar "${term}" de recientes`}
                            aria-label={`Quitar ${term}`}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                        {idx < recentTerms.length - 1 && (
                          <span className="text-slate-300 select-none">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                  <span className="font-black text-catador-blue uppercase tracking-wider text-[11px] shrink-0">
                    POPULAR:
                  </span>
                  {POPULAR_SEARCHES.map((item, idx) => (
                    <React.Fragment key={item.name}>
                      <Link
                        href={item.href}
                        className="text-slate-700 hover:text-catador-blue font-semibold whitespace-nowrap transition-colors"
                      >
                        {item.name}
                      </Link>
                      {idx < POPULAR_SEARCHES.length - 1 && (
                        <span className="text-slate-300 select-none">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {recentTerms.length > 0 && hasLocalTerms && (
                <button
                  type="button"
                  onClick={clearAllTerms}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 shrink-0 transition-colors cursor-pointer ml-auto"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Acciones de Usuario & Carrito */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Favoritos */}
            <Link
              href="/favoritos"
              className="relative flex items-center justify-center h-10 w-10 text-slate-700 hover:text-catador-blue transition-colors cursor-pointer rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
              aria-label="Lista de Favoritos"
            >
              <Heart className="h-5 w-5" />
              {favCount > 0 && (
                <span className="absolute top-1 right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white tabular-nums">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Usuario / Mi Cuenta Dinámico */}
            <UserNavMenu />

            {/* Disparador de Carrito en Naranja (#E07A1F - Acción Principal de Compra) */}
            <Link
              href="/carrito"
              className="flex items-center gap-2 rounded-lg bg-catador-amber hover:bg-catador-amber-dark min-h-[42px] px-3 sm:px-4 py-2 text-white transition-colors shrink-0 tabular-nums"
              aria-label="Ver Carrito de Compras"
            >
              <ShoppingBag className="h-4 w-4 shrink-0 text-white" />
              <span className="hidden sm:inline text-[13px] font-extrabold">
                Carrito
                {totals.itemCount > 0 ? ` (${totals.itemCount})` : ''}
              </span>
              <span className="hidden sm:inline text-amber-200">·</span>
              <span className="text-[13px] font-black">
                {formatUsd(totals.totalUsd)}
              </span>
            </Link>
          </div>
        </div>

        {/* Buscador en Móvil (visible bajo el logo + populares o recientes) */}
        <div className="block md:hidden w-full pt-0.5 space-y-1.5">
          <HeaderSearch />
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs sm:text-[13px] text-slate-600">
            {recentTerms.length > 0 ? (
              <>
                <span className="text-catador-blue font-bold shrink-0">RECIENTES:</span>
                {recentTerms.slice(0, 4).map((term, idx, arr) => (
                  <React.Fragment key={term}>
                    <Link
                      href={`/buscar?q=${encodeURIComponent(term)}`}
                      className="text-slate-700 hover:text-catador-blue font-semibold whitespace-nowrap"
                    >
                      {term}
                    </Link>
                    {idx < arr.length - 1 && <span className="text-slate-300">·</span>}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <>
                <span className="text-catador-blue font-bold shrink-0">POPULAR:</span>
                {POPULAR_SEARCHES.map((item, idx) => (
                  <React.Fragment key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-700 hover:text-catador-blue font-semibold whitespace-nowrap"
                    >
                      {item.name}
                    </Link>
                    {idx < POPULAR_SEARCHES.length - 1 && (
                      <span className="text-slate-300">·</span>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
