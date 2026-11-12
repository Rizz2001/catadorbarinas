'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  ShieldAlert,
} from 'lucide-react';
import { resendConfirmationEmailAction } from '@/actions/auth.actions';

interface RegisterSuccessViewProps {
  email: string;
  nombre: string;
  emailSent?: boolean;
  redirectParam?: string;
}

export function RegisterSuccessView({
  email,
  nombre,
  emailSent = true,
  redirectParam = '',
}: RegisterSuccessViewProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const targetUrl =
    redirectParam && redirectParam.startsWith('/') ? redirectParam : '/cuenta';

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    setResendLoading(true);
    setResendFeedback(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await resendConfirmationEmailAction(email, origin);

      if (res.success) {
        setResendFeedback({
          type: 'success',
          text:
            res.message ||
            'Hemos enviado un nuevo enlace de confirmación a tu correo electrónico.',
        });
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
        setResendFeedback({
          type: 'error',
          text: res.error || 'No se pudo reenviar el correo. Intenta en unos segundos.',
        });
      }
    } catch {
      setResendFeedback({
        type: 'error',
        text: 'Error de conexión al intentar reenviar el correo.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-catador-blue/10 text-catador-blue border border-catador-blue/20">
        <Mail className="h-8 w-8 text-catador-blue" strokeWidth={1.5}/>
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          Verificación de Correo Pendiente
        </span>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          ¡Hola, {nombre}! Revisa tu bandeja de entrada
        </h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          {emailSent
            ? 'Hemos enviado un correo electrónico con tu enlace de confirmación a:'
            : 'Tu cuenta ha sido creada con el correo electrónico:'}
        </p>
        <div className="inline-block px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-900 break-all">
          {email}
        </div>
      </div>

      {/* Instrucciones paso a paso */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left space-y-2.5 text-xs text-slate-700">
        <p className="font-extrabold text-slate-900">
          Pasos para activar tus compras:
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
          <li>
            Abre tu correo electrónico y busca el mensaje de confirmación enviado a{' '}
            <strong className="text-slate-800">{email}</strong> (revisa también la carpeta de{' '}
            <strong>Spam</strong> o <strong>Correo no deseado</strong>).
          </li>
          <li>
            Haz clic en el enlace de verificación dentro del correo para activar tu cuenta.
          </li>
        </ol>
      </div>

      {/* Aviso de política de compra */}
      <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 text-left text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5}/>
        <p className="text-[11px] text-amber-900 leading-relaxed">
          <strong>Importante:</strong> Ya hemos iniciado tu sesión para que puedas entrar a tu cuenta y explorar el catálogo, pero{' '}
          <strong>no podrás procesar pedidos</strong> hasta que confirmes tu correo electrónico.
        </p>
      </div>

      {/* Botón de reenvío y navegación */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendLoading || resendCooldown > 0}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {resendLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-catador-blue" strokeWidth={1.5}/>
          ) : (
            <Mail className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
          )}
          <span>
            {resendLoading
              ? 'Enviando correo de confirmación...'
              : resendCooldown > 0
              ? `Solicitar nuevo correo en ${resendCooldown}s`
              : '¿No recibiste el correo? Reenviar confirmación'}
          </span>
        </button>

        {resendFeedback && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-left text-[11px] font-bold border ${
              resendFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {resendFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.5}/>
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" strokeWidth={1.5}/>
            )}
            <span>{resendFeedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <Link
            href={targetUrl}
            className="w-full min-h-[44px] rounded-xl bg-catador-blue hover:bg-catador-blue-light text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>{redirectParam === '/checkout' ? 'Volver al Checkout' : 'Ir a Mi Cuenta'}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5}/>
          </Link>

          <Link
            href="/"
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Store className="h-4 w-4 text-catador-blue" strokeWidth={1.5}/>
            <span>Explorar la Tienda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

