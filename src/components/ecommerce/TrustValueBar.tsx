'use client';

import React from 'react';
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

export function TrustValueBar({ initialMetrics, active = true }: TrustValueBarProps) {
  const storeConfig = useStoreConfigStore((state) => state.config);

  const isVisible = storeConfig?.seccion_confianza_activa !== undefined
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
      className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200/90">
        {metrics.map((item, idx) => (
          <div key={idx} className="p-3 sm:p-5 flex flex-col justify-between gap-1 min-w-0">
            <div className="flex items-baseline justify-between gap-1.5">
              <span className="text-sm sm:text-xl font-black text-catador-blue tracking-tight tabular-nums truncate">
                {item.figura}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber shrink-0" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[11px] sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                {item.titulo}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
                {item.subtitulo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
