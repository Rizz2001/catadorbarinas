'use client';

import { Bike, RefreshCw } from 'lucide-react';
import { formatUsd, formatVes } from '@/lib/currency';
import { AdminPushToggle } from '@/components/admin/AdminPushToggle';
import { AdminPageHeader } from '@/components/admin/ui';
import { AdminAlertsMenu } from './AdminAlertsMenu';

export const ADMIN_QUICK_REPLIES = [
  '¡Hola! Ya estamos revisando tu comprobante de pago.',
  'Pago confirmado, ya estamos empacando tu pedido en el Bodegón.',
  'Por favor verifica el número de referencia o envíanos captura legible por aquí.',
  'Nuestro motorizado ya va saliendo hacia tu ubicación en Barinas.',
  'Tu pedido ya fue entregado. ¡Gracias por confiar en Gran Catador!',
];

export interface AdminPedidosKpis {
  receivedCount: number;
  pendingPayCount: number;
  activeDispatchCount: number;
  deliveredCount: number;
  revenueUsd: number;
  revenueVes: number;
}

interface AdminPedidosHeaderKpisProps {
  totalOrdersCount: number;
  kpis: AdminPedidosKpis;
  soundEnabled: boolean;
  notificationPermission?: NotificationPermission | null;
  onToggleSound: () => void;
  onTestAlert: () => void;
  onOpenDeliveryCalc: () => void;
  onSync: () => void;
}

/**
 * Cabecera operativa limpia y banda de KPIs del Centro de Despacho.
 */
export function AdminPedidosHeaderKpis({
  totalOrdersCount,
  kpis,
  soundEnabled,
  notificationPermission = null,
  onToggleSound,
  onTestAlert,
  onOpenDeliveryCalc,
  onSync,
}: AdminPedidosHeaderKpisProps) {
  const needsPermission = notificationPermission === 'default';

  const kpiCards = [
    {
      label: 'Por verificar',
      dotClass: 'bg-amber-500',
      value: String(kpis.receivedCount),
      valueClass: 'text-slate-900',
      sub: `${kpis.pendingPayCount} pagos pendientes`,
      subClass: 'font-semibold text-amber-700',
    },
    {
      label: 'En bodegón y ruta',
      dotClass: 'bg-catador-blue',
      value: String(kpis.activeDispatchCount),
      valueClass: 'text-catador-blue',
      sub: 'despachos activos',
      subClass: 'font-medium text-slate-500',
    },
    {
      label: 'Completadas',
      dotClass: 'bg-emerald-500',
      value: String(kpis.deliveredCount),
      valueClass: 'text-emerald-700',
      sub: `de ${totalOrdersCount} órdenes`,
      subClass: 'font-medium text-slate-500',
    },
    {
      label: 'Volumen activo',
      dotClass: 'bg-slate-400',
      value: formatUsd(kpis.revenueUsd),
      valueClass: 'text-slate-900',
      sub: formatVes(kpis.revenueVes),
      subClass: 'font-semibold text-slate-500 truncate',
    },
  ];

  return (
    <>
      <AdminPageHeader
        section="Pedidos"
        title="Despacho y Pedidos"
        description="Verificación de pagos, facturación en caja y chat en vivo con clientes."
        showBcvPill
        actions={
          <>
            <AdminPushToggle />

            <AdminAlertsMenu
              soundEnabled={soundEnabled}
              needsPermission={needsPermission}
              onToggleSound={onToggleSound}
              onTestAlert={onTestAlert}
            />

            <button
              type="button"
              onClick={onOpenDeliveryCalc}
              className="md:hidden flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 min-h-[36px] px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Bike className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.75} />
              <span>Delivery</span>
            </button>

            <button
              type="button"
              onClick={onSync}
              title="Sincronizar órdenes"
              aria-label="Sincronizar órdenes"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white min-h-[36px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          </>
        }
      />

      {needsPermission && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-950">
          <span className="font-medium">
            Activa el sonido al iniciar tu turno para escuchar el timbre cada vez que entre un pedido nuevo.
          </span>
          <button
            type="button"
            onClick={onToggleSound}
            className="shrink-0 self-start sm:self-auto rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Activar sonido
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl bg-white border border-slate-200/80 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="px-4 py-3.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${kpi.dotClass}`} />
              <span>{kpi.label}</span>
            </span>
            <div className="flex items-baseline gap-2 mt-1.5 tabular-nums">
              <span className={`text-xl font-bold tracking-tight ${kpi.valueClass}`}>{kpi.value}</span>
              <span className={`text-xs ${kpi.subClass}`}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
