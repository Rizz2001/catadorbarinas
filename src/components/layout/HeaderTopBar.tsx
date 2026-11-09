'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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
    <div className="bg-[#0F172A] text-slate-300 text-xs py-1.5 border-b border-slate-800">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-3">
        {/* Ubicación y Contacto Editorial */}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-300 min-w-0 flex-1 truncate">
          <span className="truncate">
            {storeConfig?.direccion_fisica || `${APP_CONFIG.city}, ${APP_CONFIG.country}`}
          </span>
          <span className="hidden md:inline text-slate-600">·</span>
          <span className="hidden md:inline shrink-0 text-slate-400 tabular-nums">
            Atención: {storeConfig?.telefono_atencion || APP_CONFIG.phone}
          </span>
        </div>

        {/* Tasa BCV Oficial Tipográfica */}
        <button
          type="button"
          onClick={() => fetchRate(true)}
          disabled={isLoading}
          title="Tasa oficial BCV sincronizada en vivo. Clic para actualizar."
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 tabular-nums"
        >
          <span className="font-medium text-slate-400">Tasa BCV:</span>
          <strong className="font-mono font-black text-catador-amber">
            Bs. {formattedRate}
          </strong>
          <RefreshCw
            className={cn(
              'h-3 w-3 text-slate-400 transition-transform shrink-0',
              isLoading && 'animate-spin text-catador-amber'
            )}
          />
        </button>
      </div>
    </div>
  );
}
