'use client';

import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Bike, CheckCheck } from 'lucide-react';
import { EstadoPedido } from '@/types';
import { cn } from '@/lib/utils';

interface OrderLiveStepperProps {
  estado: EstadoPedido;
}

const STEPS = [
  { id: 'recibido', label: '1. Recibido', desc: 'Verificando Pago', icon: Clock },
  { id: 'preparando', label: '2. En Bodegón', desc: 'Preparando Empaque', icon: PackageCheck },
  { id: 'en_camino', label: '3. En Camino', desc: 'Repartidor en Ruta', icon: Bike },
  { id: 'entregado', label: '4. Entregado', desc: 'Completado con Éxito', icon: CheckCheck },
];

export function OrderLiveStepper({ estado }: OrderLiveStepperProps) {
  const getStepIndex = (st: EstadoPedido) => {
    switch (st) {
      case 'recibido': return 0;
      case 'preparando': return 1;
      case 'en_camino': return 2;
      case 'entregado': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(estado);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            Estado de tu Orden en Tiempo Real
          </h2>
        </div>
        <span className="text-xs font-bold text-catador-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
          En Vivo
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center text-center p-3 rounded-xl border transition-all',
                isCurrent
                  ? 'border-catador-amber bg-amber-50/70 ring-2 ring-catador-amber/20 shadow-xs'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                  : 'border-slate-100 bg-slate-50/60 text-slate-400'
              )}
            >
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center mb-1.5 transition-colors',
                  isCurrent
                    ? 'bg-catador-amber text-white shadow-xs animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                )}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={cn('text-xs font-bold', isCurrent ? 'text-slate-900' : isDone ? 'text-emerald-900' : 'text-slate-400')}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
