'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { AdminOrderQueue, AdminOrderDetail, QuickDeliveryCalculatorModal } from '@/components/admin';
import { ADMIN_QUICK_REPLIES, AdminPedidosHeaderKpis } from '@/components/admin/pedidos/AdminPedidosHeaderKpis';
import { SegmentedControl, SegmentedControlItem } from '@/components/admin/ui';
import { OrderLiveChat } from '@/components/orders';
import {
  ADMIN_MESSAGE_INSERTED_EVENT,
  ADMIN_ORDER_INSERTED_EVENT,
  getAdminAlertsPreference,
  setAdminAlertsPreference,
  soundFx,
  triggerNewOrderAlert,
} from '@/lib/sound';
import { cn } from '@/lib/utils';

export default function AdminPedidosCommandCenterPage() {
  const [orders, setOrders] = useState<PedidoConDetalles[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PedidoConDetalles | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [mobileViewOpen, setMobileViewOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'detalle' | 'chat'>('detalle');
  const [deliveryCalcOpen, setDeliveryCalcOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.orders)) return;
      setOrders(data.orders);
      setSelectedOrder((curr) =>
        curr ? data.orders.find((o: PedidoConDetalles) => o.id === curr.id) || data.orders[0] || null : data.orders[0] || null
      );
    } catch (err) {
      console.warn('Error cargando órdenes en consola admin:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSoundEnabled(getAdminAlertsPreference());
      if (typeof window !== 'undefined' && 'Notification' in window) setNotificationPermission(window.Notification.permission);
      loadOrders();
    }, 0);
    const handleOrderChange = () => { loadOrders(); };
    const handleClientMessage = (event: Event) => {
      const pedidoId = (event as CustomEvent<{ pedido_id?: string }>).detail?.pedido_id;
      if (!pedidoId) return;
      setOrders((prev) => prev.map((o) => (o.id === pedidoId ? { ...o, mensajes_no_leidos: (o.mensajes_no_leidos || 0) + 1 } : o)));
      setSelectedOrder((prev) => (prev && prev.id === pedidoId ? { ...prev, mensajes_no_leidos: (prev.mensajes_no_leidos || 0) + 1 } : prev));
    };
    window.addEventListener(ADMIN_ORDER_INSERTED_EVENT, handleOrderChange);
    window.addEventListener(ADMIN_MESSAGE_INSERTED_EVENT, handleClientMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(ADMIN_ORDER_INSERTED_EVENT, handleOrderChange);
      window.removeEventListener(ADMIN_MESSAGE_INSERTED_EVENT, handleClientMessage);
    };
  }, [loadOrders]);

  const ensureBrowserPermission = async () => {
    await soundFx.unlockAudioContext();
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      const perm = await window.Notification.requestPermission();
      setNotificationPermission(perm);
      return true;
    }
    return false;
  };

  const handleToggleAlerts = async () => {
    const requested = await ensureBrowserPermission();
    const next = requested ? true : !soundEnabled;
    setSoundEnabled(next);
    setAdminAlertsPreference(next);
    if (next) soundFx.playOrderAlert();
  };

  const handleTestAlert = async () => {
    await ensureBrowserPermission();
    setSoundEnabled(true);
    setAdminAlertsPreference(true);
    triggerNewOrderAlert({ numeroOrden: 'TEST-001', clienteNombre: 'Prueba de Sistema', montoUsdFormatted: '$25.00', pedidoId: 'test-alert' });
  };

  const kpis = useMemo(() => {
    const valid = orders.filter((o) => o.estado_pedido !== 'cancelado');
    return {
      receivedCount: orders.filter((o) => o.estado_pedido === 'recibido').length,
      pendingPayCount: valid.filter((o) => o.estado_pago === 'pendiente').length,
      activeDispatchCount: orders.filter((o) => o.estado_pedido === 'preparando' || o.estado_pedido === 'en_camino').length,
      deliveredCount: orders.filter((o) => o.estado_pedido === 'entregado').length,
      revenueUsd: Number(valid.reduce((acc, o) => acc + Number(o.total_usd || 0), 0).toFixed(2)),
      revenueVes: Number(valid.reduce((acc, o) => acc + Number(o.total_ves || 0), 0).toFixed(2)),
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
          setOrders((prev) => prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o)));
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
      if (!res.ok) return;
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== orderId);
        setSelectedOrder((curr) => (curr?.id === orderId ? updated[0] || null : curr));
        return updated;
      });
      setMobileViewOpen(false);
    } catch (err) {
      console.error('Error eliminando pedido:', err);
    }
  };

  const handleMobileTabChange = (val: string) => {
    const nextTab = val as 'detalle' | 'chat';
    setMobileTab(nextTab);
    if (nextTab === 'chat' && selectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, mensajes_no_leidos: 0 } : prev));
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, mensajes_no_leidos: 0 } : o)));
    }
  };

  const unreadCount = selectedOrder?.mensajes_no_leidos || 0;

  return (
    <main className="px-4 sm:px-6 pt-4 sm:pt-6 pb-8 space-y-4 max-w-[1600px] mx-auto">
      <AdminPedidosHeaderKpis totalOrdersCount={orders.length} kpis={kpis} soundEnabled={soundEnabled} notificationPermission={notificationPermission} onToggleSound={handleToggleAlerts} onTestAlert={handleTestAlert} onOpenDeliveryCalc={() => setDeliveryCalcOpen(true)} onSync={loadOrders} />

      {mobileViewOpen && selectedOrder && (
        <div className="xl:hidden space-y-2.5">
          <button type="button" onClick={() => setMobileViewOpen(false)} className="flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] w-full rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Volver a la cola ({orders.length})</span>
          </button>
          <SegmentedControl layout="fill" label={`Vista de orden #${selectedOrder.numero_orden}`} value={mobileTab} onChange={handleMobileTabChange}>
            <SegmentedControlItem value="detalle" label="Detalle y Despacho" icon={<FileText className="w-3.5 h-3.5" strokeWidth={1.5} />} />
            <SegmentedControlItem value="chat" label="Chat en Vivo" icon={<span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />{unreadCount > 0 && <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">{unreadCount}</span>}</span>} />
          </SegmentedControl>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className={cn('xl:col-span-3 xl:h-[calc(100vh-220px)] xl:overflow-y-auto', !mobileViewOpen || !selectedOrder ? 'block' : 'hidden xl:block')}>
          <AdminOrderQueue orders={orders} selectedOrderId={selectedOrder?.id || null} onSelectOrder={(ord) => { setSelectedOrder(ord); setMobileViewOpen(true); setMobileTab('detalle'); setOrders((prev) => prev.map((o) => (o.id === ord.id ? { ...o, mensajes_no_leidos: 0 } : o))); }} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div className={cn('xl:col-span-5 xl:h-[calc(100vh-220px)] xl:overflow-y-auto', mobileViewOpen && selectedOrder && mobileTab === 'detalle' ? 'block' : 'hidden xl:block')}>
          <AdminOrderDetail order={selectedOrder} onUpdateStatus={handleUpdateStatus} onDeleteOrder={handleDeleteOrder} isUpdating={isUpdating} />
        </div>
        <div className={cn('xl:col-span-4 xl:h-[calc(100vh-220px)] xl:overflow-y-auto', mobileViewOpen && selectedOrder && mobileTab === 'chat' ? 'block' : 'hidden xl:block')}>
          {selectedOrder ? (
            <OrderLiveChat pedidoId={selectedOrder.id} usuarioRol="admin" usuarioNombre="Administrador Gran Catador" numeroOrden={selectedOrder.numero_orden} quickReplies={ADMIN_QUICK_REPLIES} />
          ) : (
            <div className="flex h-[540px] xl:h-[calc(100vh-220px)] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-400">
              Selecciona una orden para abrir el canal de chat con el cliente.
            </div>
          )}
        </div>
      </div>

      <QuickDeliveryCalculatorModal isOpen={deliveryCalcOpen} onClose={() => setDeliveryCalcOpen(false)} />
    </main>
  );
}
