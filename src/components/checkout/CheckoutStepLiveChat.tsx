'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, ShoppingBag } from 'lucide-react';
import { PedidoConDetalles, PedidoRow } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { OrderLiveChat, OrderLiveStepper } from '@/components/orders';
import { supabase } from '@/lib/supabase';

interface CheckoutStepLiveChatProps {
  initialOrder: PedidoConDetalles;
  userId: string | null;
}

export function CheckoutStepLiveChat({
  initialOrder,
  userId,
}: CheckoutStepLiveChatProps) {
  const [order, setOrder] = useState<PedidoConDetalles>(initialOrder);

  useEffect(() => {
    const channel = supabase
      .channel(`checkout-order-status-${initialOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as PedidoRow;
          setOrder((prev) => ({
            ...prev,
            ...updated,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Banner de Confirmación de Orden */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/70 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                Orden #{order.numero_orden}
              </span>
              <span className="text-xs font-extrabold text-emerald-900">
                Total: {formatUsd(order.total_usd)} ({formatVes(order.total_ves)})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              ¡Tu pedido ha sido registrado! Coordina tu entrega en el Chat en Vivo
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Un administrador de Gran Catador ya recibió tu orden. Escríbenos abajo o adjunta tu comprobante de pago.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/pedidos/${order.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 px-3.5 py-2.5 text-xs font-extrabold text-emerald-800 transition-colors shadow-2xs"
          >
            <span>Ver Recibo Completo</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light px-3.5 py-2.5 text-xs font-extrabold text-white transition-colors shadow-2xs"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Catálogo</span>
          </Link>
        </div>
      </div>

      {/* Chat en Vivo Protagonista + Estado en Tiempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 order-1">
          <OrderLiveChat
            pedidoId={order.id}
            usuarioRol="cliente"
            usuarioNombre={order.cliente_nombre}
            usuarioId={userId}
            numeroOrden={order.numero_orden}
            quickReplies={[
              'Hola, acabo de confirmar mi pedido',
              'Aquí envío el capture del pago',
              '¿Me mandan las bebidas bien frías por favor?',
              '¿En cuánto tiempo sale el motorizado?',
            ]}
          />
        </div>

        <div className="lg:col-span-5 order-2 space-y-4">
          <OrderLiveStepper estado={order.estado_pedido} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2 text-xs">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Datos de tu Despacho #{order.numero_orden}
            </h3>
            <p className="text-slate-600">
              <strong className="text-slate-800">Cliente:</strong> {order.cliente_nombre} ({order.cliente_telefono})
            </p>
            <p className="text-slate-600">
              <strong className="text-slate-800">Modalidad:</strong>{' '}
              {order.tipo_entrega === 'pickup' ? 'Retiro en Bodegón' : `Delivery (${order.zona_barinas})`}
            </p>
            {order.direccion_entrega && (
              <p className="text-slate-600">
                <strong className="text-slate-800">Dirección:</strong> {order.direccion_entrega}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

