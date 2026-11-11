'use client';

import { useEffect } from 'react';
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
    <div className="bg-[#F7F8FA] text-slate-700 py-1.5 sm:py-2 border-b border-slate-200/80">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[13px] sm:text-sm text-slate-700 min-w-0 flex-1 truncate">
          <span className="inline-flex items-center gap-1.5 truncate font-semibold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-catador-amber shrink-0" />
            <span className="truncate">
              {storeConfig?.direccion_fisica || `${APP_CONFIG.city}, ${APP_CONFIG.country}`}
            </span>
          </span>
          <span className="hidden md:inline text-slate-300">·</span>
          <span className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-slate-700 font-semibold tabular-nums">
            <Phone className="h-3.5 w-3.5 text-catador-blue shrink-0" />
            <span>{storeConfig?.telefono_atencion || APP_CONFIG.phone}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => fetchRate(true)}
          disabled={isLoading}
          title="Tasa oficial BCV sincronizada en vivo. Clic para actualizar."
          className="lg:hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D99B38] to-[#C88A28] px-3 py-1 text-xs font-extrabold text-white transition-colors cursor-pointer shrink-0 tabular-nums"
        >
          <span>Tasa BCV: Bs. {formattedRate}</span>
          <RefreshCw
            className={cn(
              'h-3 w-3 text-white transition-transform shrink-0',
              isLoading && 'animate-spin'
            )}
          />
        </button>

        <span className="hidden lg:inline-flex items-center gap-2 text-xs font-bold text-slate-600">
          <span>
            {storeConfig?.transferencia_activa === false
              ? 'Pago Móvil · Zelle · Efectivo USD'
              : 'Pago Móvil · Transferencia · Zelle · Efectivo USD'}
          </span>
        </span>
      </div>
    </div>
  );
}
