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
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            Recibido
          </span>
        );
      case 'preparando':
        return (
          <span className="bg-blue-50 text-catador-blue border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            En Bodegón
          </span>
        );
      case 'en_camino':
        return (
          <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            En Ruta
          </span>
        );
      case 'entregado':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
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
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[520px] max-h-[720px] rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 tabular-nums">
            Cola de Órdenes ({orders.length})
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>

        <input
          type="text"
          placeholder="Filtrar por #orden, cliente, cédula..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base md:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-catador-blue"
        />

        <div className="flex gap-1 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar text-[11px] tabular-nums">
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
                  'px-2.5 py-1 rounded-md font-bold shrink-0 transition-colors cursor-pointer text-[10px]',
                  isActive
                    ? 'bg-catador-blue text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
          <div className="p-8 text-center text-xs text-slate-400">
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
                  'p-3.5 transition-colors cursor-pointer border-l-3 relative space-y-1.5',
                  isSelected
                    ? 'border-l-catador-amber bg-slate-50'
                    : 'border-l-transparent hover:bg-slate-50/70'
                )}
              >
                <div className="flex items-center justify-between tabular-nums">
                  <span className="font-black text-xs text-slate-900">
                    #{order.numero_orden}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="flex items-center gap-0.5 rounded-md bg-catador-discount px-1.5 py-0.5 text-[10px] font-black text-white">
                        <MessageSquare className="h-3 w-3" />
                        <span>{order.mensajes_no_leidos}</span>
                      </span>
                    )}
                    {getStatusBadge(order.estado_pedido)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {order.cliente_nombre}
                  </span>
                  <span className="font-black text-catador-blue tabular-nums">
                    {formatUsd(order.total_usd)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {getMinutesAgo(order.created_at)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3 text-catador-amber" />
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
