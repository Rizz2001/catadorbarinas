'use client';

import React from 'react';
import { MapPin, Phone, RefreshCw } from 'lucide-react';
import { useBcvStore } from '@/store/useBcvStore';
import { APP_CONFIG } from '@/constants/config';

export function HeaderTopBar() {
  const { rateInfo } = useBcvStore();

  const formattedRate = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rateInfo.rate);

  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Ubicación y Contacto */}
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-catador-amber" />
            {APP_CONFIG.city}, {APP_CONFIG.country}
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Phone className="h-3 w-3 text-catador-amber" />
            Atención: {APP_CONFIG.phone}
          </span>
        </div>

        {/* Badge Destacado de Tasa BCV Oficial */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-catador-blue/60 hover:bg-catador-blue border border-catador-amber/40 rounded-full px-2.5 py-0.5 text-white transition-colors cursor-default">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-200">Tasa Oficial BCV:</span>
            <span className="text-[11px] font-extrabold text-catador-amber">
              Bs. {formattedRate} / $
            </span>
            <RefreshCw className="h-2.5 w-2.5 text-slate-300 ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
