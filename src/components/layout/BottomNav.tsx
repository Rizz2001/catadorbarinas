'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const openCart = useCartStore((state) => state.openCart);
  const { itemCount } = useCartTotals();

  // Ocultar la barra en rutas de checkout o admin para maximizar concentración y espacio
  if (pathname.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home, exact: true },
    { href: '/catalogo', label: 'Catálogo', icon: LayoutGrid, exact: false },
    { href: '/buscar', label: 'Buscar', icon: Search, exact: true },
    { href: '#cart', label: 'Carrito', icon: ShoppingBag, isCart: true },
    { href: '/cuenta', label: 'Mi Cuenta', icon: User, exact: false },
  ];

  return (
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
  );
}
