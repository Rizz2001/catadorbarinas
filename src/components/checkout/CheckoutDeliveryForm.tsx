'use client';

import { useState } from 'react';
import { Store, MapPin } from 'lucide-react';
import { DeliveryQuoteResult } from '@/types';
import { BARINAS_ZONE_COORDS } from '@/lib/delivery';
import { cn } from '@/lib/utils';
import { CHECKOUT_INPUT_CLASS, CHECKOUT_LABEL_CLASS } from './checkoutStyles';
import { CheckoutDeliveryQuoteCard } from './CheckoutDeliveryQuoteCard';

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
      setGpsStatus('Tu navegador no soporta geolocalización. Selecciona tu zona.');
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
            `Ubicación GPS (${lat}, ${lng}) - Indicar referencia`,
        });
        setGpsStatus('Ubicación GPS actualizada.');
        setLocatingGps(false);
      },
      () => {
        setGpsStatus('No pudimos acceder al GPS. Selecciona tu zona manualmente.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      <div
        role="radiogroup"
        aria-label="Modalidad de entrega"
        className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={deliveryData.tipoEntrega === 'delivery'}
          onClick={() => onChange({ tipoEntrega: 'delivery' })}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 min-h-[40px] rounded-lg text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'delivery'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>Delivery</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={deliveryData.tipoEntrega === 'pickup'}
          onClick={() => onChange({ tipoEntrega: 'pickup', latitud: null, longitud: null })}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 min-h-[40px] rounded-lg text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'pickup'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span>Retiro en Sede</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={CHECKOUT_LABEL_CLASS}>Nombre y Apellido *</label>
          <input
            type="text"
            required
            placeholder="Ej: Carlos Pérez"
            value={deliveryData.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>

        <div>
          <label className={CHECKOUT_LABEL_CLASS}>Cédula o RIF *</label>
          <input
            type="text"
            required
            placeholder="Ej: V-18.456.789"
            value={deliveryData.cedula}
            onChange={(e) => onChange({ cedula: e.target.value })}
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>

        <div>
          <label className={CHECKOUT_LABEL_CLASS}>Teléfono / WhatsApp *</label>
          <input
            type="tel"
            required
            placeholder="Ej: 0414-1234567"
            value={deliveryData.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>

        <div>
          <label className={CHECKOUT_LABEL_CLASS}>Correo Electrónico (Opcional)</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={deliveryData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>
      </div>

      {deliveryData.tipoEntrega === 'delivery' && (
        <div className="space-y-3 pt-1">
          {deliveryQuote && (
            <CheckoutDeliveryQuoteCard
              deliveryQuote={deliveryQuote}
              bcvRate={bcvRate}
              hasGps={Boolean(deliveryData.latitud)}
              latitud={deliveryData.latitud}
              longitud={deliveryData.longitud}
              locatingGps={locatingGps}
              gpsStatus={gpsStatus}
              onDetectGps={handleDetectGpsLocation}
            />
          )}

          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Sector o Zona en Barinas *</label>
            <select
              value={deliveryData.zonaBarinas}
              onChange={(e) =>
                onChange({ zonaBarinas: e.target.value, latitud: null, longitud: null })
              }
              className={CHECKOUT_INPUT_CLASS}
            >
              {ZONAS_BARINAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Dirección Exacta y Referencia *</label>
            <textarea
              rows={2}
              required
              placeholder="Ej: Calle Principal con Av. 2, casa #45 frente a la panadería"
              value={deliveryData.direccion}
              onChange={(e) => onChange({ direccion: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-base md:text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/15"
            />
          </div>
        </div>
      )}

      <div>
        <label className={CHECKOUT_LABEL_CLASS}>Instrucciones Especiales (Opcional)</label>
        <input
          type="text"
          placeholder="Ej: Por favor enviar cervezas bien frías, tocar timbre"
          value={deliveryData.notas}
          onChange={(e) => onChange({ notas: e.target.value })}
          className={CHECKOUT_INPUT_CLASS}
        />
      </div>
    </div>
  );
}
