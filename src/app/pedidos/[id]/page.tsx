'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MessageSquareText,
  ReceiptText,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PedidoConDetalles, PedidoRow } from '@/types';
import { OrderLiveStepper, OrderReceiptCard, OrderLiveChat } from '@/components/orders';
import { cn } from '@/lib/utils';

export default function OrderLiveRoomPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<PedidoConDetalles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'recibo'>('chat');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pedidos/${id}`);
        if (!res.ok) throw new Error('Pedido no encontrado');
        const data = await res.json();
        if (isMounted && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error cargando pedido');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    const channel = supabase
      .channel(`pedido-status-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `id=eq.${id}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as PedidoRow;
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...updated,
            };
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-catador-blue" />
        <p className="text-xs font-bold text-slate-600">Conectando a la Sala en Vivo de tu Pedido...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container mx-auto px-4 py-16 max-w-md text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-black text-slate-900">Pedido no encontrado</h1>
        <p className="text-xs text-slate-500">{error || 'No pudimos localizar la información de este pedido.'}</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl bg-catador-blue px-4 py-2 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors"
        >
          Ir al Catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-5 md:py-8 space-y-5 max-w-7xl">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-catador-blue transition-colors">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link href="/catalogo" className="hover:text-catador-blue transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-bold text-slate-800">Sala en Vivo #{order.numero_orden}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Sala en Vivo • Pedido #{order.numero_orden}
          </h1>
          <p className="text-xs text-slate-500">
            Atención directa con el administrador y seguimiento de despacho en tiempo real
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-catador-blue hover:text-catador-blue-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Seguir Comprando
        </Link>
      </div>

      {/* Selector de Pestañas en Móvil (Chat en Vivo vs Recibo/Estado) */}
      <div className="lg:hidden grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all cursor-pointer',
            mobileTab === 'chat'
              ? 'bg-catador-blue text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <MessageSquareText className="h-4 w-4" />
          <span>Chat en Vivo</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('recibo')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all cursor-pointer',
            mobileTab === 'recibo'
              ? 'bg-catador-blue text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <ReceiptText className="h-4 w-4" />
          <span>Estado y Recibo</span>
        </button>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className={cn(
            'lg:col-span-7 space-y-6',
            mobileTab === 'recibo' ? 'block' : 'hidden lg:block'
          )}
        >
          <OrderLiveStepper estado={order.estado_pedido} />
          <OrderReceiptCard order={order} />
        </div>

        <div
          className={cn(
            'lg:col-span-5 lg:sticky lg:top-20',
            mobileTab === 'chat' ? 'block' : 'hidden lg:block'
          )}
        >
          <OrderLiveChat
            pedidoId={order.id}
            usuarioRol="cliente"
            usuarioNombre={order.cliente_nombre}
            numeroOrden={order.numero_orden}
            quickReplies={[
              '¿Me mandan las bebidas bien frías?',
              'Acabo de subir el comprobante de pago',
              '¿Cuánto tiempo estimado para la entrega?',
            ]}
          />
        </div>
      </div>
    </main>
  );
}
