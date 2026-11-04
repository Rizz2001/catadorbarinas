'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Truck,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  Image as ImageIcon,
  Camera,
  Menu,
  X,
  Sliders,
  Award,
  Search,
} from 'lucide-react';
import { signOutUser } from '@/services/auth.service';
import { cn } from '@/lib/utils';

interface NavGroup {
  groupLabel: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    exact: boolean;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Operaciones en Vivo',
    items: [
      { href: '/admin/pedidos', label: 'Despacho y Pedidos', icon: Truck, exact: false },
      { href: '/admin/busquedas', label: 'Inteligencia de Búsquedas', icon: Search, exact: true },
    ],
  },
  {
    groupLabel: 'Catálogo y Portada',
    items: [
      { href: '/admin/catalogo-config', label: 'Artículos, Cajas y Secciones', icon: Sliders, exact: true },
      { href: '/admin/productos', label: 'Fotografías WebP (SKU)', icon: Camera, exact: true },
      { href: '/admin/banners', label: 'Banners y Departamentos', icon: ImageIcon, exact: true },
      { href: '/admin/aliados', label: 'Marcas Aliadas y FAQ', icon: Award, exact: true },
    ],
  },
  {
    groupLabel: 'Sistema y Accesos',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios y Permisos', icon: Users, exact: true },
      { href: '/admin/configuracion', label: 'Negocio, BCV y Delivery GPS', icon: Settings, exact: true },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <>
      <div className="p-4 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-catador-amber flex items-center justify-center font-black text-white text-xs tracking-tight">
              GC
            </div>
            <div>
              <h2 className="text-xs font-black text-white tracking-tight leading-none">
                Gran Catador CMS
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Depósito 01 • Barinas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {group.groupLabel}
              </span>
              <nav className="space-y-0.5 text-xs">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg font-semibold transition-colors border-l-2',
                        isActive
                          ? 'border-l-catador-amber bg-slate-800/90 text-white font-bold'
                          : 'border-l-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-catador-amber' : 'text-slate-500'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 border-t border-slate-800/80 space-y-1 text-xs">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Ver Tienda en Vivo</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden bg-[#0B1120] text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-catador-amber flex items-center justify-center font-black text-xs text-white">
            GC
          </div>
          <span className="text-xs font-black tracking-tight">Gran Catador • Consola CMS</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B1120] text-slate-300 flex flex-col justify-between h-full z-10 border-r border-slate-800">
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-[#0B1120] text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/90">
        {navContent}
      </aside>
    </>
  );
}
