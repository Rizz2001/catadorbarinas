'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Phone,
  IdCard,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  Crosshair,
  ExternalLink,
  Navigation,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { registerUserAction, resendConfirmationEmailAction } from '@/actions/auth.actions';
import { signInWithEmail } from '@/services/auth.service';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: '',
    latitud: null as number | null,
    longitud: null as number | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    email: string;
    nombre: string;
    tokenConfirmacion?: string;
  } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendEmail = async () => {
    if (!registeredSuccess?.email || resendCooldown > 0) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await resendConfirmationEmailAction(registeredSuccess.email);
      if (res.success) {
        setResendMessage(res.message || 'Correo de confirmación reenviado.');
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendMessage(res.error || 'Error al reenviar.');
      }
    } catch {
      setResendMessage('Error de conexión al reenviar.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleDetectGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('Tu dispositivo o navegador no soporta geolocalización GPS.');
      return;
    }

    setLocatingGps(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          latitud: lat,
          longitud: lng,
        }));
        setGpsStatus('¡Ubicación GPS detectada con éxito!');
        setLocatingGps(false);
      },
      (err) => {
        console.warn('Error GPS:', err);
        setGpsStatus('No pudimos acceder a tu GPS. Revisa los permisos de ubicación en tu navegador.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // 1. Registro seguro vía Server Action con email_confirm: true y coordenadas GPS
      const res = await registerUserAction({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        cedula: formData.cedula,
        direccion: formData.direccion,
        latitud: formData.latitud,
        longitud: formData.longitud,
      });

      if (!res.success) {
        setError(res.error || 'Error al registrar usuario.');
        setLoading(false);
        return;
      }

      // 2. Iniciar sesión en cliente para permitirle navegar y entrar
      await signInWithEmail(formData.email, formData.password).catch(() => {});

      // 3. Mostrar pantalla explícita de confirmación de correo requerida
      setRegisteredSuccess({
        email: formData.email,
        nombre: formData.nombre,
        tokenConfirmacion: res.tokenConfirmacion,
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Verifica los datos.');
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    const targetUrl = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/cuenta';

    return (
      <div className="space-y-4 text-center py-2 animate-in fade-in duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-catador-blue/10 text-catador-blue">
          <Mail className="h-7 w-7 text-catador-blue" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            ✉️ Confirmación de Correo Requerida
          </span>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            ¡Bienvenido a Gran Catador, {registeredSuccess.nombre}!
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Hemos enviado un enlace de confirmación a tu correo:
          </p>
          <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-900 break-all">
            {registeredSuccess.email}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200/90 p-3.5 text-left text-xs text-amber-950 space-y-1.5">
          <p className="font-extrabold text-[11px] flex items-center gap-1.5 text-amber-900">
            <span>🛡️</span> ¿Por qué debo confirmar mi correo?
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Para garantizar la seguridad de tus compras y evitar registros innecesarios, <strong>debes verificar tu correo antes de poder realizar pedidos</strong>. Ya puedes ingresar y explorar la tienda, pero tu cuenta requerirá confirmación al momento de comprar.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-2 pt-1">
          {registeredSuccess.tokenConfirmacion && (
            <Link
              href={`/confirmar-correo?token=${registeredSuccess.tokenConfirmacion}`}
              className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Mi Correo Ahora (1 Toque)</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendLoading || resendCooldown > 0}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {resendLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-catador-blue" />
            ) : (
              <Mail className="h-4 w-4 text-catador-blue" />
            )}
            <span>
              {resendCooldown > 0
                ? `Reenviar en (${resendCooldown}s)`
                : 'Reenviar Correo de Confirmación'}
            </span>
          </button>

          {resendMessage && (
            <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-xl p-2 border border-emerald-200">
              {resendMessage}
            </p>
          )}

          <Link
            href={targetUrl}
            className="w-full min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <span>Continuar a Mi Cuenta / Explorar Tienda</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Nombre y Apellido *</label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Carlos Pérez"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Cédula o RIF *</label>
          <div className="relative">
            <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.cedula}
              onChange={(e) => handleChange('cedula', e.target.value)}
              placeholder="V-18456789"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="0414-1234567"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Dirección en Barinas (Opcional)</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            placeholder="Sector, Urb., Calle y casa o punto de referencia"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      {/* Bloque de Ubicación GPS Satelital Opcional */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-catador-blue shrink-0" />
              <span>Fijar Ubicación GPS (Opcional)</span>
            </span>
            <p className="text-[11px] text-slate-500 truncate">
              Ayuda al motorizado a llegar con exactitud
            </p>
          </div>

          <button
            type="button"
            disabled={locatingGps}
            onClick={handleDetectGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            {locatingGps ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>GPS...</span>
              </>
            ) : (
              <>
                <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                <span>{formData.latitud ? 'Actualizar' : 'Detectar GPS'}</span>
              </>
            )}
          </button>
        </div>

        {formData.latitud && formData.longitud && (
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-slate-800 tabular-nums">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{formData.latitud}, {formData.longitud}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://maps.google.com/?q=${formData.latitud},${formData.longitud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-catador-blue hover:underline flex items-center gap-0.5"
              >
                <ExternalLink className="h-3 w-3" /> Maps
              </a>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, latitud: null, longitud: null }))}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Quitar
              </button>
            </div>
          </div>
        )}

        {gpsStatus && (
          <p className="text-[11px] text-catador-blue font-bold">
            {gpsStatus}
          </p>
        )}
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Contraseña *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Confirmar *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20 font-mono"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[44px] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creando y confirmando cuenta...</span>
          </>
        ) : (
          <>
            <span>Crear Cuenta en Gran Catador</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
          className="font-bold text-catador-blue hover:underline"
        >
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
}
