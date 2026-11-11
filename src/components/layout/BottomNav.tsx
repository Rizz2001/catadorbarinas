'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Tag, ShoppingBag, User, ArrowRight, ChevronUp } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatUsd, formatVes } from '@/lib/currency';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { openCart, isOpen } = useCartStore();
  const { itemCount, subtotalUsd, subtotalVes } = useCartTotals();

  if (pathname.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  const hideFloatingCartBar =
    itemCount === 0 ||
    isOpen ||
    pathname === '/carrito' ||
    pathname.startsWith('/producto/') ||
    pathname === '/login' ||
    pathname === '/registro';

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home, exact: true },
    { href: '/catalogo', label: 'Catálogo', icon: LayoutGrid, exact: false },
    { href: '/#ofertas', label: 'Ofertas', icon: Tag, exact: true },
    { href: '#cart', label: 'Carrito', icon: ShoppingBag, isCart: true },
    { href: '/cuenta', label: 'Mi Cuenta', icon: User, exact: false },
  ];

  return (
    <>
      {!hideFloatingCartBar && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] left-3 right-3 z-40 md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-catador-blue-dark/95 backdrop-blur-md text-white p-2.5 pl-3.5 shadow-xl border border-white/10">
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left active:opacity-80 cursor-pointer"
              aria-label="Abrir resumen rápido del carrito"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-catador-amber text-white font-black text-xs">
                {itemCount}
                <ChevronUp className="h-3 w-3 absolute -top-1 -right-1 rounded-full bg-catador-blue-dark text-catador-amber-oak" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-sm font-black text-white leading-none">
                    {formatUsd(subtotalUsd)}
                  </span>
                  <span className="text-xs font-bold text-catador-amber-oak truncate">
                    · {formatVes(subtotalVes)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  Toca para ver carrito o cajas
                </p>
              </div>
            </button>

            <Link
              href="/checkout"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-catador-blue hover:bg-catador-blue-light border border-white/15 px-4 py-2.5 text-xs font-extrabold text-white active:scale-95 transition-all"
            >
              <span>Pagar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegación Móvil"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] pb-[calc(env(safe-area-inset-bottom)+0.25rem)]"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCartActive = Boolean(item.isCart && (isOpen || pathname === '/carrito'));
            const isActive = item.isCart
              ? isCartActive
              : item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const content = (
              <>
                <div
                  className={cn(
                    'relative flex items-center justify-center transition-all duration-150',
                    isActive
                      ? 'h-9 w-9 rounded-[14px_14px_14px_4px] bg-catador-blue text-white shadow-xs'
                      : 'h-8 w-8 text-slate-500'
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.isCart && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-catador-discount text-[10px] font-black text-white tabular-nums">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] mt-0.5 leading-none',
                    isActive ? 'text-catador-blue font-extrabold' : 'text-slate-600 font-semibold'
                  )}
                >
                  {item.label}
                </span>
              </>
            );

            if (item.isCart) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={openCart}
                  className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 active:scale-95 transition-transform cursor-pointer"
                  aria-label={`Ver carrito de compras con ${itemCount} productos`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
