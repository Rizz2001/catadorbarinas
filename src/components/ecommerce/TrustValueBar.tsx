'use client';

import React from 'react';
import { Clock, ShieldCheck, Coins, CreditCard } from 'lucide-react';

interface TrustBenefit {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  highlight: string;
}

const BENEFITS: TrustBenefit[] = [
  {
    icon: Clock,
    title: 'Delivery Express Barinas',
    subtitle: 'Alto Barinas, Centro y Varyná',
    highlight: '< 45 min',
  },
  {
    icon: Coins,
    title: 'Tasa Oficial BCV',
    subtitle: 'Cotización al día y transparente',
    highlight: 'Sin recargos',
  },
  {
    icon: ShieldCheck,
    title: '100% Calidad Garantizada',
    subtitle: 'Licores y víveres con precinto oficial',
    highlight: 'Verificado',
  },
  {
    icon: CreditCard,
    title: 'Múltiples Formas de Pago',
    subtitle: 'Pago Móvil, Zelle, Tarjeta y Efectivo',
    highlight: 'Bs / $ USD',
  },
];

export function TrustValueBar() {
  return (
    <section
      aria-label="Beneficios y Garantías Gran Catador"
      className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 py-1"
    >
      {BENEFITS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-catador-blue/40 hover:shadow-xs transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-catador-blue/10 text-catador-blue group-hover:bg-catador-blue group-hover:text-white transition-colors duration-200">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                  {item.title}
                </h4>
                <span className="inline-block text-[10px] font-extrabold text-catador-amber bg-amber-50 px-1.5 py-0.5 rounded-md">
                  {item.highlight}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
