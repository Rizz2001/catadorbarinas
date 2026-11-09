'use client';

import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Phone,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  ExternalLink,
  Navigation,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { resendConfirmationEmailAction } from '@/actions/auth.actions';

interface AccountProfileTabProps {
  isEmailConfirmed?: boolean;
  userEmail?: string;
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
  formData,
  onChange,
  onChangeLocation,
  onSubmit,
  saving,
  saveSuccess,
  saveError,
}: AccountProfileTabProps) {
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleResendConfirm = async () => {
    if (!userEmail) return;
    setResending(true);
    setResendMsg(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await resendConfirmationEmailAction(userEmail, origin);
      if (res.success) {
        setResendMsg(res.message || 'Correo de confirmación enviado.');
      } else {
        setResendMsg(res.error || 'Error al enviar.');
      }
    } catch {
      setResendMsg('Error de conexión al reenviar.');
    } finally {
      setResending(false);
    }
  };

  const handleDetectGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setLocatingGps(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChangeLocation(lat, lng);
        setGpsStatus('¡Coordenadas GPS capturadas con éxito!');
        setLocatingGps(false);
      },
      (err) => {
        console.warn('Error GPS:', err);
        setGpsStatus('No pudimos acceder al GPS. Revisa los permisos de ubicación en tu navegador.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Datos Personales y Despacho en Barinas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Mantén tu información actualizada para agilizar la facturación en caja y la entrega de tus pedidos.
        </p>
      </div>

      {!isEmailConfirmed && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 space-y-2.5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-xs text-amber-950 uppercase tracking-wide">
                Correo Pendiente de Confirmación
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Tu correo <strong>{userEmail}</strong> aún no ha sido confirmado. Puedes ver el catálogo y configurar tu dirección, pero <strong>no podrás realizar compras ni pedidos</strong> hasta que lo confirmes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleResendConfirm}
              disabled={resending}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {resending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              <span>{resending ? 'Enviando enlace...' : 'Reenviar Enlace de Confirmación'}</span>
            </button>
            {resendMsg && (
              <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                {resendMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>¡Tus datos han sido actualizados con éxito!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>Error al guardar los datos: {saveError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Bloque 1: Identificación y Facturación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Nombre y Apellidos"
                className="w-full min-h-[46px] rounded-xl border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Nombre para emisión de recibos y facturas.</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Cédula de Identidad o RIF
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => onChange('cedula', e.target.value)}
                placeholder="Ej: V-12345678 o J-12345678-0"
                className="w-full min-h-[46px] rounded-xl border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Requerido para comprobantes fiscales y verificación.</p>
          </div>
        </div>

        {/* Bloque 2: Contacto */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">
            Teléfono de Contacto (WhatsApp)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              placeholder="Ej: 0414-1234567 o 0424-7654321"
              className="w-full min-h-[46px] rounded-xl border border-slate-300 pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Número donde nuestro motorizado o equipo de bodegón se comunicará contigo.
          </p>
        </div>

        {/* Bloque 3: Dirección en Barinas */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">
            Dirección Predeterminada de Entrega en Barinas
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <textarea
              rows={3}
              value={formData.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              placeholder="Sector, urbanización, avenida/calle, número de casa/apto o punto de referencia en Barinas"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Se completará automáticamente cada vez que realices una compra en la tienda.
          </p>
        </div>

        {/* Bloque 4: Ubicación GPS Satelital */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-catador-blue" />
                <span>Ubicación Satelital GPS (Recomendado)</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Guarda tus coordenadas exactas para que el motorizado llegue directo a tu ubicación sin perderse.
              </p>
            </div>

            <button
              type="button"
              disabled={locatingGps}
              onClick={handleDetectGps}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer shrink-0 min-h-[42px]"
            >
              {locatingGps ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Obteniendo GPS...</span>
                </>
              ) : (
                <>
                  <Crosshair className="h-4 w-4 text-amber-400" />
                  <span>{formData.latitud ? 'Actualizar mi GPS' : 'Obtener Ubicación por GPS'}</span>
                </>
              )}
            </button>
          </div>

          {formData.latitud && formData.longitud && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-blue-200 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-800 tabular-nums">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                <span className="font-bold">Coordenadas: {formData.latitud}, {formData.longitud}</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`https://maps.google.com/?q=${formData.latitud},${formData.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-catador-blue hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Ver en Google Maps</span>
                </a>
                <button
                  type="button"
                  onClick={() => onChangeLocation(null, null)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Quitar GPS
                </button>
              </div>
            </div>
          )}

          {gpsStatus && (
            <p className="text-xs text-catador-blue font-bold">
              {gpsStatus}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-6 py-3 min-h-[46px] font-black text-sm text-white shadow-md transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

