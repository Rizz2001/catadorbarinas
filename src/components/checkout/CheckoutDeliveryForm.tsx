'use client';

import React from 'react';
import { Store, MapPin } from 'lucide-react';
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
}

interface CheckoutDeliveryFormProps {
  deliveryData: DeliveryDataState;
  onChange: (data: Partial<DeliveryDataState>) => void;
}

const ZONAS_BARINAS = [
  'Alto Barinas Norte / Urb. Los Corozos',
  'Alto Barinas Sur / Av. Francia',
  'Barinas Centro / Av. 23 de Enero',
  'Urb. Don Samuel / Palacio Fajardo',
  'Los Pozones / José Antonio Páez',
  'Ciudad Varyná',
  'Otra zona urbana de Barinas',
];

export function CheckoutDeliveryForm({ deliveryData, onChange }: CheckoutDeliveryFormProps) {
  return (
    <div className="space-y-4">
      {/* Selector Modalidad de Entrega */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange({ tipoEntrega: 'delivery' })}
          className={cn(
            'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'delivery'
              ? 'border-catador-blue bg-catador-blue/5 text-catador-blue ring-2 ring-catador-blue/20'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <MapPin className="h-4 w-4" /> Delivery a Domicilio
        </button>

        <button
          type="button"
          onClick={() => onChange({ tipoEntrega: 'pickup' })}
          className={cn(
            'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
            deliveryData.tipoEntrega === 'pickup'
              ? 'border-catador-blue bg-catador-blue/5 text-catador-blue ring-2 ring-catador-blue/20'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <Store className="h-4 w-4" /> Retiro en Bodegón
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
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Cédula o RIF *</label>
          <input
            type="text"
            required
            placeholder="Ej: V-18.456.789 o J-40123456"
            value={deliveryData.cedula}
            onChange={(e) => onChange({ cedula: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={deliveryData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      {/* Dirección si es Delivery */}
      {deliveryData.tipoEntrega === 'delivery' && (
        <div className="space-y-3 pt-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sector o Zona en Barinas *</label>
            <select
              value={deliveryData.zonaBarinas}
              onChange={(e) => onChange({ zonaBarinas: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>
      )}

      {/* Notas adicionales */}
      <div className="text-xs">
        <label className="block font-bold text-slate-700 mb-1">Instrucciones Especiales (Opcional)</label>
        <input
          type="text"
          placeholder="Ej: Por favor enviar cervezas bien frías, tocar timbre blanco"
          value={deliveryData.notas}
          onChange={(e) => onChange({ notas: e.target.value })}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
        />
      </div>
    </div>
  );
}
