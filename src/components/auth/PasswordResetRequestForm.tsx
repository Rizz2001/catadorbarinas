'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from '@/services/auth.service';

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al enviar el enlace de recuperación. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 py-2 text-center animate-in fade-in">
        <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900">¡Enlace de recuperación enviado!</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hemos enviado un correo a <strong className="text-slate-900">{email}</strong> con el enlace para restablecer tu contraseña.
          </p>
        </div>
        <p className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
          Revisa tu bandeja de entrada o la carpeta de spam. El enlace tiene una validez temporal por seguridad.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-catador-blue hover:bg-catador-blue-light py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Correo Electrónico Registrado
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[44px] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando enlace...</span>
          </>
        ) : (
          <>
            <span>Enviar Enlace de Recuperación</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-center pt-1">
        <Link
          href="/login"
          className="text-xs font-bold text-slate-500 hover:text-catador-blue transition-colors"
        >
          ¿Recordaste tu contraseña? Inicia sesión
        </Link>
      </div>
    </form>
  );
}

