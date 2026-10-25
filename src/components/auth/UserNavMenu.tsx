'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Package, Shield, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { signOutUser } from '@/services/auth.service';
import { Database } from '@/types/supabase';

type PerfilRow = Database['public']['Tables']['perfiles']['Row'];

export function UserNavMenu() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          setUser(user);
          const { data: p } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (p && mounted) setPerfil(p as PerfilRow);
        } else if (mounted) {
          setUser(null);
          setPerfil(null);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setPerfil(null);
        }
      }
    }

    loadUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user?: { id: string; email?: string } } | null) => {
        if (session?.user && mounted) {
          setUser(session.user);
          supabase
            .from('perfiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: p }: { data: unknown }) => {
              if (p && mounted) setPerfil(p as PerfilRow);
            });
        } else if (mounted) {
          setUser(null);
          setPerfil(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // Continuar con el reseteo local
    }
    setUser(null);
    setPerfil(null);
    setOpen(false);
    router.refresh();
    router.replace('/');
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 min-h-[44px] text-xs font-bold text-slate-700 hover:border-catador-blue hover:text-catador-blue transition-colors shadow-2xs"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Iniciar Sesión</span>
        <span className="sm:hidden">Entrar</span>
      </Link>
    );
  }

  const isAdmin = perfil?.rol === 'admin';
  const displayName = perfil?.nombre || user.email?.split('@')[0] || 'Mi Cuenta';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 min-h-[44px] text-xs font-bold text-slate-800 hover:border-catador-blue transition-colors cursor-pointer shadow-2xs"
      >
        <div className="h-6 w-6 rounded-full bg-catador-blue text-white flex items-center justify-center text-[10px] font-black uppercase">
          {displayName.charAt(0)}
        </div>
        <span className="max-w-[110px] truncate">{displayName}</span>
        {isAdmin && (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
            Admin
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs space-y-1">
            <div className="p-2 border-b border-slate-100">
              <p className="font-extrabold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>

            <Link
              href="/cuenta"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Mi Perfil y Datos</span>
            </Link>

            <Link
              href="/cuenta/pedidos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
            >
              <Package className="h-4 w-4 text-slate-400" />
              <span>Mis Pedidos en Vivo</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin/pedidos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition-colors border border-amber-200/60"
              >
                <Shield className="h-4 w-4 text-catador-amber" />
                <span>Panel CMS Despacho</span>
              </Link>
            )}

            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-red-50 text-red-600 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
