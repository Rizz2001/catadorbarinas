'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, Store } from 'lucide-react';
import {
  verifyEmailConfirmationTokenAction,
  resendConfirmationEmailAction,
  confirmUserEmailByIdAction,
} from '@/actions/auth.actions';
import { supabase } from '@/lib/supabase/client';
import { EmailOtpType } from '@supabase/supabase-js';

function ConfirmarCorreoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const tokenHash = searchParams.get('token_hash');
  const otpType = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const statusParam = searchParams.get('status');

  const [loading, setLoading] = useState<boolean>(
    Boolean(token || tokenHash || code || statusParam !== 'error')
  );
  const [success, setSuccess] = useState<boolean>(statusParam === 'success');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    statusParam === 'error' ? 'El enlace de confirmación ha expirado o no es válido.' : null
  );

  const [resendEmail, setResendEmail] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        setLoading(true);

        // 1. Verificar por token propio en tabla perfiles
        if (token) {
          const res = await verifyEmailConfirmationTokenAction(token);
          if (!active) return;

          if (res.success) {
            setSuccess(true);
            setErrorMessage(null);
            setLoading(false);
            return;
          }
        }

        // 2. Verificar si viene token_hash de Supabase Auth
        if (tokenHash && otpType) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (!error && data?.user && active) {
            await confirmUserEmailByIdAction(data.user.id);
            setSuccess(true);
            setErrorMessage(null);
            setLoading(false);
            return;
          }
        }

        // 3. Verificar si viene código PKCE de Supabase Auth
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.user && active) {
            await confirmUserEmailByIdAction(data.user.id);
            setSuccess(true);
            setErrorMessage(null);
            setLoading(false);
            return;
          }
        }

        // 4. Comprobar si la sesión actual ya tiene email_confirmed_at en Supabase Auth
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setResendEmail(user.email);
        }
        if (user?.email_confirmed_at && active) {
          await confirmUserEmailByIdAction(user.id);
          setSuccess(true);
          setErrorMessage(null);
          setLoading(false);
          return;
        }

        if (active) {
          setSuccess(false);
          setErrorMessage(
            token
              ? 'El enlace de confirmación no es válido o ya fue utilizado anteriormente.'
              : 'Ingresa tu correo electrónico para recibir un nuevo enlace de verificación.'
          );
        }
      } catch {
        if (active) {
          setSuccess(false);
          setErrorMessage('No pudimos verificar el enlace. Solicita uno nuevo a continuación.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [token, tokenHash, otpType, code]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendFeedback(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await resendConfirmationEmailAction(resendEmail, origin);
      if (res.success) {
        setResendFeedback(
          res.message || 'Hemos enviado un nuevo enlace de confirmación a tu correo.'
        );
      } else {
        setResendFeedback(res.error || 'No se pudo enviar el correo. Intenta nuevamente.');
      }
    } catch {
      setResendFeedback('Error de conexión al intentar reenviar el correo.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl text-center space-y-5">
        {loading && (
          <div className="space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-catador-blue animate-spin mx-auto" strokeWidth={1.5}/>
            <h1 className="text-base font-black text-slate-900">
              Verificando tu correo electrónico...
            </h1>
            <p className="text-xs text-slate-500">
              Estamos validando tu enlace de seguridad con Gran Catador Barinas.
            </p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-5 py-2 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.5}/>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                Correo Verificado
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                ¡Tu correo ha sido confirmado con éxito!
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Tu cuenta de <strong>Gran Catador Barinas</strong> ya está 100% habilitada para realizar pedidos por unidad o por caja y recibir despachos a domicilio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/checkout"
                className="min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <span>Ir al Carrito / Pagar</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5}/>
              </Link>
              <Link
                href="/"
                className="min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Store className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
                <span>Explorar Bodegón</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-5 py-2 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-10 w-10 text-amber-600" strokeWidth={1.5}/>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                Confirmación de Correo
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Solicitar enlace de verificación
              </h1>
              <p className="text-xs text-slate-600">
                {errorMessage || 'Solicita un nuevo enlace de confirmación para tu correo electrónico.'}
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo electrónico de tu cuenta:
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-base md:text-xs text-slate-900 focus:outline-none focus:border-catador-blue focus:ring-2 focus:ring-catador-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5}/>
                ) : (
                  <Mail className="h-4 w-4" strokeWidth={1.5}/>
                )}
                <span>
                  {resendLoading
                    ? 'Enviando enlace...'
                    : 'Enviar Nuevo Enlace de Confirmación'}
                </span>
              </button>

              {resendFeedback && (
                <p className="text-[11px] font-bold text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  {resendFeedback}
                </p>
              )}
            </form>

            <div className="pt-2">
              <Link
                href="/cuenta"
                className="text-xs font-bold text-catador-blue hover:underline inline-flex items-center gap-1"
              >
                Volver a mi panel de cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmarCorreoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-catador-blue animate-spin" strokeWidth={1.5}/>
        </div>
      }
    >
      <ConfirmarCorreoContent />
    </Suspense>
  );
}
