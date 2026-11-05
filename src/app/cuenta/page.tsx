'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Package, Shield, Loader2, ChevronRight, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { PedidoConDetalles } from '@/types';
import { Database } from '@/types/supabase';
import {
  AccountHero,
  AccountProfileTab,
  AccountOrdersTab,
  AccountSecurityTab,
} from '@/components/account';

export const dynamic = 'force-dynamic';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

function CuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [userOrders, setUserOrders] = useState<PedidoConDetalles[]>([]);
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'seguridad'>(
    tabParam === 'pedidos' ? 'pedidos' : tabParam === 'seguridad' ? 'seguridad' : 'perfil'
  );

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    latitud: null as number | null,
    longitud: null as number | null,
  });

  useEffect(() => {
    if (tabParam === 'pedidos' || tabParam === 'seguridad' || tabParam === 'perfil') {
      const timer = setTimeout(() => setActiveTab(tabParam), 0);
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
            latitud: prof.latitud ?? null,
            longitud: prof.longitud ?? null,
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number | null, lng: number | null) => {
    setFormData((prev) => ({ ...prev, latitud: lat, longitud: lng }));
  };

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
        latitud: formData.latitud ?? null,
        longitud: formData.longitud ?? null,
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
        <p className="text-xs font-bold text-slate-500">Cargando tu cuenta...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl space-y-5">
      {/* Migas de Pan (Breadcrumbs) */}
      <nav aria-label="Navegación" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Link href="/" className="hover:text-catador-blue flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Inicio</span>
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700 font-bold">Mi Cuenta</span>
      </nav>

      {/* Hero del Usuario con Avatar, Rol, Estadísticas y Salir */}
      <AccountHero user={user} perfil={perfil} orders={userOrders} />

      {/* Pestañas de Navegación del Panel */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'perfil'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <User className="h-4 w-4 shrink-0" />
          <span>Datos Personales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'pedidos'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Package className="h-4 w-4 shrink-0" />
          <span>Mis Pedidos</span>
          {userOrders.length > 0 && (
            <span
              className={`h-5 min-w-[20px] px-1.5 rounded-full text-xs flex items-center justify-center font-black tabular-nums ${
                activeTab === 'pedidos'
                  ? 'bg-catador-amber text-white shadow-xs'
                  : 'bg-slate-300 text-slate-800'
              }`}
            >
              {userOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seguridad')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'seguridad'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Shield className="h-4 w-4 shrink-0" />
          <span>Seguridad</span>
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === 'perfil' && (
        <AccountProfileTab
          isEmailConfirmed={Boolean(perfil?.correo_confirmado || perfil?.rol === 'admin')}
          userEmail={user?.email}
          formData={formData}
          onChange={handleFieldChange}
          onChangeLocation={handleLocationChange}
          onSubmit={handleSaveProfile}
          saving={saving}
          saveSuccess={saveSuccess}
          saveError={saveError}
        />
      )}

      {activeTab === 'pedidos' && <AccountOrdersTab orders={userOrders} />}

      {activeTab === 'seguridad' && <AccountSecurityTab />}
    </main>
  );
}

export default function CuentaPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-catador-blue" />
          <p className="text-xs font-bold text-slate-500">Cargando...</p>
        </main>
      }
    >
      <CuentaContent />
    </Suspense>
  );
}
