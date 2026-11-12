'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Store,
  Bike,
} from 'lucide-react';
import { signOutUser } from '@/services/auth.service';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { QuickDeliveryCalculatorModal } from './QuickDeliveryCalculatorModal';
import { AdminMobileBottomBar } from './AdminMobileBottomBar';
import { ADMIN_NAV_GROUPS } from './admin-nav-config';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const logoUrl = storeConfig?.logo_url;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deliveryCalcOpen, setDeliveryCalcOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <>
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {logoUrl && logoUrl !== '/logo-catador.svg' ? (
              <div className="relative h-10 w-11 rounded-xl bg-white p-1 shrink-0 overflow-hidden shadow-sm">
                <Image
                  src={logoUrl}
                  alt={storeConfig?.nombre_tienda || 'EL CATADOR.'}
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-catador-amber-oak flex items-center justify-center font-black text-slate-950 text-sm shadow-sm">
                EC
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-none">
                {storeConfig?.nombre_tienda || 'EL CATADOR.'} CMS
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Bodegón · Barinas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" strokeWidth={1.5}/>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDeliveryCalcOpen(true)}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/15 border border-catador-amber-oak/40 text-catador-amber-oak hover:text-white hover:bg-amber-500/25 text-xs font-black transition-colors cursor-pointer"
        >
          <Bike className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
          <span>Cotizador de Delivery</span>
        </button>

        <div className="space-y-5">
          {ADMIN_NAV_GROUPS.map((group) => (
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
                        'flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl font-bold transition-colors text-[13px] border',
                        isActive
                          ? 'bg-amber-500/15 border-catador-amber-oak/40 text-catador-amber-oak'
                          : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-catador-amber-oak' : 'text-slate-400')} strokeWidth={1.5}/>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2 text-sm bg-[#090F1D]">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-bold transition-colors text-[13px]"
        >
          <ArrowLeft className="h-4 w-4 text-catador-amber-oak" strokeWidth={1.5}/>
          <span>Ver Tienda en Vivo</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 font-bold transition-colors cursor-pointer text-[13px]"
        >
          <LogOut className="h-4 w-4 text-rose-400" strokeWidth={1.5}/>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden bg-[#0F172A] text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-catador-amber-oak flex items-center justify-center font-black text-xs text-slate-950">
            EC
          </div>
          <div>
            <span className="text-xs font-black tracking-tight block text-white leading-none">
              EL CATADOR.
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Panel CMS</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-colors"
          >
            <Store className="h-3.5 w-3.5 text-catador-amber-oak" strokeWidth={1.5}/>
            <span>Tienda</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-colors"
            aria-label="Abrir menú completo"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5}/>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-80 max-w-[88vw] bg-[#0F172A] text-slate-300 flex flex-col justify-between h-full z-10 border-r border-slate-800 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      <AdminMobileBottomBar pathname={pathname} onOpenDrawer={() => setMobileOpen(true)} />

      <aside className="hidden md:flex w-64 bg-[#0F172A] text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
        {navContent}
      </aside>

      <QuickDeliveryCalculatorModal isOpen={deliveryCalcOpen} onClose={() => setDeliveryCalcOpen(false)} />
    </>
  );
}
