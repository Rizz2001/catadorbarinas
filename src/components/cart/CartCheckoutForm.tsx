'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  CreditCard,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';

export function CartCheckoutForm() {
  const { items } = useCartStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (active) setIsAuthenticated(Boolean(user));
    }
    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Checkout 100% en Línea
      </h3>

      <div className="space-y-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-catador-blue shrink-0" />
          <span>Entrega a Domicilio en Barinas o Retiro en Bodegón</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-catador-amber shrink-0" />
          <span>Pago Móvil en Bs. BCV, Zelle o Efectivo Divisas</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Seguimiento y Chat en Vivo con el Administrador</span>
        </div>
      </div>

      {isAuthenticated ? (
        <Link
          href="/checkout"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light p-3.5 text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.99]"
        >
          <span>Proceder al Pago en Línea</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <p className="font-extrabold">🔒 Registro obligatorio para comprar</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Para procesar tu pedido y darte seguimiento en tiempo real debes crear tu cuenta o iniciar sesión. Tu carrito se mantendrá guardado.
            </p>
          </div>
          <Link
            href="/registro?redirect=/checkout"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light p-3 text-xs font-extrabold text-white shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Crear mi Cuenta y Comprar</span>
          </Link>
          <Link
            href="/login?redirect=/checkout"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-catador-blue bg-white hover:bg-blue-50 p-2.5 text-xs font-extrabold text-catador-blue transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Ya tengo cuenta • Iniciar Sesión</span>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="h-3 w-3" />
        <span>Pago seguro dentro de la plataforma</span>
      </div>
    </div>
  );
}
