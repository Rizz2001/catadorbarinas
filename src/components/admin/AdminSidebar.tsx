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
  Store,
  Bike,
} from 'lucide-react';
import { signOutUser } from '@/services/auth.service';
import { QuickDeliveryCalculatorModal } from './QuickDeliveryCalculatorModal';
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
  const [deliveryCalcOpen, setDeliveryCalcOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <>
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-catador-amber flex items-center justify-center font-black text-white text-sm shadow-md">
              EC
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-none">
                EL CATADOR. CMS
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Bodegón • Barinas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Acceso directo al Cotizador de Delivery Oficial */}
        <div>
          <button
            type="button"
            onClick={() => setDeliveryCalcOpen(true)}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-linear-to-r from-amber-500/20 to-catador-blue/30 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/30 text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            <Bike className="h-4 w-4 text-amber-400" />
            <span>Cotizador de Delivery</span>
          </button>
        </div>

        <div className="space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1.5">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {group.groupLabel}
              </span>
              <nav className="space-y-1">
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
                        'flex items-center gap-3 px-3.5 py-3 min-h-[46px] rounded-xl font-bold transition-colors border-l-3 text-sm',
                        isActive
                          ? 'border-l-catador-amber bg-slate-800 text-white'
                          : 'border-l-transparent text-slate-300 hover:text-white hover:bg-slate-900/80'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-catador-amber' : 'text-slate-400'
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

      <div className="p-4 border-t border-slate-800 space-y-2 text-sm bg-[#080d19]">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3.5 py-3 min-h-[46px] rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 font-bold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-catador-amber" />
          <span>Ver Tienda en Vivo</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-3 min-h-[46px] rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 font-bold transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-rose-400" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Barra Superior Móvil - Clara y accesible */}
      <div className="md:hidden bg-[#0B1120] text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-catador-amber flex items-center justify-center font-black text-xs text-white shadow-sm">
            GC
          </div>
          <div>
            <span className="text-xs font-black tracking-tight block text-white leading-none">
              Gran Catador
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Panel de Control</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-catador-amber" />
            <span>Tienda</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-colors"
            aria-label="Abrir menú completo"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-over Drawer para Móviles */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-80 max-w-[88vw] bg-[#0B1120] text-slate-300 flex flex-col justify-between h-full z-10 border-r border-slate-800 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      {/* Barra de Navegación Inferior Fija para Móviles (Senior-Friendly Touch Nav) */}
      <nav
        aria-label="Navegación rápida de administración"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-2xl"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Pedidos */}
          <Link
            href="/admin/pedidos"
            className={cn(
              'flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
              pathname.startsWith('/admin/pedidos')
                ? 'text-catador-amber font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Truck className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-1 leading-none">Pedidos</span>
          </Link>

          {/* 2. Catálogo */}
          <Link
            href="/admin/catalogo-config"
            className={cn(
              'flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
              pathname === '/admin/catalogo-config'
                ? 'text-catador-amber font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Sliders className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-1 leading-none">Catálogo</span>
          </Link>

          {/* 3. Usuarios */}
          <Link
            href="/admin/usuarios"
            className={cn(
              'flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
              pathname === '/admin/usuarios'
                ? 'text-catador-amber font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Users className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-1 leading-none">Usuarios</span>
          </Link>

          {/* 4. Ajustes */}
          <Link
            href="/admin/configuracion"
            className={cn(
              'flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors',
              pathname === '/admin/configuracion'
                ? 'text-catador-amber font-black'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-1 leading-none">Ajustes</span>
          </Link>

          {/* 5. Menú Completo */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold mt-1 leading-none">Más</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Fijo para Escritorio (>= 768px) */}
      <aside className="hidden md:flex w-64 bg-[#0B1120] text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/90">
        {navContent}
      </aside>

      {/* Modal Cotizador Rápido de Delivery */}
      <QuickDeliveryCalculatorModal
        isOpen={deliveryCalcOpen}
        onClose={() => setDeliveryCalcOpen(false)}
      />
    </>
  );
}
