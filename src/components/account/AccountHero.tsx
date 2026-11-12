'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Bike, LogOut, Sliders, Package, Truck, MapPin } from 'lucide-react';
import { signOutUser } from '@/services/auth.service';
import { Database } from '@/types/supabase';
import { PedidoConDetalles } from '@/types';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

interface AccountHeroProps {
  user: { id: string; email?: string } | null;
  perfil: PerfilRow | null;
  orders: PedidoConDetalles[];
}

export function AccountHero({ user, perfil, orders }: AccountHeroProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
      router.refresh();
    } catch {
      // Continuar redirección
    }
  };

  const activeOrders = orders.filter(
    (o) => o.estado_pedido === 'recibido' || o.estado_pedido === 'preparando' || o.estado_pedido === 'en_camino'
  );

  const initial = perfil?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-14 w-14 shrink-0 rounded-full bg-catador-blue text-white flex items-center justify-center font-black text-xl border-2 border-catador-amber-oak">
            {initial}
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                {perfil?.nombre || 'Cliente EL CATADOR.'}
              </h1>

              {perfil?.rol === 'admin' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-catador-amber-soft border border-catador-amber-oak/70 px-2.5 py-0.5 text-xs font-black text-[#8B3E03]">
                  <ShieldCheck className="h-3.5 w-3.5 text-catador-amber" strokeWidth={1.5}/>
                  <span>Admin CMS</span>
                </span>
              ) : perfil?.rol === 'repartidor' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-black text-catador-blue">
                  <Bike className="h-3.5 w-3.5" strokeWidth={1.5}/>
                  <span>Repartidor</span>
                </span>
              ) : perfil?.correo_confirmado ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5}/>
                  <span>Correo Confirmado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-catador-amber-soft border border-catador-amber-oak/70 px-2.5 py-0.5 text-xs font-black text-[#8B3E03]">
                  <span className="h-2 w-2 rounded-full bg-catador-amber animate-pulse" />
                  <span>Correo Pendiente</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mt-0.5">
              {user?.email}
              {perfil?.telefono && <span className="text-slate-400"> · {perfil.telefono}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {perfil?.rol === 'admin' && (
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1.5 rounded-full bg-catador-amber-soft hover:bg-[#FDE68A] border border-catador-amber-oak/70 text-[#8B3E03] font-extrabold text-xs px-4 py-2 min-h-[42px] transition-colors cursor-pointer"
            >
              <Sliders className="h-4 w-4" strokeWidth={1.5}/>
              <span>Consola CMS</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-[#F7F8FA] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 font-bold text-xs px-4 py-2 min-h-[42px] transition-colors cursor-pointer"
            title="Cerrar sesión segura"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 rounded-2xl bg-[#F7F8FA] border border-slate-200 divide-x divide-slate-200 tabular-nums">
        <div className="p-3 sm:px-4 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Package className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5}/>
            <span className="hidden sm:inline">Historial</span> Pedidos
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
            {orders.length}
          </span>
        </div>

        <div className="p-3 sm:px-4 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Truck className="h-3.5 w-3.5 text-catador-blue" strokeWidth={1.5}/>
            <span className="hidden sm:inline">Despachos</span> Activos
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-catador-blue">
              {activeOrders.length}
            </span>
            {activeOrders.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        </div>

        <div className="p-3 sm:px-4 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="h-3.5 w-3.5 text-catador-amber" strokeWidth={1.5}/>
            <span>Barinas</span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate mt-1">
            {perfil?.latitud ? 'GPS Vinculado' : perfil?.direccion ? 'Dirección lista' : 'Sin dirección'}
          </span>
        </div>
      </div>
    </div>
  );
}
