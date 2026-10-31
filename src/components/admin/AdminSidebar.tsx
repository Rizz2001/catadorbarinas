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
  Shield,
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

const navItems = [
  { href: '/admin/pedidos', label: 'Despacho & Pedidos', icon: Truck, exact: false },
  { href: '/admin/catalogo-config', label: 'Artículos, Cajas & Secciones', icon: Sliders, exact: true },
  { href: '/admin/banners', label: 'Banners & Promociones', icon: ImageIcon, exact: true },
  { href: '/admin/aliados', label: 'Empresas Aliadas & FAQ', icon: Award, exact: true },
  { href: '/admin/busquedas', label: 'Búsquedas de Usuarios', icon: Search, exact: true },
  { href: '/admin/productos', label: 'Fotos de Productos WebP', icon: Camera, exact: true },
  { href: '/admin/usuarios', label: 'Usuarios & Roles', icon: Users, exact: true },
  { href: '/admin/configuracion', label: 'Configuración & Delivery GPS', icon: Settings, exact: true },
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
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-catador-amber flex items-center justify-center font-black text-white text-xs shadow-xs">
              GC
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">
                Gran Catador CMS
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                <Shield className="h-3 w-3" />
                <span>Administración</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1.5 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl font-bold transition-all',
                  isActive
                    ? 'bg-catador-blue text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1.5 text-xs">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la Tienda</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 font-medium transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Barra Superior en Móvil */}
      <div className="md:hidden bg-slate-900 text-white p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-catador-amber flex items-center justify-center font-black text-xs text-white">
            GC
          </div>
          <span className="text-xs font-black uppercase tracking-wider">CMS Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer Móvil con Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col justify-between h-full shadow-2xl z-10">
            {navContent}
          </aside>
        </div>
      )}

      {/* Sidebar Fijo en Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
        {navContent}
      </aside>
    </>
  );
}
