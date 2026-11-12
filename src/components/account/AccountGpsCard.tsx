'use client';

import { Crosshair, ExternalLink, Loader2, Navigation, Truck } from 'lucide-react';
import { BARINAS_ZONE_COORDS, calculateDistanceKm, getDeliveryTierInfo } from '@/lib/delivery';
import { formatUsd, formatVes, convertUsdToVes } from '@/lib/currency';
import { useStoreConfigStore } from '@/store/useStoreConfigStore';
import { useBcvStore } from '@/store/useBcvStore';

interface AccountGpsCardProps {
  latitud: number | null;
  longitud: number | null;
  selectedZone?: string;
  locatingGps: boolean;
  gpsStatus: string | null;
  onDetectGps: () => void;
  onClearGps: () => void;
}

export function AccountGpsCard({
  latitud,
  longitud,
  selectedZone,
  locatingGps,
  gpsStatus,
  onDetectGps,
  onClearGps,
}: AccountGpsCardProps) {
  const storeConfig = useStoreConfigStore((s) => s.config);
  const bcvRate = useBcvStore((s) => s.rateInfo.rate);

  const storeLat = Number(storeConfig?.tienda_lat ?? 8.6226);
  const storeLng = Number(storeConfig?.tienda_lng ?? -70.2075);
  const zoneInfo = selectedZone ? BARINAS_ZONE_COORDS[selectedZone] : null;

  const hasExactGps = typeof latitud === 'number' && typeof longitud === 'number';
  const distanceKm = hasExactGps
    ? calculateDistanceKm(storeLat, storeLng, latitud!, longitud!)
    : zoneInfo?.approxKm ?? null;
  const quoteInfo =
    distanceKm !== null ? getDeliveryTierInfo(distanceKm, storeConfig) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
            <span>Ubicación Satelital GPS y Tarifa</span>
          </span>
          <p className="text-xs text-slate-600 mt-0.5">
            Guarda tu ubicación exacta para prellenar y cotizar delivery automáticamente en el carrito.
          </p>
        </div>

        <button
          type="button"
          disabled={locatingGps}
          onClick={onDetectGps}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-catador-amber-soft hover:bg-[#FDE68A] border border-catador-amber-oak/70 disabled:opacity-50 text-[#8B3E03] font-extrabold text-xs transition-colors cursor-pointer shrink-0 min-h-[40px]"
        >
          {locatingGps ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5}/>
              <span>Obteniendo GPS...</span>
            </>
          ) : (
            <>
              <Crosshair className="h-4 w-4" strokeWidth={1.5}/>
              <span>{hasExactGps ? 'Recotizar delivery (GPS)' : 'Cotizar delivery'}</span>
            </>
          )}
        </button>
      </div>

      {quoteInfo && distanceKm !== null && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs tabular-nums">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-catador-blue shrink-0" strokeWidth={1.5}/>
            <div>
              <span className="font-extrabold text-slate-900">
                {quoteInfo.tierBadge} · {distanceKm} km
              </span>
              <span className="text-[11px] text-slate-500 block">
                {hasExactGps ? 'Calculado por GPS guardado' : `Referencia por sector (${selectedZone})`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-black text-catador-blue text-sm block leading-none">
              {formatUsd(quoteInfo.baseDeliveryUsd)}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {formatVes(convertUsdToVes(quoteInfo.baseDeliveryUsd, bcvRate))}
            </span>
          </div>
        </div>
      )}

      {hasExactGps && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-800 tabular-nums">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">
              {latitud}, {longitud}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`https://maps.google.com/?q=${latitud},${longitud}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-catador-blue hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5}/>
              <span>Ver en Google Maps</span>
            </a>
            <button
              type="button"
              onClick={onClearGps}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Quitar GPS
            </button>
          </div>
        </div>
      )}

      {gpsStatus && <p className="text-xs text-emerald-700 font-bold">{gpsStatus}</p>}
    </div>
  );
}

