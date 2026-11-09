'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { updatePassword } from '@/services/auth.service';
import { translateAuthError } from '@/lib/auth-errors';

export function PasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica que ambas sean iguales.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/cuenta');
      }, 2500);
    } catch (err) {
      setError(
        translateAuthError(
          err,
          'Ocurrió un error al actualizar la contraseña. El enlace puede haber expirado.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 py-2 text-center animate-in fade-in">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900">
            ¡Contraseña restablecida con éxito!
          </h3>
          <p className="text-xs text-slate-600">
            Tu nueva contraseña ya está activa. Te estamos redirigiendo a tu cuenta...
          </p>
        </div>
        <div className="pt-2">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-catador-blue" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Confirmar Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu nueva contraseña"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[46px] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Guardando nueva contraseña...</span>
          </>
        ) : (
          <>
            <span>Actualizar Contraseña y Entrar</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
