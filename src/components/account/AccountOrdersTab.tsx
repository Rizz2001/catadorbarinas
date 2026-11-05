'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, ArrowRight, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { PedidoConDetalles, EstadoPedido } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';

interface AccountOrdersTabProps {
  orders: PedidoConDetalles[];
}

export function AccountOrdersTab({ orders }: AccountOrdersTabProps) {
  const getStatusBadge = (st: EstadoPedido) => {
    switch (st) {
      case 'recibido':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full">
            Recibido
          </span>
        );
      case 'preparando':
        return (
          <span className="bg-blue-100 text-catador-blue border border-blue-300 text-xs font-black px-2.5 py-0.5 rounded-full">
            En Bodegón
          </span>
        );
      case 'en_camino':
        return (
          <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
            🛵 En Ruta
          </span>
        );
      case 'entregado':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full">
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black px-2.5 py-0.5 rounded-full">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {st}
          </span>
        );
    }
  };

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 text-center space-y-3.5 shadow-sm">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
          <Package className="h-8 w-8 stroke-1" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Aún no tienes pedidos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando realices compras de licores o víveres en Gran Catador, aquí podrás rastrear el estado del motorizado y chatear con el bodegón en tiempo real.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-extrabold text-xs px-5 py-3 min-h-[44px] shadow-sm transition-colors"
          >
            <span>Explorar Catálogo y Ofertas</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Historial de Pedidos y Envíos ({orders.length})
        </h2>
        <span className="text-xs font-bold text-slate-500">Actualización en tiempo real</span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const itemCount = order.items.reduce((acc, it) => acc + it.cantidad, 0);

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-catador-blue/40 transition-colors space-y-3"
            >
              {/* Cabecera de la Tarjeta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-black text-sm text-slate-900 tabular-nums">
                    #{order.numero_orden}
                  </span>
                  {getStatusBadge(order.estado_pedido)}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                    {order.tipo_entrega === 'delivery' ? (
                      <>
                        <Truck className="h-3 w-3 text-catador-amber" />
                        <span>Delivery Barinas</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 text-catador-blue" />
                        <span>Pick-Up Bodegón</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {new Date(order.created_at).toLocaleDateString('es-VE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Vista de Miniaturas de Artículos */}
              <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
                <div className="flex items-center -space-x-2 shrink-0">
                  {order.items.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className="relative h-11 w-11 rounded-xl bg-slate-50 border-2 border-white overflow-hidden shadow-xs shrink-0"
                    >
                      <Image
                        src={it.imagen_url || IMAGE_FALLBACKS.product}
                        alt={it.nombre_articulo}
                        fill
                        sizes="44px"
                        className="object-contain p-0.5"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="relative h-11 w-11 rounded-xl bg-slate-800 text-white font-black text-xs border-2 border-white flex items-center justify-center shadow-xs shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {order.items.map((i) => `${i.cantidad}x ${i.nombre_articulo}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'} en total
                  </p>
                </div>
              </div>

              {/* Pie de Tarjeta con Precios y Botón de Tracking */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="tabular-nums">
                  <span className="text-base font-black text-catador-blue">
                    {formatUsd(order.total_usd)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-2">
                    ({formatVes(order.total_ves)})
                  </span>
                </div>

                <Link
                  href={`/pedidos/${order.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 min-h-[44px] text-xs font-black transition-colors shadow-xs"
                >
                  <span>Sala de Tracking & Chat en Vivo</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

