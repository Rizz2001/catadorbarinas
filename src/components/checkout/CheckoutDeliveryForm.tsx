'use client';

import Link from 'next/link';
import { Truck, Store, Check } from 'lucide-react';
import { DeliveryQuoteResult } from '@/types';
import { BARINAS_ZONE_COORDS } from '@/lib/delivery';
import { useGpsLocator } from '@/hooks/useGpsLocator';
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
  profileAddress?: string | null;
  storeAddress?: string;
}

const ZONAS_BARINAS = Object.keys(BARINAS_ZONE_COORDS);

/**
 * Paso 1 del Checkout: prioridad en modalidad de entrega, GPS/tarifa y ubicación, seguido por datos de contacto.
 */
export function CheckoutDeliveryForm({
  deliveryData,
  onChange,
  deliveryQuote,
  bcvRate = 1,
  profileAddress = null,
  storeAddress = 'C.C. Ciudad Catador Local N1 · Barinas',
}: CheckoutDeliveryFormProps) {
  const { locatingGps, gpsStatus, detectGps } = useGpsLocator((lat, lng) => {
    onChange({
      latitud: lat,
      longitud: lng,
      ...(deliveryData.direccion.trim()
        ? {}
        : { direccion: 'Ubicación GPS detectada en Barinas' }),
    });
  });

  const isSavedProfileMatch = Boolean(
    profileAddress &&
      deliveryData.direccion.trim() &&
      deliveryData.direccion.trim() === profileAddress.trim()
  );

  return (
    <div className="space-y-5">
      {/* Bloque Prioritario: Modalidad, Cotización GPS y Ubicación */}
      <div id="cotizar-delivery" className="space-y-4">
        <div className="grid grid-cols-2 rounded-xl bg-slate-100/80 p-1 gap-1">
          {[
            { id: 'delivery' as const, label: 'Delivery', icon: Truck },
            { id: 'pickup' as const, label: 'Retiro en Sede · Gratis', icon: Store },
          ].map(({ id, label, icon: Icon }) => {
            const active = deliveryData.tipoEntrega === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ tipoEntrega: id })}
                className={cn(
                  'min-h-[42px] px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn('h-4 w-4 shrink-0', active ? 'text-catador-blue' : 'text-slate-400')}
                  strokeWidth={1.5}
                />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {deliveryData.tipoEntrega === 'delivery' ? (
          <div className="space-y-3.5">
            {deliveryQuote && (
              <CheckoutDeliveryQuoteCard
                deliveryQuote={deliveryQuote}
                bcvRate={bcvRate}
                hasGps={Boolean(deliveryData.latitud && deliveryData.longitud)}
                latitud={deliveryData.latitud}
                longitud={deliveryData.longitud}
                locatingGps={locatingGps}
                gpsStatus={gpsStatus}
                onDetectGps={detectGps}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span>Dirección Exacta y Referencia *</span>
                    {isSavedProfileMatch && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <Check className="h-3 w-3" strokeWidth={2} /> De tu perfil
                      </span>
                    )}
                  </label>
                  <Link
                    href="/cuenta"
                    className="text-xs font-bold text-catador-blue hover:underline shrink-0"
                  >
                    {profileAddress ? 'Editar perfil' : 'Guardar en perfil'}
                  </Link>
                </div>
                <textarea
                  rows={2}
                  required
                  value={deliveryData.direccion}
                  onChange={(e) => onChange({ direccion: e.target.value })}
                  placeholder="Urbanización, calle, número de casa/edificio o punto de referencia..."
                  className={cn(CHECKOUT_INPUT_CLASS, 'min-h-[70px] py-2.5 resize-none')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50/80 border border-gray-100 p-3.5 flex items-center gap-3">
            <Store className="h-5 w-5 text-catador-blue shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900">Retiro Pick-Up sin costo</p>
              <p className="text-xs text-slate-500 truncate">{storeAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* Datos Personales del Cliente */}
      <div className="border-t border-gray-100 pt-4 space-y-3.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Datos de quien recibe o retira
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Nombre Completo *</label>
            <input
              type="text"
              required
              value={deliveryData.nombre}
              onChange={(e) => onChange({ nombre: e.target.value })}
              placeholder="Ej. Carlos Mendoza"
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>

          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Cédula o RIF *</label>
            <input
              type="text"
              required
              value={deliveryData.cedula}
              onChange={(e) => onChange({ cedula: e.target.value })}
              placeholder="Ej. V-24123456"
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>

          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Teléfono WhatsApp *</label>
            <input
              type="tel"
              required
              value={deliveryData.telefono}
              onChange={(e) => onChange({ telefono: e.target.value })}
              placeholder="Ej. 0414-5551234"
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>

          <div>
            <label className={CHECKOUT_LABEL_CLASS}>Correo Electrónico</label>
            <input
              type="email"
              value={deliveryData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="cliente@correo.com"
              className={CHECKOUT_INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label className={CHECKOUT_LABEL_CLASS}>Instrucciones Especiales (Opcional)</label>
          <input
            type="text"
            value={deliveryData.notas}
            onChange={(e) => onChange({ notas: e.target.value })}
            placeholder="Ej. Llamar al llegar, portón negro..."
            className={CHECKOUT_INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
