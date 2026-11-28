'use client';

import React from 'react';
import { Clock, Inbox, MapPin, MessageSquare, Search } from 'lucide-react';
import { Badge } from '@astryxdesign/core/Badge';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { EstadoPedido, MetodoPago, PedidoConDetalles } from '@/types';
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

const PAYMENT_SHORT_LABEL: Record<MetodoPago, string> = {
  pago_movil: 'Pago Móvil',
  zelle: 'Zelle',
  efectivo_usd: 'Efectivo $',
  transferencia_bancaria: 'Transferencia',
  punto_venta: 'Punto',
};

const URGENCY_BORDER: Record<EstadoPedido, string> = {
  recibido: 'border-l-amber-500',
  preparando: 'border-l-sky-500',
  en_camino: 'border-l-[#00227B]',
  entregado: 'border-l-emerald-500',
  cancelado: 'border-l-rose-400',
};

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
    return `${Math.floor(diff / 60)}h`;
  };

  const renderStatusBadge = (st: EstadoPedido) => {
    const map: Record<EstadoPedido, { variant: 'warning' | 'info' | 'blue' | 'success' | 'error'; label: string }> = {
      recibido: { variant: 'warning', label: 'Recibido' },
      preparando: { variant: 'info', label: 'Bodegón' },
      en_camino: { variant: 'blue', label: 'En Ruta' },
      entregado: { variant: 'success', label: 'Entregado' },
      cancelado: { variant: 'error', label: 'Cancelado' },
    };
    const cfg = map[st];
    return cfg ? <Badge variant={cfg.variant} label={cfg.label} /> : <Badge variant="neutral" label={st} />;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'todos', label: 'Todos' }, { key: 'recibido', label: 'Recibidos' },
    { key: 'preparando', label: 'Bodegón' }, { key: 'en_camino', label: 'Ruta' },
    { key: 'entregado', label: 'Entregados' },
  ];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'todos' || o.estado_pedido === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      o.numero_orden.toLowerCase().includes(q) ||
      o.cliente_nombre.toLowerCase().includes(q) ||
      o.cliente_telefono.includes(searchTerm) ||
      Boolean(o.cliente_cedula && o.cliente_cedula.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] min-h-[480px] xl:h-[calc(100vh-220px)] rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
      <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 tabular-nums">
            Cola de Órdenes <span className="text-slate-400 font-semibold">({orders.length})</span>
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>En vivo</span>
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar cliente, #orden o cédula..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
          />
        </div>

        <div className="flex overflow-x-auto scrollbar-none no-scrollbar gap-1.5 pb-0.5 tabular-nums">
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
                  'shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
          <div className="p-6">
            <EmptyState
              isCompact
              icon={<Inbox className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
              title="Sin órdenes en este estado"
              description="Cambia el filtro superior o limpia la búsqueda para ver otras órdenes."
            />
          </div>
        ) : (
          filtered.map((order) => {
            const isSelected = order.id === selectedOrderId;
            const hasUnread = (order.mensajes_no_leidos || 0) > 0;
            const paymentLabel = order.pago?.metodo_pago ? PAYMENT_SHORT_LABEL[order.pago.metodo_pago] : null;

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={cn(
                  'p-3.5 transition-colors cursor-pointer border-l-[3px] relative space-y-1.5',
                  URGENCY_BORDER[order.estado_pedido] || 'border-l-slate-300',
                  isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                )}
              >
                <div className="flex items-center justify-between tabular-nums">
                  <span className="font-bold text-sm text-slate-900">#{order.numero_orden}</span>
                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
                        <span>{order.mensajes_no_leidos}</span>
                      </span>
                    )}
                    {renderStatusBadge(order.estado_pedido)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 truncate text-[13px]">{order.cliente_nombre}</span>
                  <span className="font-bold text-catador-blue tabular-nums text-sm shrink-0">
                    {formatUsd(order.total_usd)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-0.5 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.6} />
                    <span>{getMinutesAgo(order.created_at)}</span>
                  </span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {paymentLabel && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 truncate">
                        {paymentLabel}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-slate-700 shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.6} />
                      {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Retiro'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
