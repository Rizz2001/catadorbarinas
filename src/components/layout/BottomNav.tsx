'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingBag, User, ArrowRight, ChevronUp } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatUsd, formatVes } from '@/lib/currency';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { openCart, isOpen } = useCartStore();
  const { itemCount, subtotalUsd, subtotalVes } = useCartTotals();

  // Ocultar la barra en rutas de checkout o admin para maximizar concentración y espacio
  if (pathname.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  const hideFloatingCartBar =
    itemCount === 0 ||
    isOpen ||
    pathname === '/carrito' ||
    pathname === '/login' ||
    pathname === '/registro';

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home, exact: true },
    { href: '/catalogo', label: 'Catálogo', icon: LayoutGrid, exact: false },
    { href: '/buscar', label: 'Buscar', icon: Search, exact: true },
    { href: '#cart', label: 'Carrito', icon: ShoppingBag, isCart: true },
    { href: '/cuenta', label: 'Mi Cuenta', icon: User, exact: false },
  ];

  return (
    <>
      {/* Barra Flotante de Compra Rápida en Móviles */}
      {!hideFloatingCartBar && (
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] left-3 right-3 z-40 md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white p-2.5 pl-3.5 shadow-xl border border-slate-700/80">
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left active:opacity-80 cursor-pointer"
              aria-label="Abrir resumen rápido del carrito"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-catador-amber text-white font-black text-xs shadow-xs">
                {itemCount}
                <ChevronUp className="h-3 w-3 absolute -top-1 -right-1 rounded-full bg-slate-900 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-white leading-none">
                    {formatUsd(subtotalUsd)}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 font-mono truncate">
                    • {formatVes(subtotalVes)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  Toca para editar cantidades o cajas
                </p>
              </div>
            </button>

            <Link
              href="/checkout"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-3.5 py-2.5 text-xs font-extrabold text-white shadow-md active:scale-95 transition-all"
            >
              <span>Pagar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegación Móvil"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[calc(env(safe-area-inset-bottom)+0.25rem)]"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : item.href !== '#cart' && pathname.startsWith(item.href);

            if (item.isCart) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={openCart}
                  className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-slate-600 hover:text-catador-blue active:scale-95 transition-transform cursor-pointer"
                  aria-label={`Ver carrito de compras con ${itemCount} productos`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="h-5 w-5 text-catador-blue" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-catador-amber text-[9px] font-black text-white shadow-xs">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-catador-blue leading-none">
                    Carrito
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer',
                  isActive
                    ? 'text-catador-blue font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                )}
              >
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                <span className="text-[10px] mt-1 leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-catador-blue" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
