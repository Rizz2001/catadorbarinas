'use client';

import { Truck, DollarSign, Gift, Navigation, Bike, Compass } from 'lucide-react';
import { StoreConfig } from '@/types';

interface ConfigDeliverySectionProps {
  form: Partial<StoreConfig>;
  onChange: (patch: Partial<StoreConfig>) => void;
}

export function ConfigDeliverySection({ form, onChange }: ConfigDeliverySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-2 rounded-xl bg-catador-blue/10 text-catador-blue">
          <Truck className="h-5 w-5" strokeWidth={1.5}/>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Tarifario Oficial de Delivery por Distancia GPS y Volumen (Motorizado vs. Carga)
          </h2>
          <p className="text-[11px] text-slate-500">
            Ajusta los precios de las carreras (Corta, Media, Larga, Extra Larga y Foránea), y los límites de carga.
          </p>
        </div>
      </div>

      {/* Franjas Oficiales de Carreras */}
      <div>
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2.5 flex items-center gap-1.5">
          <Bike className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
          Tarifas por Franjas de Distancia (Barinas)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40">
            <label className="flex items-center gap-1 font-bold text-slate-800 text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5}/>
              Carrera Corta (0-3 km) *
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              required
              value={form.delivery_corta_usd ?? 1.50}
              onChange={(e) => onChange({ delivery_corta_usd: parseFloat(e.target.value) || 0, delivery_base_usd: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-black text-slate-900 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">Hasta 3 km desde Gran Catador.</p>
          </div>

          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40">
            <label className="flex items-center gap-1 font-bold text-slate-800 text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5}/>
              Carrera Media (3-6 km) *
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              required
              value={form.delivery_media_usd ?? 2.50}
              onChange={(e) => onChange({ delivery_media_usd: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-black text-slate-900 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">De 3 km hasta 6 km.</p>
          </div>

          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40">
            <label className="flex items-center gap-1 font-bold text-slate-800 text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5}/>
              Carrera Larga (6-9 km) *
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              required
              value={form.delivery_larga_usd ?? 3.50}
              onChange={(e) => onChange({ delivery_larga_usd: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-black text-slate-900 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">De 6 km hasta 9 km.</p>
          </div>

          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40">
            <label className="flex items-center gap-1 font-bold text-slate-800 text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5}/>
              Carrera Extra Larga (9-12 km) *
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              required
              value={form.delivery_extralarga_usd ?? 4.50}
              onChange={(e) => onChange({ delivery_extralarga_usd: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-black text-slate-900 bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">De 9 km hasta 12 km.</p>
          </div>
        </div>
      </div>

      {/* Tarifas Foráneas y Carga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Navigation className="h-3.5 w-3.5 text-catador-blue" strokeWidth={1.5}/>
            Carrera Foránea por Km ($ USD) *
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
          <p className="text-[10px] text-slate-400 mt-1">Aplica desde 20 km en adelante ($0.45/km).</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Truck className="h-3.5 w-3.5 text-rose-600" strokeWidth={1.5}/>
            Recargo Vehículo de Carga ($ USD) *
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
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Gift className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5}/>
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
          <p className="text-[10px] text-slate-400 mt-1">Monto mínimo para envío gratis en pedidos ligeros.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Bike className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5}/>
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
          <p className="text-[10px] text-slate-400 mt-1">Si supera esta cantidad de cajas, pasa a Vehículo.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Bike className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5}/>
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
          <p className="text-[10px] text-slate-400 mt-1">Tope de unidades individuales que lleva un motorizado.</p>
        </div>

        <div>
          <label className="flex items-center gap-1 font-bold text-slate-700 mb-1 text-xs">
            <Compass className="h-3.5 w-3.5 text-catador-blue" strokeWidth={1.5}/>
            Coordenadas Sede Gran Catador (GPS)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.000001"
              title="Latitud"
              placeholder="Lat"
              value={form.tienda_lat ?? 8.6226}
              onChange={(e) => onChange({ tienda_lat: parseFloat(e.target.value) || 8.6226 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono text-slate-900"
            />
            <input
              type="number"
              step="0.000001"
              title="Longitud"
              placeholder="Lng"
              value={form.tienda_lng ?? -70.2075}
              onChange={(e) => onChange({ tienda_lng: parseFloat(e.target.value) || -70.2075 })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono text-slate-900"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Punto de partida del delivery en Barinas.</p>
        </div>
      </div>
    </section>
  );
}
