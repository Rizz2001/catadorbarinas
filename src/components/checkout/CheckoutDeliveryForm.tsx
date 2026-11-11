'use client';

import { useState } from 'react';
import { Store, MapPin, Navigation, Bike, Truck, Loader2, ExternalLink } from 'lucide-react';
import { DeliveryQuoteResult } from '@/types';
import { BARINAS_ZONE_COORDS } from '@/lib/delivery';
import { formatUsd, formatVes } from '@/lib/currency';
import { cn } from '@/lib/utils';

export interface DeliveryDataState {
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  tipoEntrega: 'delivery' | 'pickup';
  direccion: string;
  zonaBarinas: string;
  notas: string;
  latitud?: number | null;
  longitud?: number | null;
}

interface CheckoutDeliveryFormProps {
  deliveryData: DeliveryDataState;
  onChange: (data: Partial<DeliveryDataState>) => void;
  deliveryQuote?: DeliveryQuoteResult;
  bcvRate?: number;
}

const ZONAS_BARINAS = Object.keys(BARINAS_ZONE_COORDS);

export function CheckoutDeliveryForm({
  deliveryData,
  onChange,
  deliveryQuote,
  bcvRate = 1,
}: CheckoutDeliveryFormProps) {
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const handleDetectGpsLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('Tu navegador no soporta geolocalización automática. Elige tu zona manualmente.');
      return;
    }

    setLocatingGps(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange({
          latitud: lat,
          longitud: lng,
          direccion:
            deliveryData.direccion.trim() ||
            `Ubicación GPS detectada (${lat}, ${lng}) - Indicar casa/edificio de referencia`,
        });
        setGpsStatus('¡Ubicación GPS detectada y tarifa de delivery cotizada!');
        setLocatingGps(false);
      },
      () => {
        setGpsStatus('No pudimos acceder al GPS. Verifica los permisos o selecciona tu sector en la lista.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Selector Modalidad de Entrega */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange({ tipoEntrega: 'delivery' })}
          className={cn(
            'flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'delivery'
              ? 'border-catador-blue bg-catador-blue/5 text-catador-blue ring-2 ring-catador-blue/20'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <MapPin className="h-4 w-4 shrink-0" /> Delivery a Domicilio
        </button>

        <button
          type="button"
          onClick={() => onChange({ tipoEntrega: 'pickup', latitud: null, longitud: null })}
          className={cn(
            'flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'pickup'
              ? 'border-catador-blue bg-catador-blue/5 text-catador-blue ring-2 ring-catador-blue/20'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Store className="h-4 w-4 shrink-0" /> Retiro Pick-Up en Sede
        </button>
      </div>

      {/* Datos Personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nombre y Apellido *</label>
          <input
            type="text"
            required
            placeholder="Ej: Carlos Pérez"
            value={deliveryData.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Cédula o RIF *</label>
          <input
            type="text"
            required
            placeholder="Ej: V-18.456.789"
            value={deliveryData.cedula}
            onChange={(e) => onChange({ cedula: e.target.value })}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
          <input
            type="tel"
            required
            placeholder="Ej: 0414-1234567"
            value={deliveryData.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={deliveryData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Cotizador por Ubicación GPS + Volumen si es Delivery */}
      {deliveryData.tipoEntrega === 'delivery' && (
        <div className="space-y-3 pt-1 text-xs">
          {/* Botón Ubicación GPS y Tarjeta de Cotización Inteligente */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-catador-blue" />
                  Tarifa de Entrega a Domicilio en Barinas
                </h4>
                <p className="text-[11px] text-slate-500">
                  Calculada automáticamente según tu distancia GPS y el volumen de productos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDetectGpsLocation}
                disabled={locatingGps}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                {locatingGps ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Ubicando GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5" />
                    <span>
                      {deliveryData.latitud ? 'Recotizar delivery (GPS)' : 'Cotizar delivery'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {gpsStatus && (
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                <span>{gpsStatus}</span>
                {deliveryData.latitud && deliveryData.longitud && (
                  <a
                    href={`https://maps.google.com/?q=${deliveryData.latitud},${deliveryData.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-catador-blue underline shrink-0"
                  >
                    Ver Mapa <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {deliveryQuote && (
              <div
                className={cn(
                  'rounded-xl border p-3 space-y-2.5 transition-all',
                  deliveryQuote.transportType === 'vehiculo_carga'
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-white border-blue-100 text-slate-800 shadow-2xs'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {deliveryQuote.transportType === 'vehiculo_carga' ? (
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                        <Truck className="h-5 w-5 shrink-0" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-blue-50 text-catador-blue">
                        <Bike className="h-5 w-5 shrink-0" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900">
                          {deliveryQuote.tierName || deliveryQuote.reasonText}
                        </span>
                        {deliveryQuote.tierBadge && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-catador-blue text-white">
                            {deliveryQuote.tierBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Distancia: <strong>{deliveryQuote.distanceKm} km</strong> • Carga:{' '}
                        <strong>
                          {deliveryQuote.totalUnitsEquivalent} unidades
                          {deliveryQuote.totalBoxesEquivalent > 0
                            ? ` (~${Math.ceil(deliveryQuote.totalBoxesEquivalent)} cajas)`
                            : ''}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-base text-catador-blue block">
                      {deliveryQuote.shippingUsd === 0 ? '¡GRATIS!' : formatUsd(deliveryQuote.shippingUsd)}
                    </span>
                    {deliveryQuote.shippingUsd > 0 && (
                      <span className="text-[11px] font-bold text-slate-600">
                        {formatVes(deliveryQuote.shippingUsd * bcvRate)}
                      </span>
                    )}
                  </div>
                </div>

                {deliveryQuote.detailsBreakdown && (
                  <p className="text-[10px] text-slate-500 bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                    <strong>Desglose:</strong> {deliveryQuote.detailsBreakdown}
                  </p>
                )}
              </div>
            )}

            {/* Escala oficial de tarifas para conocimiento del cliente */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-[10px] text-slate-600">
              <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500 block mb-1">
                Tarifario Oficial de Carreras Gran Catador:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-medium tabular-nums">
                <span className="p-1 rounded bg-slate-50 border border-slate-100">
                  0 a 3 km: <strong>$1.50</strong>
                </span>
                <span className="p-1 rounded bg-slate-50 border border-slate-100">
                  3 a 6 km: <strong>$2.50</strong>
                </span>
                <span className="p-1 rounded bg-slate-50 border border-slate-100">
                  6 a 9 km: <strong>$3.50</strong>
                </span>
                <span className="p-1 rounded bg-slate-50 border border-slate-100">
                  9 a 12 km: <strong>$4.50</strong>
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5">
                Carreras desde 20 km en adelante: <strong>$0.45 por km</strong>. Pedidos de alto volumen se despachan en vehículo de carga (+ recargo logístico).
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sector o Zona en Barinas *</label>
            <select
              value={deliveryData.zonaBarinas}
              onChange={(e) => onChange({ zonaBarinas: e.target.value, latitud: null, longitud: null })}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
            >
              {ZONAS_BARINAS.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dirección Exacta y Punto de Referencia *</label>
            <textarea
              rows={2}
              required
              placeholder="Ej: Calle Principal con Av. 2, casa #45 frente a la panadería"
              value={deliveryData.direccion}
              onChange={(e) => onChange({ direccion: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
            />
          </div>
        </div>
      )}

      <div className="text-xs">
        <label className="block font-bold text-slate-700 mb-1">Instrucciones Especiales (Opcional)</label>
        <input
          type="text"
          placeholder="Ej: Por favor enviar cervezas bien frías, tocar timbre blanco"
          value={deliveryData.notas}
          onChange={(e) => onChange({ notas: e.target.value })}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs bg-white text-slate-900"
        />
      </div>
    </div>
  );
}
