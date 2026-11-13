'use client';

import Link from 'next/link';
import { ArrowLeft, Bike, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { formatUsd, formatVes } from '@/lib/currency';

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
  onToggleSound: () => void;
  onOpenDeliveryCalc: () => void;
  onSync: () => void;
}

/**
 * Cabecera operativa y banda de KPIs del Centro de Comando y Despacho.
 */
export function AdminPedidosHeaderKpis({
  totalOrdersCount,
  kpis,
  soundEnabled,
  onToggleSound,
  onOpenDeliveryCalc,
  onSync,
}: AdminPedidosHeaderKpisProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            Centro de Comando y Despacho
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bodegón Central • Facturación en caja, verificación de pagos y chat en tiempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenDeliveryCalc}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-50 min-h-[36px] px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Bike className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.5} />
            <span>Cotizar Delivery</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white min-h-[36px] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5} />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            )}
            <span>{soundEnabled ? 'Alertas Sonoras' : 'Silenciado'}</span>
          </button>

          <button
            type="button"
            onClick={onSync}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white min-h-[36px] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Sincronizar</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A] min-h-[36px] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Tienda</span>
          </Link>
        </div>
      </div>

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
            <span className="text-xs font-medium text-slate-500">de {totalOrdersCount} totales</span>
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
    </>
  );
}
