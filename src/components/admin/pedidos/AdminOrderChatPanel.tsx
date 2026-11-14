'use client';

import { useState } from 'react';
import { Archive, MessageSquare } from 'lucide-react';
import { PedidoConDetalles } from '@/types';
import { OrderLiveChat } from '@/components/orders';

interface AdminOrderChatPanelProps {
  order: PedidoConDetalles | null;
  quickReplies?: string[];
}

/**
 * Panel inteligente de Chat para la consola de pedidos:
 * Si la orden ya es terminal (entregado, cancelado o rechazado), colapsa el chat
 * y muestra una tarjeta de historial archivado para mantener la consola despejada.
 */
export function AdminOrderChatPanel({ order, quickReplies = [] }: AdminOrderChatPanelProps) {
  const [isArchivedChatOpen, setIsArchivedChatOpen] = useState(false);
  const [prevOrderId, setPrevOrderId] = useState(order?.id);

  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    setIsArchivedChatOpen(false);
  }

  if (!order) {
    return (
      <div className="flex h-[540px] xl:h-[calc(100vh-220px)] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-400 shadow-sm">
        Selecciona una orden para abrir el canal de chat con el cliente.
      </div>
    );
  }

  const isTerminal =
    order.estado_pedido === 'entregado' ||
    order.estado_pedido === 'cancelado' ||
    order.estado_pago === 'rechazado';

  const statusLabel =
    order.estado_pedido === 'entregado'
      ? 'Entregada'
      : order.estado_pedido === 'cancelado'
      ? 'Cancelada'
      : 'Pago Rechazado';

  const messageCount = order.mensajes?.length ?? 0;

  if (isTerminal && !isArchivedChatOpen) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3 min-h-[320px] xl:h-[calc(100vh-220px)]">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Archive className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
            <span>Orden {statusLabel}</span>
          </div>
          <h4 className="text-sm font-black text-slate-900">
            Historial de Chat Archivado ({messageCount} {messageCount === 1 ? 'mensaje' : 'mensajes'})
          </h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Este pedido ya concluyó su despacho. El canal está archivado para mantener la consola despejada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsArchivedChatOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <MessageSquare className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
          <span>Abrir historial de chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isTerminal && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
            <Archive className="h-3.5 w-3.5 text-slate-500 shrink-0" strokeWidth={1.5} />
            <span className="truncate">Historial de orden finalizada #{order.numero_orden}</span>
          </span>
          <button
            type="button"
            onClick={() => setIsArchivedChatOpen(false)}
            className="font-bold text-rose-600 hover:text-rose-700 shrink-0 cursor-pointer ml-2"
          >
            Cerrar chat
          </button>
        </div>
      )}
      <OrderLiveChat
        pedidoId={order.id}
        usuarioRol="admin"
        usuarioNombre="Administrador Gran Catador"
        numeroOrden={order.numero_orden}
        quickReplies={quickReplies}
      />
    </div>
  );
}
