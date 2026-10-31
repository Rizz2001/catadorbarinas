'use client';

import React from 'react';
import { Truck, DollarSign, Gift, Navigation, Bike } from 'lucide-react';
import { StoreConfig } from '@/types';

interface ConfigDeliverySectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigDeliverySection({ form, onChange }: ConfigDeliverySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Truck className="h-4 w-4 text-emerald-600" />
        <div>
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Cotizador de Delivery por Ubicación GPS y Volumen (Motorizado vs. Carga)
          </h2>
          <p className="text-[11px] text-slate-500">
            Configura tarifas por distancia, límite de carga de un motorizado y recargo por vehículo de carga
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            Tarifa Base Motorizado ($ USD) *
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            required
            value={form.delivery_base_usd ?? 2.0}
            onChange={(e) => onChange({ delivery_base_usd: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Cubre los primeros 2 km en motorizado.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Navigation className="h-3.5 w-3.5 text-catador-blue" />
            Costo por Km Adicional ($ USD) *
          </label>
          <input
            type="number"
            step="0.05"
            min="0"
            required
            value={form.delivery_por_km_usd ?? 0.45}
            onChange={(e) => onChange({ delivery_por_km_usd: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Se multiplica según distancia GPS del cliente.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Gift className="h-3.5 w-3.5 text-emerald-600" />
            Mínimo Delivery Gratis ($ USD) *
          </label>
          <input
            type="number"
            step="1"
            min="0"
            required
            value={form.delivery_gratis_minimo_usd ?? 30.0}
            onChange={(e) => onChange({ delivery_gratis_minimo_usd: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Envío gratis para pedidos ligeros en motorizado.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Bike className="h-3.5 w-3.5 text-amber-600" />
            Máx. Cajas en Motorizado *
          </label>
          <input
            type="number"
            step="1"
            min="1"
            required
            value={form.delivery_max_cajas_motorizado ?? 2}
            onChange={(e) => onChange({ delivery_max_cajas_motorizado: parseInt(e.target.value, 10) || 2 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Si supera esta cantidad de cajas, sube a Vehículo.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Bike className="h-3.5 w-3.5 text-amber-600" />
            Máx. Botellas/Unidades en Moto *
          </label>
          <input
            type="number"
            step="1"
            min="1"
            required
            value={form.delivery_max_unidades_motorizado ?? 24}
            onChange={(e) =>
              onChange({ delivery_max_unidades_motorizado: parseInt(e.target.value, 10) || 24 })
            }
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Tope de unidades que lleva un motorizado.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
            <Truck className="h-3.5 w-3.5 text-rose-600" />
            Recargo por Vehículo de Carga ($) *
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            required
            value={form.delivery_recargo_vehiculo_usd ?? 3.5}
            onChange={(e) =>
              onChange({ delivery_recargo_vehiculo_usd: parseFloat(e.target.value) || 0 })
            }
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
          />
          <p className="text-[10px] text-slate-400 mt-1">Se suma cuando el pedido es de mucha cantidad.</p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Latitud Sede Bodegón (GPS)</label>
          <input
            type="number"
            step="0.000001"
            value={form.tienda_lat ?? 8.6226}
            onChange={(e) => onChange({ tienda_lat: parseFloat(e.target.value) || 8.6226 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Longitud Sede Bodegón (GPS)</label>
          <input
            type="number"
            step="0.000001"
            value={form.tienda_lng ?? -70.2075}
            onChange={(e) => onChange({ tienda_lng: parseFloat(e.target.value) || -70.2075 })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900"
          />
        </div>
      </div>
    </section>
  );
}
