'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Bike,
  CheckCheck,
  CheckCircle,
  PackageCheck,
  Trash2,
} from 'lucide-react';
import { EstadoPago, EstadoPedido, PedidoConDetalles } from '@/types';
import { cn } from '@/lib/utils';

interface AdminOrderStatusStepperProps {
  order: PedidoConDetalles;
  isUpdating: boolean;
  onUpdateStatus: (estadoPedido?: EstadoPedido, estadoPago?: EstadoPago) => Promise<void>;
  onRequestDelete: () => void;
}

interface StatusStepConfig {
  key: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  activeClass: string;
  inactiveClass: string;
  spanClass?: string;
  onClick: () => void;
}

/**
 * Stepper limpio de estados de pago y despacho donde solo el estado activo
 * actual destaca con fondo sólido y el resto permanece en estilo secundario.
 */
export function AdminOrderStatusStepper({
  order,
  isUpdating,
  onUpdateStatus,
  onRequestDelete,
}: AdminOrderStatusStepperProps) {
  const steps: StatusStepConfig[] = [
    {
      key: 'pago_ok',
      label: 'Pago OK',
      icon: <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
      isActive: order.estado_pago === 'verificado',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700',
      inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
      onClick: () => onUpdateStatus(undefined, 'verificado'),
    },
    {
      key: 'rechazar',
      label: 'Rechazar',
      icon: <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
      isActive: order.estado_pago === 'rechazado',
      activeClass: 'bg-red-600 text-white border-red-600 shadow-xs hover:bg-red-700',
      inactiveClass: 'bg-white border-red-200 text-red-600 hover:bg-red-50',
      onClick: () => onUpdateStatus(undefined, 'rechazado'),
    },
    {
      key: 'bodegon',
      label: 'Bodegón',
      icon: <PackageCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
      isActive: order.estado_pedido === 'preparando',
      activeClass: 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs hover:bg-slate-800',
      inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
      onClick: () => onUpdateStatus('preparando'),
    },
    {
      key: 'en_ruta',
      label: 'En Ruta',
      icon: <Bike className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
      isActive: order.estado_pedido === 'en_camino',
      activeClass: 'bg-amber-500 text-white border-amber-500 shadow-xs hover:bg-amber-600',
      inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
      onClick: () => onUpdateStatus('en_camino'),
    },
    {
      key: 'entregado',
      label: 'Entregado',
      icon: <CheckCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />,
      isActive: order.estado_pedido === 'entregado',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700',
      inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
      spanClass: 'col-span-2 sm:col-span-1',
      onClick: () => onUpdateStatus('entregado'),
    },
  ];

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Cambiar Estado del Pedido
        </span>
        <button
          type="button"
          onClick={onRequestDelete}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 p-1 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Eliminar Pedido</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {steps.map((step) => (
          <button
            key={step.key}
            type="button"
            disabled={isUpdating}
            aria-pressed={step.isActive}
            onClick={step.onClick}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl border min-h-[44px] px-2 py-1.5 font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              step.spanClass,
              step.isActive ? step.activeClass : step.inactiveClass
            )}
          >
            {step.icon}
            <span className="whitespace-nowrap">{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

