'use client';

import React from 'react';
import { Truck, RefreshCw, ShieldCheck, CreditCard } from 'lucide-react';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { TrustMetricItem } from '@/types';

interface TrustValueBarProps {
  initialMetrics?: TrustMetricItem[];
  active?: boolean;
}

const DEFAULT_METRICS: TrustMetricItem[] = [
  {
    figura: '< 45 min',
    titulo: 'Despacho Express en Barinas',
    subtitulo: 'Alto Barinas, Centro, Palma Sola y Varyná en motorizado o carga',
  },
  {
    figura: 'Tasa BCV',
    titulo: 'Cotización Bimonetaria Exacta',
    subtitulo: 'Precios sincronizados al día en Dólares ($ USD) y Bolívares',
  },
  {
    figura: 'Stock Garantizado',
    titulo: 'Inventario Real por Unidad o Caja',
    subtitulo: 'Licores con precinto oficial y víveres directo de nuestro almacén',
  },
  {
    figura: 'Bs. / $ USD',
    titulo: 'Pago Móvil, Zelle y Efectivo',
    subtitulo: 'Verificación inmediata y atención directa en nuestro Chat en Vivo',
  },
];

const METRIC_ICONS = [Truck, RefreshCw, ShieldCheck, CreditCard];

export function TrustValueBar({ initialMetrics, active = true }: TrustValueBarProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);

  const isVisible =
    storeConfig?.seccion_confianza_activa !== undefined
      ? storeConfig.seccion_confianza_activa
      : active;

  if (isVisible === false) return null;

  const metrics =
    storeConfig?.metricas_confianza && storeConfig.metricas_confianza.length > 0
      ? storeConfig.metricas_confianza
      : initialMetrics && initialMetrics.length > 0
        ? initialMetrics
        : DEFAULT_METRICS;

  return (
    <section
      aria-label="Garantías operativas de Gran Catador Barinas"
      className="rounded-xl bg-white border border-slate-200 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {metrics.map((item, idx) => {
          const Icon = METRIC_ICONS[idx % METRIC_ICONS.length];
          return (
            <div key={idx} className="p-4 sm:p-5 flex items-start gap-3.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-catador-blue mt-0.5">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-catador-blue tabular-nums block">
                  {item.figura}
                </span>
                <h3 className="text-[13px] sm:text-sm font-black text-slate-900 leading-snug mt-0.5">
                  {item.titulo}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-snug mt-1">
                  {item.subtitulo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
