'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, Store } from 'lucide-react';
import { verifyEmailConfirmationTokenAction, resendConfirmationEmailAction } from '@/actions/auth.actions';

function ConfirmarCorreoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const statusParam = searchParams.get('status');

  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [success, setSuccess] = useState<boolean>(statusParam === 'success');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    statusParam === 'error' ? 'El enlace de confirmación ha expirado o es inválido.' : null
  );

  const [resendEmail, setResendEmail] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await verifyEmailConfirmationTokenAction(token);
        if (!active) return;

        if (res.success) {
          setSuccess(true);
          setErrorMessage(null);
        } else {
          setSuccess(false);
          setErrorMessage(res.error || 'No se pudo verificar el token de confirmación.');
        }
      } catch (err) {
        if (!active) return;
        setSuccess(false);
        setErrorMessage(err instanceof Error ? err.message : 'Error al confirmar correo.');
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendFeedback(null);
    try {
      const res = await resendConfirmationEmailAction(resendEmail);
      if (res.success) {
        setResendFeedback(res.message || 'Enlace de confirmación reenviado.');
      } else {
        setResendFeedback(res.error || 'Error al reenviar.');
      }
    } catch (err) {
      setResendFeedback('Error de conexión al reenviar correo.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl text-center space-y-5">
        {loading && (
          <div className="space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-catador-blue animate-spin mx-auto" />
            <h1 className="text-base font-black text-slate-900">Verificando tu correo electrónico...</h1>
            <p className="text-xs text-slate-500">Estamos validando tu enlace con la base de datos de Gran Catador.</p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-5 py-2 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                ✅ Correo Verificado
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                ¡Tu correo ha sido confirmado con éxito!
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Tu cuenta de <strong>Gran Catador</strong> ya está 100% habilitada para realizar compras por unidad o por caja, cotizar delivery GPS y recibir despachos a domicilio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/checkout"
                className="min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <span>Ir al Carrito / Pagar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Store className="h-4 w-4 text-catador-blue" />
                <span>Explorar Bodegón</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-5 py-2 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-10 w-10 text-rose-600" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                ⚠️ Confirmación Requerida
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Enlace no válido o expirado
              </h1>
              <p className="text-xs text-slate-600">
                {errorMessage || 'El enlace de confirmación no es válido o ya caducó por seguridad.'}
              </p>
            </div>

            {/* Formulario de reenvío */}
            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ingresa tu correo para recibir un nuevo enlace:
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>Solicitar Nuevo Enlace de Confirmación</span>
              </button>

              {resendFeedback && (
                <p className="text-[11px] font-bold text-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
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
          <Loader2 className="h-8 w-8 text-catador-blue animate-spin" />
        </div>
      }
    >
      <ConfirmarCorreoContent />
    </Suspense>
  );
}

