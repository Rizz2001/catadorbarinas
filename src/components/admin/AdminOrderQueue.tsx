'use client';

import React from 'react';
import { Clock, MessageSquare, MapPin } from 'lucide-react';
import { PedidoConDetalles, EstadoPedido } from '@/types';
import { formatUsd } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface AdminOrderQueueProps {
  orders: PedidoConDetalles[];
  selectedOrderId: string | null;
  onSelectOrder: (order: PedidoConDetalles) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

type FilterTab = 'todos' | EstadoPedido;

export function AdminOrderQueue({
  orders,
  selectedOrderId,
  onSelectOrder,
  searchTerm,
  onSearchChange,
}: AdminOrderQueueProps) {
  const [now] = React.useState(() => Date.now());
  const [statusFilter, setStatusFilter] = React.useState<FilterTab>('todos');

  const getMinutesAgo = (dateStr: string) => {
    const diff = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    return `${hours}h`;
  };

  const getStatusBadge = (st: EstadoPedido) => {
    switch (st) {
      case 'recibido':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-0.5 rounded-md">
            Recibido
          </span>
        );
      case 'preparando':
        return (
          <span className="bg-blue-100 text-catador-blue border border-blue-300 text-xs font-black px-2.5 py-0.5 rounded-md">
            En Bodegón
          </span>
        );
      case 'en_camino':
        return (
          <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-md">
            En Ruta
          </span>
        );
      case 'entregado':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-md">
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black px-2.5 py-0.5 rounded-md">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
            {st}
          </span>
        );
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'recibido', label: 'Recibidos' },
    { key: 'preparando', label: 'Bodegón' },
    { key: 'en_camino', label: 'Ruta' },
    { key: 'entregado', label: 'Entregados' },
  ];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'todos' || o.estado_pedido === statusFilter;
    const matchSearch =
      o.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente_telefono.includes(searchTerm) ||
      (o.cliente_cedula && o.cliente_cedula.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[460px] lg:h-[calc(100vh-14rem)] lg:min-h-[520px] lg:max-h-[720px] rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 tabular-nums">
            Cola de Órdenes ({orders.length})
          </h3>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
        </div>

        <input
          type="text"
          placeholder="Buscar por cliente, #orden o cédula..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar tabular-nums">
          {tabs.map((tab) => {
            const count =
              tab.key === 'todos'
                ? orders.length
                : orders.filter((o) => o.estado_pedido === tab.key).length;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'px-3.5 py-2 min-h-[38px] rounded-lg font-bold shrink-0 transition-colors cursor-pointer text-xs',
                  isActive
                    ? 'bg-catador-blue text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                )}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-400">
            Sin órdenes en este estado.
          </div>
        ) : (
          filtered.map((order) => {
            const isSelected = order.id === selectedOrderId;
            const hasUnread = (order.mensajes_no_leidos || 0) > 0;

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={cn(
                  'p-4 transition-colors cursor-pointer border-l-4 relative space-y-2',
                  isSelected
                    ? 'border-l-catador-amber bg-amber-50/40'
                    : 'border-l-transparent hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between tabular-nums">
                  <span className="font-black text-sm text-slate-900">
                    #{order.numero_orden}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="flex items-center gap-1 rounded-md bg-catador-discount px-2 py-0.5 text-xs font-black text-white animate-pulse">
                        <MessageSquare className="h-3 w-3" />
                        <span>{order.mensajes_no_leidos}</span>
                      </span>
                    )}
                    {getStatusBadge(order.estado_pedido)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate max-w-[170px] text-sm">
                    {order.cliente_nombre}
                  </span>
                  <span className="font-black text-catador-blue tabular-nums text-sm">
                    {formatUsd(order.total_usd)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 tabular-nums">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {getMinutesAgo(order.created_at)}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-catador-amber" />
                    {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Pick-Up'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
