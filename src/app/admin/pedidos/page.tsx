'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Shield, RefreshCw, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { AdminOrderQueue, AdminOrderDetail } from '@/components/admin';
import { OrderLiveChat } from '@/components/orders';
import { soundFx } from '@/lib/sound';

export default function AdminPedidosCommandCenterPage() {
  const [orders, setOrders] = useState<PedidoConDetalles[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PedidoConDetalles | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Cargar lista completa de órdenes
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          setSelectedOrder((current) => {
            if (!current && data.orders.length > 0) return data.orders[0];
            return data.orders.find((o: PedidoConDetalles) => o.id === current?.id) || data.orders[0] || null;
          });
        }
      }
    } catch (err) {
      console.warn('Error cargando órdenes en consola admin:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);

    // 2. Suscripción en Tiempo Real para Nuevas Órdenes y Actualizaciones
    const channel = supabase
      .channel('admin-orders-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        () => {
          if (soundEnabled) soundFx.playOrderAlert();
          loadOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        () => {
          loadOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedido_mensajes' },
        (payload: { new: Record<string, unknown> }) => {
          const msg = payload.new as unknown as { pedido_id: string; remitente_rol: string };
          if (msg.remitente_rol === 'cliente') {
            if (soundEnabled) soundFx.playMessageBubble();
            // Incrementar contador de no leídos
            setOrders((prev) =>
              prev.map((o) =>
                o.id === msg.pedido_id ? { ...o, mensajes_no_leidos: (o.mensajes_no_leidos || 0) + 1 } : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [loadOrders, soundEnabled]);

  // Actualizar Estado de la Orden
  const handleUpdateStatus = async (estadoPedido?: EstadoPedido, estadoPago?: EstadoPago) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/pedidos/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_pedido: estadoPedido, estado_pago: estadoPago }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setSelectedOrder(data.order);
          setOrders((prev) => prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o)));
        }
      }
    } catch (err) {
      console.error('Error actualizando pedido:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar Pedido
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/pedidos/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrders((prev) => {
          const updated = prev.filter((o) => o.id !== orderId);
          setSelectedOrder((current) => {
            if (current?.id === orderId) {
              return updated[0] || null;
            }
            return current;
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('Error eliminando pedido:', err);
    }
  };

  const adminQuickReplies = [
    '¡Hola! Ya estamos revisando tu comprobante de pago.',
    'Pago confirmado ✅, ya estamos empacando tu pedido en el Bodegón.',
    'Por favor verifica el número de referencia o envíanos captura legible por aquí.',
    'Nuestro motorizado ya va saliendo hacia tu ubicación en Barinas 🛵.',
    'Tu pedido ya fue entregado. ¡Gracias por confiar en Gran Catador!',
  ];

  return (
    <main className="container mx-auto px-4 py-4 md:py-6 space-y-4 max-w-[1500px]">
      {/* Barra de Control Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-catador-blue text-white shadow-2xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Centro de Comando y Despacho • Gran Catador
            </h1>
            <p className="text-[11px] text-slate-500">
              Operaciones en vivo, facturación en caja y chat multi-pedido en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
            <span>{soundEnabled ? 'Sonidos Activos' : 'Silenciado'}</span>
          </button>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refrescar</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl bg-catador-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Ir a la Tienda
          </Link>
        </div>
      </div>

      {/* Consola Split-Screen de 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Columna 1: Cola de Pedidos en Vivo (3 cols) */}
        <div className="lg:col-span-3">
          <AdminOrderQueue
            orders={orders}
            selectedOrderId={selectedOrder?.id || null}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              // Limpiar badge de no leídos al abrir
              setOrders((prev) => prev.map((o) => (o.id === ord.id ? { ...o, mensajes_no_leidos: 0 } : o)));
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Columna 2: Detalle de Orden y Verificación de Pago (5 cols) */}
        <div className="lg:col-span-5">
          <AdminOrderDetail
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleDeleteOrder}
            isUpdating={isUpdating}
          />
        </div>

        {/* Columna 3: Chat Directo con el Cliente (4 cols) */}
        <div className="lg:col-span-4">
          {selectedOrder ? (
            <OrderLiveChat
              pedidoId={selectedOrder.id}
              usuarioRol="admin"
              usuarioNombre="Administrador Gran Catador"
              quickReplies={adminQuickReplies}
            />
          ) : (
            <div className="flex h-[580px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              Selecciona una orden para abrir el canal de chat con el cliente.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
