'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User, Mail, Lock, Phone, IdCard, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { registerUserAction } from '@/actions/auth.actions';
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
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
      // 1. Registro seguro vía Server Action con email_confirm: true
      const res = await registerUserAction({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        cedula: formData.cedula,
        direccion: formData.direccion,
      });

      if (!res.success) {
        setError(res.error || 'Error al registrar usuario.');
        setLoading(false);
        return;
      }

      // 2. Iniciar sesión de inmediato en el cliente
      await signInWithEmail(formData.email, formData.password);

      // 3. Redirección dura garantizada en móviles para sincronizar cookies
      const target = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/cuenta';
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Verifica los datos.');
      setLoading(false);
    }
  };

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
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="0414-1234567"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
            placeholder="Sector, Urb., Calle y casa"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
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
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Confirmar *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
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
