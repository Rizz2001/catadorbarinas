'use client';

import Link from 'next/link';
import { Truck, Users, Settings, Sliders, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMobileBottomBarProps {
  pathname: string;
  onOpenDrawer: () => void;
}

export function AdminMobileBottomBar({
  pathname,
  onOpenDrawer,
}: AdminMobileBottomBarProps) {
  const links = [
    { href: '/admin/pedidos', label: 'Pedidos', icon: Truck, active: pathname.startsWith('/admin/pedidos') },
    { href: '/admin/catalogo-config', label: 'Catálogo', icon: Sliders, active: pathname === '/admin/catalogo-config' },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, active: pathname === '/admin/usuarios' },
    { href: '/admin/configuracion', label: 'Ajustes', icon: Settings, active: pathname === '/admin/configuracion' },
  ];

  return (
    <nav
      aria-label="Navegación rápida de administración"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
                item.active ? 'text-catador-amber-oak font-black' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5}/>
              <span className="text-[10px] font-bold mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5 shrink-0" strokeWidth={1.5}/>
          <span className="text-[10px] font-bold mt-1 leading-none">Más</span>
        </button>
      </div>
    </nav>
  );
}

