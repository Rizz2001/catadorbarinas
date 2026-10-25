'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmail } from '@/services/auth.service';
import { supabase } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificación en segundo plano sin bloquear el formulario
  useEffect(() => {
    let mounted = true;
    async function checkExistingSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const target = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/cuenta';
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

      // Redirección con recarga limpia para garantizar envío de cookies httpOnly en móviles
      const target = redirectParam && redirectParam.startsWith('/')
        ? redirectParam
        : perfil?.rol === 'admin'
        ? '/admin/pedidos'
        : '/cuenta';

      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas. Verifica tu correo y contraseña.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">Contraseña</label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 pt-2">
        ¿Aún no tienes una cuenta?{' '}
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
