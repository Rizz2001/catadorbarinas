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
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Recibido</span>;
      case 'preparando':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Preparando</span>;
      case 'en_camino':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">En Despacho</span>;
      case 'entregado':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Entregado</span>;
      case 'cancelado':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelado</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{st}</span>;
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'recibido', label: 'Recibidos' },
    { key: 'preparando', label: 'Preparación' },
    { key: 'en_camino', label: 'Despacho' },
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
    <div className="flex flex-col h-[700px] rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Cabecera y Buscador */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Historial de Pedidos ({orders.length})
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <input
          type="text"
          placeholder="Buscar #orden, cliente, cédula..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
        />

        {/* Pestañas de Estado */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar text-[11px]">
          {tabs.map((tab) => {
            const count = tab.key === 'todos' 
              ? orders.length 
              : orders.filter((o) => o.estado_pedido === tab.key).length;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer text-[10px]',
                  isActive
                    ? 'bg-catador-blue text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                )}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No hay pedidos activos en este momento.
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
                  'p-3.5 transition-colors cursor-pointer border-l-4 relative space-y-1.5',
                  isSelected
                    ? 'border-l-catador-amber bg-amber-50/50'
                    : 'border-l-transparent hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">
                    #{order.numero_orden}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="flex items-center gap-0.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white animate-bounce">
                        <MessageSquare className="h-3 w-3" />
                        <span>!</span>
                      </span>
                    )}
                    {getStatusBadge(order.estado_pedido)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {order.cliente_nombre}
                  </span>
                  <span className="font-extrabold text-catador-blue">
                    {formatUsd(order.total_usd)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getMinutesAgo(order.created_at)}
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <MapPin className="h-3 w-3 text-catador-amber" />
                    {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Retiro'}
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
