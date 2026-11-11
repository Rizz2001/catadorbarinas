'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';

export function CartCheckoutForm() {
  const { items } = useCartStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (active) setIsAuthenticated(Boolean(user));
      } catch {
        if (active) setIsAuthenticated(false);
      }
    }
    void checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      {isAuthenticated ? (
        <>
          <Link
            href="/checkout"
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark p-3.5 text-sm font-extrabold text-white transition-all active:scale-[0.99]"
          >
            <span>Ir a pagar</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-slate-500 text-center font-medium">
            Pago Móvil · Zelle · Transferencia · Efectivo USD
          </p>
        </>
      ) : (
        <div className="space-y-2.5">
          <div className="rounded-xl bg-catador-amber-soft border border-catador-amber-oak/60 p-3 text-xs text-[#8B3E03]">
            <p className="font-extrabold">Inicia sesión para finalizar tu pedido</p>
            <p className="text-[11px] mt-0.5">
              Tu carrito y dirección se mantendrán guardados automáticamente.
            </p>
          </div>
          <Link
            href="/registro?redirect=/checkout"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark px-4 py-2.5 text-xs font-extrabold text-white transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Crear mi Cuenta y Comprar</span>
          </Link>
          <Link
            href="/login?redirect=/checkout"
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full border border-catador-blue bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-catador-blue transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Ya tengo cuenta · Iniciar Sesión</span>
          </Link>
        </div>
      )}
    </div>
  );
}
