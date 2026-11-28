'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Bike, LogOut, Menu, Store, X } from 'lucide-react';
import { signOutUser } from '@/services/auth.service';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { ADMIN_ORDER_INSERTED_EVENT } from '@/lib/sound';
import { OFFICIAL_LOGO_ALT, resolveOfficialLogo } from '@/constants/config';
import { cn } from '@/lib/utils';
import { QuickDeliveryCalculatorModal } from './QuickDeliveryCalculatorModal';
import { AdminMobileBottomBar } from './AdminMobileBottomBar';
import { ADMIN_NAV_GROUPS } from './admin-nav-config';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const fetchConfig = useStoreConfigStore((state) => state.fetchConfig);
  const logoUrl = resolveOfficialLogo(storeConfig?.logo_url);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deliveryCalcOpen, setDeliveryCalcOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) return;
      const data = (await res.json()) as { orders?: Array<{ estado_pedido?: string }> };
      if (!Array.isArray(data.orders)) return;
      const count = data.orders.filter((o) => o.estado_pedido === 'recibido').length;
      setPendingCount(count);
    } catch {
      // Silencioso en navegación global
    }
  }, []);

  useEffect(() => {
    if (!storeConfig) void fetchConfig();
    const timer = setTimeout(() => { void loadPendingCount(); }, 0);
    const onOrderChange = () => { void loadPendingCount(); };
    window.addEventListener(ADMIN_ORDER_INSERTED_EVENT, onOrderChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(ADMIN_ORDER_INSERTED_EVENT, onOrderChange);
    };
  }, [fetchConfig, loadPendingCount, storeConfig]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <>
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-9 w-10 rounded-lg bg-white p-1 shrink-0 overflow-hidden shadow-xs">
              <Image src={logoUrl} alt={OFFICIAL_LOGO_ALT} fill sizes="40px" className="object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                {storeConfig?.nombre_tienda || 'EL CATADOR.'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">Panel Operativo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => { setMobileOpen(false); setDeliveryCalcOpen(true); }}
          className="w-full min-h-[40px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:text-white hover:bg-amber-500/25 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Bike className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Cotizador Delivery</span>
        </button>

        <div className="space-y-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                {group.groupLabel}
              </span>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'relative flex items-center justify-between gap-2.5 px-3 py-2.5 min-h-[40px] rounded-lg font-medium transition-colors text-[13px]',
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-catador-amber-oak" />
                      )}
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn('h-4 w-4 shrink-0', isActive ? 'text-catador-amber-oak' : 'text-slate-400')}
                          strokeWidth={isActive ? 2 : 1.6}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.showPendingBadge && pendingCount > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center tabular-nums">
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 border-t border-white/10 space-y-1 bg-[#0B1222]">
        <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg text-slate-200 hover:text-white hover:bg-white/5 font-medium transition-colors text-[13px]">
          <ArrowLeft className="h-4 w-4 text-catador-amber-oak" strokeWidth={1.75} />
          <span>Ver Tienda</span>
        </Link>
        <button type="button" onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 font-medium transition-colors cursor-pointer text-[13px]">
          <LogOut className="h-4 w-4 text-rose-400" strokeWidth={1.75} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden bg-[#0F172A] text-white px-4 py-2.5 border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-8 w-9 rounded-lg bg-white p-0.5 shrink-0 overflow-hidden">
            <Image src={logoUrl} alt={OFFICIAL_LOGO_ALT} fill sizes="36px" className="object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-tight block text-white leading-none truncate">
              {storeConfig?.nombre_tienda || 'EL CATADOR.'}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Panel Operativo</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-colors">
            <Store className="h-3.5 w-3.5 text-catador-amber-oak" strokeWidth={1.75} />
            <span>Tienda</span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(true)} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/10 text-slate-200 hover:text-white transition-colors" aria-label="Abrir menú completo">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-[#0F172A] text-slate-300 flex flex-col justify-between h-full z-10 border-r border-white/10 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      <AdminMobileBottomBar pathname={pathname} pendingOrdersCount={pendingCount} onOpenDrawer={() => setMobileOpen(true)} />

      <aside className="hidden md:flex w-60 bg-[#0F172A] text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
        {navContent}
      </aside>

      <QuickDeliveryCalculatorModal isOpen={deliveryCalcOpen} onClose={() => setDeliveryCalcOpen(false)} />
    </>
  );
}
