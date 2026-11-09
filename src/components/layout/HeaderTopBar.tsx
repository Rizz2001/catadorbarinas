'use client';

import React, { useEffect } from 'react';
import { RefreshCw, MapPin, Phone } from 'lucide-react';
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
    <div className="bg-[#0F172A] text-slate-100 py-2 sm:py-2.5 border-b border-slate-800">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-3">
        {/* Ubicación y Contacto con Alto Contraste (13-14px) */}
        <div className="flex items-center gap-3 text-[13px] sm:text-sm text-slate-200 min-w-0 flex-1 truncate">
          <span className="inline-flex items-center gap-1.5 truncate font-medium">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {storeConfig?.direccion_fisica || `${APP_CONFIG.city}, ${APP_CONFIG.country}`}
            </span>
          </span>
          <span className="hidden md:inline text-slate-600">·</span>
          <span className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-slate-200 font-medium tabular-nums">
            <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{storeConfig?.telefono_atencion || APP_CONFIG.phone}</span>
          </span>
        </div>

        {/* Tasa BCV Oficial con Mayor Peso Visual */}
        <button
          type="button"
          onClick={() => fetchRate(true)}
          disabled={isLoading}
          title="Tasa oficial BCV sincronizada en vivo. Clic para actualizar."
          className="flex items-center gap-2 rounded-md bg-slate-800/90 hover:bg-slate-800 border border-amber-400/50 px-3 py-1 text-[13px] sm:text-sm text-white transition-colors cursor-pointer shrink-0 tabular-nums"
        >
          <span className="font-semibold text-slate-200">Tasa BCV:</span>
          <strong className="font-black text-amber-300 tracking-tight">
            Bs. {formattedRate}
          </strong>
          <RefreshCw
            className={cn(
              'h-3.5 w-3.5 text-slate-300 transition-transform shrink-0',
              isLoading && 'animate-spin text-amber-300'
            )}
          />
        </button>
      </div>
    </div>
  );
}
