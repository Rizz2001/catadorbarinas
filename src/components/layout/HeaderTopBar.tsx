'use client';

import React, { useEffect } from 'react';
import { MapPin, Phone, RefreshCw } from 'lucide-react';
import { useBcvStore } from '@/store/useBcvStore';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { APP_CONFIG } from '@/constants/config';
import { cn } from '@/lib/utils';

export function HeaderTopBar() {
  const { rateInfo, fetchRate, isLoading } = useBcvStore();
  const storeConfig = useStoreConfigStore((state) => state.config);
  const fetchConfig = useStoreConfigStore((state) => state.fetchConfig);

  useEffect(() => {
    fetchRate();
    fetchConfig();
  }, [fetchRate, fetchConfig]);

  const formattedRate = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rateInfo.rate);

  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-1 sm:py-1.5 border-b border-slate-800">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* Ubicación y Contacto */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] min-w-0 flex-1">
          <span className="flex items-center gap-1 truncate min-w-0">
            <MapPin className="h-3 w-3 text-catador-amber shrink-0" />
            <span className="truncate">
              {storeConfig?.direccion_fisica || `${APP_CONFIG.city}, ${APP_CONFIG.country}`}
            </span>
          </span>
          <span className="hidden md:flex items-center gap-1 shrink-0">
            <Phone className="h-3 w-3 text-catador-amber shrink-0" />
            Atención: {storeConfig?.telefono_atencion || APP_CONFIG.phone}
          </span>
        </div>

        {/* Badge Destacado de Tasa BCV Oficial sincronizada con DolarApi */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => fetchRate(true)}
            disabled={isLoading}
            title="Tasa oficial BCV sincronizada en vivo vía DolarApi. Clic para refrescar."
            className="flex items-center gap-1 bg-catador-blue/60 hover:bg-catador-blue border border-catador-amber/40 rounded-full px-2 sm:px-2.5 py-0.5 min-h-[24px] text-white transition-colors cursor-pointer group tabular-nums"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 hidden sm:inline">
              Tasa BCV:
            </span>
            <span className="text-[10px] font-semibold text-slate-200 sm:hidden">BCV:</span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-catador-amber font-mono">
              Bs. {formattedRate}
            </span>
            <RefreshCw
              className={cn(
                'h-2.5 w-2.5 text-slate-300 ml-0.5 transition-transform shrink-0',
                isLoading && 'animate-spin text-catador-amber'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
