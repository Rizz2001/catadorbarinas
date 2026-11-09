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
} from 'lucide-react';
import { registerUserAction } from '@/actions/auth.actions';
import { signInWithEmail } from '@/services/auth.service';
import {
  translateAuthError,
  isValidCedulaOrRif,
  isValidPhone,
} from '@/lib/auth-errors';
import { RegisterSuccessView } from './RegisterSuccessView';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [docPrefix, setDocPrefix] = useState<'V' | 'E' | 'J' | 'G'>('V');
  const [formData, setFormData] = useState({
    nombre: '',
    cedulaNumero: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: '',
    latitud: null as number | null,
    longitud: null as number | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    email: string;
    nombre: string;
    emailSent?: boolean;
  } | null>(null);

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
        setGpsStatus('¡Ubicación GPS vinculada correctamente!');
        setLocatingGps(false);
      },
      () => {
        setGpsStatus(
          'No pudimos acceder a tu ubicación GPS. Revisa los permisos de tu navegador.'
        );
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullCedula = `${docPrefix}-${formData.cedulaNumero.replace(/\D/g, '')}`;

    if (formData.nombre.trim().length < 3) {
      setError('Por favor ingresa tu nombre y apellido completos.');
      return;
    }

    if (!isValidCedulaOrRif(fullCedula)) {
      setError('Ingresa un número de Cédula o RIF válido (entre 6 y 10 dígitos).');
      return;
    }

    if (!isValidPhone(formData.telefono)) {
      setError('Ingresa un número de teléfono móvil válido (ejemplo: 0414-1234567).');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica que ambas sean iguales.');
      return;
    }

    setLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;

      const res = await registerUserAction({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        cedula: fullCedula,
        direccion: formData.direccion,
        latitud: formData.latitud,
        longitud: formData.longitud,
        origin,
      });

      if (!res.success) {
        setError(res.error || 'No se pudo completar el registro.');
        setLoading(false);
        return;
      }

      // Iniciar sesión en segundo plano para permitir navegar la tienda sin hacer pedidos aún
      await signInWithEmail(formData.email, formData.password).catch(() => {});

      setRegisteredSuccess({
        email: res.email || formData.email.trim().toLowerCase(),
        nombre: res.nombre || formData.nombre.trim(),
        emailSent: res.emailSent,
      });
      setLoading(false);
    } catch (err) {
      setError(
        translateAuthError(err, 'Error al crear la cuenta. Verifica tus datos e intenta de nuevo.')
      );
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <RegisterSuccessView
        email={registeredSuccess.email}
        nombre={registeredSuccess.nombre}
        emailSent={registeredSuccess.emailSent}
        redirectParam={redirectParam}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Datos Personales */}
      <div className="space-y-3">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Nombre y Apellido <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              autoComplete="name"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Carlos Pérez"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cédula o RIF <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Tipo de documento"
                value={docPrefix}
                onChange={(e) => setDocPrefix(e.target.value as 'V' | 'E' | 'J' | 'G')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 min-h-[44px] text-base md:text-xs font-bold text-slate-800 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
                <option value="G">G</option>
              </select>
              <div className="relative flex-1">
                <IdCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.cedulaNumero}
                  onChange={(e) =>
                    handleChange('cedulaNumero', e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="18456789"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teléfono Móvil (WhatsApp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                autoComplete="tel"
                value={formData.telefono}
                onChange={(e) =>
                  handleChange('telefono', e.target.value.replace(/[^0-9+\-\s]/g, '').slice(0, 15))
                }
                placeholder="0414-1234567"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dirección y Ubicación en Barinas */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Dirección de Entrega en Barinas <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoComplete="street-address"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Urbanización, calle, número de casa o referencia"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-catador-blue shrink-0" />
                <span>Ubicación GPS para Delivery Exacto</span>
              </span>
              <p className="text-[11px] text-slate-500 truncate">
                Calcula tu envío automáticamente según tu distancia
              </p>
            </div>

            <button
              type="button"
              disabled={locatingGps}
              onClick={handleDetectGps}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
            >
              {locatingGps ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Ubicando...</span>
                </>
              ) : (
                <>
                  <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                  <span>{formData.latitud ? 'Actualizar GPS' : 'Detectar GPS'}</span>
                </>
              )}
            </button>
          </div>

          {formData.latitud && formData.longitud && (
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-slate-800 tabular-nums">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {formData.latitud}, {formData.longitud}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={`https://maps.google.com/?q=${formData.latitud},${formData.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-catador-blue hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink className="h-3 w-3" /> Ver Mapa
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, latitud: null, longitud: null }))
                  }
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          {gpsStatus && <p className="text-[11px] text-catador-blue font-bold">{gpsStatus}</p>}
        </div>
      </div>

      {/* 3. Credenciales de Acceso */}
      <div className="space-y-3 pt-1 border-t border-slate-100">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Correo Electrónico <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirmar Contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[46px] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Registrando tu cuenta...</span>
          </>
        ) : (
          <>
            <span>Crear mi Cuenta en Gran Catador</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        ¿Ya tienes una cuenta registrada?{' '}
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
