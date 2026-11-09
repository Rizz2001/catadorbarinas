'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail } from '@/services/auth.service';
import { translateAuthError } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase/client';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificación de sesión activa en segundo plano
  useEffect(() => {
    let mounted = true;
    async function checkExistingSession() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && mounted) {
          const target =
            redirectParam && redirectParam.startsWith('/') ? redirectParam : '/cuenta';
          window.location.href = target;
        }
      } catch {
        // Ignorar si no hay sesión activa
      }
    }

    checkExistingSession();
    return () => {
      mounted = false;
    };
  }, [redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { perfil } = await signInWithEmail(email, password);

      const target =
        redirectParam && redirectParam.startsWith('/')
          ? redirectParam
          : perfil?.rol === 'admin'
          ? '/admin/pedidos'
          : '/cuenta';

      window.location.href = target;
    } catch (err) {
      setError(
        translateAuthError(
          err,
          'El correo electrónico o la contraseña son incorrectos. Verifica tus datos.'
        )
      );
      setLoading(false);
    }
  };

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
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 min-h-[44px] text-base md:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">Contraseña</label>
          <Link
            href="/recuperar-clave"
            className="text-[11px] font-semibold text-catador-blue hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[46px] py-3 text-xs font-extrabold text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando credenciales...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 pt-2">
        ¿Aún no tienes una cuenta en Gran Catador?{' '}
        <Link
          href={`/registro${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
          className="font-bold text-catador-blue hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
