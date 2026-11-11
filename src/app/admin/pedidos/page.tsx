'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, Volume2, VolumeX, Bike } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { AdminOrderQueue, AdminOrderDetail, QuickDeliveryCalculatorModal } from '@/components/admin';
import { OrderLiveChat } from '@/components/orders';
import { formatUsd, formatVes } from '@/lib/currency';
import { soundFx } from '@/lib/sound';

export default function AdminPedidosCommandCenterPage() {
  const [orders, setOrders] = useState<PedidoConDetalles[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PedidoConDetalles | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<'cola' | 'detalle' | 'chat'>('cola');
  const [deliveryCalcOpen, setDeliveryCalcOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          setSelectedOrder((current) => {
            if (!current && data.orders.length > 0) return data.orders[0];
            return (
              data.orders.find((o: PedidoConDetalles) => o.id === current?.id) ||
              data.orders[0] ||
              null
            );
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
            setOrders((prev) =>
              prev.map((o) =>
                o.id === msg.pedido_id
                  ? { ...o, mensajes_no_leidos: (o.mensajes_no_leidos || 0) + 1 }
                  : o
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

  // KPIs reconciliados directamente desde las filas reales (Regla Taste Skill App Screens §2.1)
  const kpis = useMemo(() => {
    const validOrders = orders.filter((o) => o.estado_pedido !== 'cancelado');
    const receivedCount = orders.filter((o) => o.estado_pedido === 'recibido').length;
    const pendingPayCount = validOrders.filter((o) => o.estado_pago === 'pendiente').length;
    const activeDispatchCount = orders.filter(
      (o) => o.estado_pedido === 'preparando' || o.estado_pedido === 'en_camino'
    ).length;
    const deliveredCount = orders.filter((o) => o.estado_pedido === 'entregado').length;
    const revenueUsd = validOrders.reduce((acc, o) => acc + Number(o.total_usd || 0), 0);
    const revenueVes = validOrders.reduce((acc, o) => acc + Number(o.total_ves || 0), 0);

    return {
      receivedCount,
      pendingPayCount,
      activeDispatchCount,
      deliveredCount,
      revenueUsd: Number(revenueUsd.toFixed(2)),
      revenueVes: Number(revenueVes.toFixed(2)),
    };
  }, [orders]);

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
          setOrders((prev) =>
            prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
          );
        }
      }
    } catch (err) {
      console.error('Error actualizando pedido:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/pedidos/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => {
          const updated = prev.filter((o) => o.id !== orderId);
          setSelectedOrder((current) =>
            current?.id === orderId ? updated[0] || null : current
          );
          return updated;
        });
      }
    } catch (err) {
      console.error('Error eliminando pedido:', err);
    }
  };

  const adminQuickReplies = [
    '¡Hola! Ya estamos revisando tu comprobante de pago.',
    'Pago confirmado, ya estamos empacando tu pedido en el Bodegón.',
    'Por favor verifica el número de referencia o envíanos captura legible por aquí.',
    'Nuestro motorizado ya va saliendo hacia tu ubicación en Barinas.',
    'Tu pedido ya fue entregado. ¡Gracias por confiar en Gran Catador!',
  ];

  return (
    <main className="px-4 sm:px-6 py-5 space-y-4 max-w-[1560px]">
      {/* Cabecera Operativa Limpia */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
            Centro de Comando y Despacho
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bodegón Central • Facturación en caja, verificación de pagos y chat en tiempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDeliveryCalcOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-50 min-h-[36px] px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Bike className="h-3.5 w-3.5 text-amber-700" />
            <span>Cotizar Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white min-h-[36px] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>{soundEnabled ? 'Alertas Sonoras' : 'Silenciado'}</span>
          </button>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white min-h-[36px] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sincronizar</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg bg-catador-blue min-h-[36px] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-catador-blue-light transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tienda</span>
          </Link>
        </div>
      </div>

      {/* Banda de KPIs Reconciliados (Taste Skill: KPIs are type, not tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl bg-white border border-slate-200/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="p-3.5 sm:px-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Recibidos / Por Verificar
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span className="text-xl font-black text-slate-900">{kpis.receivedCount}</span>
            <span className="text-xs font-bold text-amber-700">
              ({kpis.pendingPayCount} pagos pendientes)
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:px-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            En Bodegón y En Ruta
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span className="text-xl font-black text-catador-blue">{kpis.activeDispatchCount}</span>
            <span className="text-xs font-medium text-slate-500">despachos en curso</span>
          </div>
        </div>

        <div className="p-3.5 sm:px-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Órdenes Completadas
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span className="text-xl font-black text-emerald-700">{kpis.deliveredCount}</span>
            <span className="text-xs font-medium text-slate-500">de {orders.length} totales</span>
          </div>
        </div>

        <div className="p-3.5 sm:px-4">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Volumen Facturado Activo
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span className="text-xl font-black text-slate-900">
              {formatUsd(kpis.revenueUsd)}
            </span>
            <span className="text-xs font-bold text-slate-500 truncate">
              {formatVes(kpis.revenueVes)}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Panel en Móvil / Tablet (< 1024px) */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 lg:hidden tabular-nums">
        <button
          type="button"
          onClick={() => setMobilePanel('cola')}
          className={`min-h-[46px] px-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
            mobilePanel === 'cola'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>📦 Órdenes</span>
          <span className="text-[11px] opacity-80">({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('detalle')}
          className={`min-h-[46px] px-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
            mobilePanel === 'detalle'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>📄 {selectedOrder ? `#${selectedOrder.numero_orden}` : 'Detalle'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('chat')}
          className={`min-h-[46px] px-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobilePanel === 'chat'
              ? 'bg-catador-blue text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>💬 Chat</span>
          {(selectedOrder?.mensajes_no_leidos || 0) > 0 && (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-catador-discount text-white text-[11px] font-black flex items-center justify-center animate-pulse">
              {selectedOrder?.mensajes_no_leidos}
            </span>
          )}
        </button>
      </div>

      {/* Consola de 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`lg:col-span-3 ${mobilePanel === 'cola' ? 'block' : 'hidden lg:block'}`}>
          <AdminOrderQueue
            orders={orders}
            selectedOrderId={selectedOrder?.id || null}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setMobilePanel('detalle');
              setOrders((prev) =>
                prev.map((o) => (o.id === ord.id ? { ...o, mensajes_no_leidos: 0 } : o))
              );
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        <div className={`lg:col-span-5 ${mobilePanel === 'detalle' ? 'block' : 'hidden lg:block'}`}>
          <AdminOrderDetail
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleDeleteOrder}
            isUpdating={isUpdating}
            onBackToList={() => setMobilePanel('cola')}
          />
        </div>

        <div className={`lg:col-span-4 ${mobilePanel === 'chat' ? 'block' : 'hidden lg:block'}`}>
          {selectedOrder ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMobilePanel('detalle')}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs w-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>← Volver al Detalle del Pedido #{selectedOrder.numero_orden}</span>
              </button>
              <OrderLiveChat
                pedidoId={selectedOrder.id}
                usuarioRol="admin"
                usuarioNombre="Administrador Gran Catador"
                numeroOrden={selectedOrder.numero_orden}
                quickReplies={adminQuickReplies}
              />
            </div>
          ) : (
            <div className="flex h-[580px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-400">
              Selecciona una orden para abrir el canal de chat con el cliente.
            </div>
          )}
        </div>
      </div>

      <QuickDeliveryCalculatorModal
        isOpen={deliveryCalcOpen}
        onClose={() => setDeliveryCalcOpen(false)}
      />
    </main>
  );
}
