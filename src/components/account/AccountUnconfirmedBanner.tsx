'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { resendConfirmationEmailAction } from '@/actions/auth.actions';

interface AccountUnconfirmedBannerProps {
  userEmail?: string;
}

export function AccountUnconfirmedBanner({ userEmail }: AccountUnconfirmedBannerProps) {
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleResendConfirm = async () => {
    if (!userEmail) return;
    setResending(true);
    setResendMsg(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
      const res = await resendConfirmationEmailAction(userEmail, origin);
      setResendMsg(
        res.success ? res.message || 'Correo de confirmación enviado.' : res.error || 'Error al enviar.'
      );
    } catch {
      setResendMsg('Error de conexión al reenviar.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-catador-amber-oak/70 bg-catador-amber-soft p-4 space-y-2.5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-catador-amber shrink-0 mt-0.5" strokeWidth={1.5}/>
        <div className="space-y-1">
          <h4 className="font-black text-xs text-[#8B3E03] uppercase tracking-wide">
            Correo Pendiente de Confirmación
          </h4>
          <p className="text-xs text-[#8B3E03] leading-relaxed">
            Tu correo <strong>{userEmail}</strong> aún no ha sido confirmado. Confírmalo para realizar compras.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleResendConfirm}
          disabled={resending}
          className="px-4 py-2 rounded-full bg-catador-blue hover:bg-catador-blue-dark text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5}/> : <Mail className="h-3.5 w-3.5" strokeWidth={1.5}/>}
          <span>{resending ? 'Enviando...' : 'Reenviar Confirmación'}</span>
        </button>
        {resendMsg && (
          <span className="text-xs font-bold text-[#8B3E03] bg-white px-3 py-1 rounded-full border border-catador-amber-oak/60">
            {resendMsg}
          </span>
        )}
      </div>
    </div>
  );
}

