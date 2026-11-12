'use client';

import { Bike, Truck, Navigation, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
import { DeliveryQuoteResult } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CheckoutDeliveryQuoteCardProps {
  deliveryQuote: DeliveryQuoteResult;
  bcvRate: number;
  hasGps: boolean;
  latitud?: number | null;
  longitud?: number | null;
  locatingGps: boolean;
  gpsStatus: string | null;
  onDetectGps: () => void;
}

/**
 * Muestra la tarifa de entrega calculada y esconde el desglose/tarifario en un acordeón cerrado.
 */
export function CheckoutDeliveryQuoteCard({
  deliveryQuote,
  bcvRate,
  hasGps,
  latitud,
  longitud,
  locatingGps,
  gpsStatus,
  onDetectGps,
}: CheckoutDeliveryQuoteCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {deliveryQuote.transportType === 'vehiculo_carga' ? (
            <Truck className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5}/>
          ) : (
            <Bike className="h-4 w-4 text-catador-blue shrink-0" strokeWidth={1.5}/>
          )}
          <div className="min-w-0 tabular-nums">
            <span className="text-xs font-medium text-slate-600 block">Tarifa de Entrega</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-base font-black leading-tight',
                  deliveryQuote.shippingUsd === 0 ? 'text-emerald-600' : 'text-slate-900'
                )}
              >
                {deliveryQuote.shippingUsd === 0 ? 'Gratis' : formatUsd(deliveryQuote.shippingUsd)}
              </span>
              {deliveryQuote.shippingUsd > 0 && (
                <span className="text-xs text-slate-500">
                  ({formatVes(deliveryQuote.shippingUsd * bcvRate)})
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDetectGps}
          disabled={locatingGps}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-catador-blue font-bold text-xs transition-colors cursor-pointer shrink-0"
        >
          {locatingGps ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5}/>
          ) : (
            <Navigation className="h-3.5 w-3.5" strokeWidth={1.5}/>
          )}
          <span>{hasGps ? 'Recotizar delivery' : 'Cotizar delivery'}</span>
        </button>
      </div>

      {gpsStatus && (
        <div className="flex items-center justify-between gap-2 text-xs text-emerald-700 font-medium">
          <span>{gpsStatus}</span>
          {latitud && longitud && (
            <a
              href={`https://maps.google.com/?q=${latitud},${longitud}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-catador-blue underline shrink-0"
            >
              Ver mapa <ExternalLink className="h-3 w-3" strokeWidth={1.5}/>
            </a>
          )}
        </div>
      )}

      <details className="group">
        <summary className="list-none inline-flex items-center gap-1 text-xs font-semibold text-catador-blue hover:underline cursor-pointer select-none">
          <span>Ver detalles de tarifa</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" strokeWidth={1.5}/>
        </summary>
        <div className="mt-2.5 pt-2.5 border-t border-gray-200/70 space-y-2 text-[11px] text-slate-500 tabular-nums">
          <p>
            {deliveryQuote.tierName || deliveryQuote.reasonText} · Distancia:{' '}
            <strong className="text-slate-700">{deliveryQuote.distanceKm} km</strong> · Carga:{' '}
            <strong className="text-slate-700">{deliveryQuote.totalUnitsEquivalent} und</strong>
          </p>
          {deliveryQuote.detailsBreakdown && <p>{deliveryQuote.detailsBreakdown}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            <span className="p-1.5 rounded-lg bg-white border border-gray-100">
              0–3 km: <strong>$1.50</strong>
            </span>
            <span className="p-1.5 rounded-lg bg-white border border-gray-100">
              3–6 km: <strong>$2.50</strong>
            </span>
            <span className="p-1.5 rounded-lg bg-white border border-gray-100">
              6–9 km: <strong>$3.50</strong>
            </span>
            <span className="p-1.5 rounded-lg bg-white border border-gray-100">
              9–12 km: <strong>$4.50</strong>
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            20+ km: $0.45/km. Pedidos de alto volumen se despachan en vehículo de carga.
          </p>
        </div>
      </details>
    </div>
  );
}

