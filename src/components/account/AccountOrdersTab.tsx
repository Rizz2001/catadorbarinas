'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, ChevronRight, Truck, MapPin } from 'lucide-react';
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
          <span className="bg-catador-amber-soft text-[#8B3E03] border border-catador-amber-oak/70 text-xs font-black px-2.5 py-0.5 rounded-full">
            Recibido
          </span>
        );
      case 'preparando':
        return (
          <span className="bg-blue-50 text-catador-blue border border-blue-200 text-xs font-black px-2.5 py-0.5 rounded-full">
            En Bodegón
          </span>
        );
      case 'en_camino':
        return (
          <span className="bg-catador-blue text-white text-xs font-black px-2.5 py-0.5 rounded-full">
            En Camino
          </span>
        );
      case 'entregado':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black px-2.5 py-0.5 rounded-full">
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black px-2.5 py-0.5 rounded-full">
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
      <section className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 text-center space-y-3.5">
        <div className="h-16 w-16 mx-auto rounded-full bg-[#F7F8FA] border border-slate-200 flex items-center justify-center text-slate-400">
          <Package className="h-8 w-8 stroke-1" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Aún no tienes pedidos registrados</h3>
          <p className="text-[13px] text-slate-600 max-w-sm mx-auto">
            Cuando realices compras en EL CATADOR., aquí podrás rastrear el estado en vivo y chatear con nuestro equipo.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark text-white font-extrabold text-xs px-6 py-3 min-h-[44px] transition-colors"
          >
            <span>Explorar Catálogo</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Historial de Pedidos ({orders.length})
        </h2>
        <span className="text-xs font-bold text-slate-500">En tiempo real</span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const itemCount = order.items.reduce((acc, it) => acc + it.cantidad, 0);

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-catador-blue/60 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-slate-900 tabular-nums">
                    #{order.numero_orden}
                  </span>
                  {getStatusBadge(order.estado_pedido)}
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F7F8FA] border border-slate-200 text-slate-700 flex items-center gap-1">
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

                <div className="flex items-center gap-1.5 text-xs text-slate-500 tabular-nums">
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

              <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
                <div className="flex items-center -space-x-2 shrink-0">
                  {order.items.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className="relative h-11 w-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0"
                    >
                      <Image
                        src={it.imagen_url || IMAGE_FALLBACKS.product}
                        alt={itemNameSafe(it.nombre_articulo)}
                        fill
                        sizes="44px"
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="relative h-11 w-11 rounded-xl bg-catador-blue-dark text-white font-black text-xs border-2 border-white flex items-center justify-center shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {order.items.map((i) => `${i.cantidad}x ${i.nombre_articulo}`).join(', ')}
                  </p>
                  <p className="text-xs text-slate-500 font-medium tabular-nums">
                    {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="tabular-nums">
                  <span className="text-base font-black text-slate-900">
                    {formatUsd(order.total_usd)}
                  </span>
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    ({formatVes(order.total_ves)})
                  </span>
                </div>

                <Link
                  href={`/pedidos/${order.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-catador-blue hover:bg-catador-blue-dark text-white px-5 py-2.5 min-h-[42px] text-xs font-extrabold transition-colors"
                >
                  <span>Seguir en Vivo</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function itemNameSafe(name?: string | null): string {
  return name || 'Producto EL CATADOR.';
}
