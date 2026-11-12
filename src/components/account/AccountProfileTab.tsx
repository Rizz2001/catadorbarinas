'use client';

import {
  User,
  CreditCard,
  Phone,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useGpsLocator } from '@/hooks/useGpsLocator';
import { BARINAS_ZONE_COORDS } from '@/lib/delivery';
import { AccountGpsCard } from './AccountGpsCard';
import { AccountUnconfirmedBanner } from './AccountUnconfirmedBanner';

const BARINAS_ZONES = Object.keys(BARINAS_ZONE_COORDS);

interface AccountProfileTabProps {
  isEmailConfirmed?: boolean;
  userEmail?: string;
  selectedZone?: string;
  onSelectZone?: (zone: string) => void;
  formData: {
    nombre: string;
    cedula: string;
    telefono: string;
    direccion: string;
    latitud: number | null;
    longitud: number | null;
  };
  onChange: (field: string, value: string) => void;
  onChangeLocation: (lat: number | null, lng: number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

export function AccountProfileTab({
  isEmailConfirmed = true,
  userEmail,
  selectedZone = '',
  onSelectZone,
  formData,
  onChange,
  onChangeLocation,
  onSubmit,
  saving,
  saveSuccess,
  saveError,
}: AccountProfileTabProps) {
  const { locatingGps, gpsStatus, detectGps } = useGpsLocator(onChangeLocation);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Datos Personales y Despacho en Barinas
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Mantén tu información actualizada para agilizar facturación y entregas GPS.
        </p>
      </div>

      {!isEmailConfirmed && <AccountUnconfirmedBanner userEmail={userEmail} />}

      {saveSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.5}/>
          <span>¡Tus datos han sido actualizados con éxito!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" strokeWidth={1.5}/>
          <span>Error al guardar los datos: {saveError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Nombre y Apellidos"
                className="w-full min-h-[44px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Cédula o RIF</label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => onChange('cedula', e.target.value)}
                placeholder="Ej: V-12345678"
                className="w-full min-h-[44px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Teléfono WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              placeholder="Ej: 0414-1234567"
              className="w-full min-h-[44px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue font-mono"
            />
          </div>
        </div>

        <div className="space-y-3">
          {onSelectZone && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Sector / Zona en Barinas (Referencia de Delivery)
              </label>
              <select
                value={selectedZone}
                onChange={(e) => {
                  const zone = e.target.value;
                  onSelectZone(zone);
                  const coords = zone ? BARINAS_ZONE_COORDS[zone] : null;
                  if (coords && !formData.direccion.trim()) {
                    onChange('direccion', `${zone} - `);
                  }
                  if (coords && !formData.latitud) {
                    onChangeLocation(coords.lat, coords.lng);
                  }
                }}
                className="w-full min-h-[44px] rounded-full border border-slate-200 bg-[#F7F8FA] focus:bg-white px-4 py-2 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue"
              >
                <option value="">Selecciona tu sector o detecta GPS abajo</option>
                {BARINAS_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Dirección de Entrega en Barinas
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                Se precarga automáticamente en tu carrito
              </span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.5}/>
              <textarea
                rows={2}
                value={formData.direccion}
                onChange={(e) => onChange('direccion', e.target.value)}
                placeholder="Sector, urbanización, calle, casa o punto de referencia en Barinas"
                className="w-full rounded-2xl border border-slate-200 bg-[#F7F8FA] focus:bg-white pl-10 pr-4 py-2.5 text-base md:text-sm text-slate-900 focus:outline-none focus:border-catador-blue"
              />
            </div>
          </div>
        </div>

        <AccountGpsCard
          latitud={formData.latitud}
          longitud={formData.longitud}
          selectedZone={selectedZone}
          locatingGps={locatingGps}
          gpsStatus={gpsStatus}
          onDetectGps={detectGps}
          onClearGps={() => onChangeLocation(null, null)}
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark disabled:bg-slate-300 px-7 py-3 min-h-[46px] font-extrabold text-sm text-white transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5}/> : <Save className="h-4 w-4" strokeWidth={1.5}/>}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
