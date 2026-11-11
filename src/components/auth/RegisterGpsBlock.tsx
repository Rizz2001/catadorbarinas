'use client';

import { Crosshair, ExternalLink, Loader2, MapPin, Navigation } from 'lucide-react';

interface RegisterGpsBlockProps {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  locatingGps: boolean;
  gpsStatus: string | null;
  onDireccionChange: (val: string) => void;
  onDetectGps: () => void;
  onClearGps: () => void;
}

export function RegisterGpsBlock({
  direccion,
  latitud,
  longitud,
  locatingGps,
  gpsStatus,
  onDireccionChange,
  onDetectGps,
  onClearGps,
}: RegisterGpsBlockProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div>
        <label className="block font-extrabold text-slate-700 mb-1.5">
          Dirección en Barinas <span className="text-slate-400 font-normal">(Opcional)</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            autoComplete="street-address"
            value={direccion}
            onChange={(e) => onDireccionChange(e.target.value)}
            placeholder="Urbanización, calle, número de casa o referencia"
            className="w-full rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-catador-blue shrink-0" />
              <span>Ubicación GPS para Delivery Exacto</span>
            </span>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Calcula automáticamente tu tarifa de envío en Barinas
            </p>
          </div>

          <button
            type="button"
            disabled={locatingGps}
            onClick={onDetectGps}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-full bg-catador-amber-soft hover:bg-[#FDE68A] border border-catador-amber-oak/70 disabled:opacity-50 text-[#8B3E03] font-extrabold text-xs shrink-0 cursor-pointer transition-colors"
          >
            {locatingGps ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Ubicando...</span>
              </>
            ) : (
              <>
                <Crosshair className="h-3.5 w-3.5" />
                <span>{latitud ? 'Recotizar delivery (GPS)' : 'Cotizar delivery'}</span>
              </>
            )}
          </button>
        </div>

        {latitud && longitud && (
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-slate-800 tabular-nums">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                {latitud}, {longitud}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://maps.google.com/?q=${latitud},${longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-catador-blue hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Ver Mapa
              </a>
              <button
                type="button"
                onClick={onClearGps}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Quitar
              </button>
            </div>
          </div>
        )}

        {gpsStatus && (
          <p className="text-xs text-emerald-700 font-bold">{gpsStatus}</p>
        )}
      </div>
    </div>
  );
}

