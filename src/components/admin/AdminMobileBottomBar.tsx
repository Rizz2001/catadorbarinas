'use client';

import Link from 'next/link';
import { Truck, Users, Settings, Sliders, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMobileBottomBarProps {
  pathname: string;
  pendingOrdersCount?: number;
  onOpenDrawer: () => void;
}

export function AdminMobileBottomBar({
  pathname,
  pendingOrdersCount = 0,
  onOpenDrawer,
}: AdminMobileBottomBarProps) {
  const links = [
    {
      href: '/admin/pedidos',
      label: 'Pedidos',
      icon: Truck,
      active: pathname.startsWith('/admin/pedidos'),
      badge: pendingOrdersCount,
    },
    { href: '/admin/catalogo-config', label: 'Catálogo', icon: Sliders, active: pathname === '/admin/catalogo-config', badge: 0 },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, active: pathname === '/admin/usuarios', badge: 0 },
    { href: '/admin/configuracion', label: 'Ajustes', icon: Settings, active: pathname === '/admin/configuracion', badge: 0 },
  ];

  return (
    <nav
      aria-label="Navegación rápida de administración"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-white/10 pb-safe shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
                item.active ? 'text-catador-amber-oak font-semibold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {item.active && (
                <span className="absolute top-1.5 h-1 w-5 rounded-full bg-catador-amber-oak" />
              )}
              <span className="relative">
                <Icon className="h-5 w-5 shrink-0" strokeWidth={item.active ? 2 : 1.6} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5 shrink-0" strokeWidth={1.6} />
          <span className="text-[11px] font-medium mt-1 leading-none">Más</span>
        </button>
      </div>
    </nav>
  );
}
