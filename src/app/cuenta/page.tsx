'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Save, Loader2, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { PedidoConDetalles } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

function CuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [userOrders, setUserOrders] = useState<PedidoConDetalles[]>([]);
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos'>(
    tabParam === 'pedidos' ? 'pedidos' : 'perfil'
  );

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (tabParam === 'pedidos') {
      const timer = setTimeout(() => setActiveTab('pedidos'), 0);
      return () => clearTimeout(timer);
    }
  }, [tabParam]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        // Validar sesión con getUser() de @supabase/ssr y fallback a getSession()
        let currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) {
          const session = (await supabase.auth.getSession()).data.session;
          currentUser = session?.user || null;
        }

        if (!currentUser) {
          window.location.replace('/login?redirect=/cuenta');
          return;
        }

        if (!mounted) return;
        setUser(currentUser);

        // Cargar Perfil
        const { data: p } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (p && mounted) {
          const prof = p as PerfilRow;
          setPerfil(prof);
          setFormData({
            nombre: prof.nombre || '',
            cedula: prof.cedula || '',
            telefono: prof.telefono || '',
            direccion: prof.direccion || '',
          });
        }

        // Cargar Pedidos del Usuario
        const res = await fetch('/api/pedidos');
        if (res.ok && mounted) {
          const json = await res.json();
          if (Array.isArray(json.orders)) {
            const myOrders = json.orders.filter(
              (o: PedidoConDetalles) =>
                o.usuario_id === currentUser.id ||
                (p?.cedula && o.cliente_cedula === p.cedula) ||
                (p?.telefono && o.cliente_telefono === p.telefono)
            );
            setUserOrders(myOrders);
          }
        }
      } catch (err) {
        console.error('Error cargando cuenta:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono,
        direccion: formData.direccion,
        updated_at: new Date().toISOString(),
      };

      let error = null;
      if (perfil) {
        const res = await supabase
          .from('perfiles')
          .update(payload)
          .eq('id', user.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('perfiles')
          .upsert({
            id: user.id,
            ...payload,
            rol: 'cliente',
          });
        error = res.error;
      }

      if (error) throw error;

      setPerfil((prev) =>
        prev
          ? { ...prev, ...payload }
          : ({ id: user.id, ...payload, rol: 'cliente' } as PerfilRow)
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      console.error('Error guardando perfil:', err);
      const errObj = err as { message?: string; details?: string; hint?: string };
      const msg =
        errObj?.message ||
        errObj?.details ||
        (err instanceof Error ? err.message : 'Error al guardar los datos');
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-catador-blue" />
        <p className="text-xs text-slate-500 font-bold">Cargando tu cuenta...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Mi Cuenta</h1>
          <p className="text-xs text-slate-500">Administra tus datos personales y rastrea tus pedidos en vivo</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-catador-blue text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Datos Personales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-catador-blue text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Mis Pedidos</span>
            {userOrders.length > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-catador-amber text-white text-[10px] flex items-center justify-center font-black">
                {userOrders.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* PESTAÑA: DATOS PERSONALES */}
      {activeTab === 'perfil' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-catador-blue text-white flex items-center justify-center font-black text-base shadow-2xs">
              {perfil?.nombre?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{perfil?.nombre || 'Usuario Registrado'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Tus datos han sido actualizados con éxito.</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>Error al guardar datos: {saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cédula o RIF</label>
                <input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dirección Predeterminada en Barinas</label>
              <textarea
                rows={2}
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Sector, calle, casa o punto de referencia"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-5 py-2.5 font-bold text-white transition-colors cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Guardar Cambios</span>
            </button>
          </form>
        </section>
      )}

      {/* PESTAÑA: MIS PEDIDOS */}
      {activeTab === 'pedidos' && (
        <section className="space-y-3">
          {userOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 space-y-2">
              <Package className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700">Aún no tienes pedidos registrados</p>
              <p className="text-xs text-slate-400">Cuando realices compras en la tienda, aparecerán aquí para seguimiento en vivo.</p>
              <Link
                href="/catalogo"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-catador-blue px-4 py-2 text-xs font-bold text-white"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-catador-blue/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">#{order.numero_orden}</span>
                      <span className="bg-blue-50 text-catador-blue border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                        {order.estado_pedido}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1" suppressHydrationWarning>
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleDateString('es-VE')}
                      </span>
                      <span>•</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 pt-1">
                      {formatUsd(order.total_usd)} <span className="text-[11px] text-slate-500 font-normal">({formatVes(order.total_ves)})</span>
                    </p>
                  </div>

                  <Link
                    href={`/pedidos/${order.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>Ver Sala de Tracking & Chat</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default function CuentaPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-catador-blue" />
          <p className="text-xs text-slate-500 font-bold">Cargando...</p>
        </main>
      }
    >
      <CuentaContent />
    </Suspense>
  );
}
