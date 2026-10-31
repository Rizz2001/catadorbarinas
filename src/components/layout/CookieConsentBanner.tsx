'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'gran_catador_cookie_consent_v1';

export function CookieConsentBanner() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);

  if (!isMounted || dismissed) return null;

  const alreadyAccepted =
    typeof window !== 'undefined' && window.localStorage.getItem(COOKIE_STORAGE_KEY) === 'accepted';

  if (alreadyAccepted) return null;

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    }
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 md:left-auto md:right-6 md:max-w-lg z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-4 sm:p-5 text-white shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-catador-amber/20 text-amber-400 border border-amber-400/30">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs leading-relaxed text-slate-200">
            <h4 className="font-black text-white flex items-center gap-1.5 text-xs sm:text-sm">
              <span>Confirmación de Cookies y Mayoría de Edad (+18)</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Utilizamos cookies para recordar tu carrito, favoritos y cotización de delivery en Barinas. Al continuar, confirmas que eres <strong>mayor de 18 años</strong> y aceptas nuestras{' '}
              <Link href="/privacidad" className="text-amber-300 underline hover:text-amber-200">
                Políticas de Privacidad
              </Link>{' '}
              y{' '}
              <Link href="/terminos" className="text-amber-300 underline hover:text-amber-200">
                Términos de Uso
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Link
            href="/privacidad"
            className="px-3.5 py-2 rounded-xl border border-slate-700 text-[11px] font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Ver Políticas
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-catador-amber hover:bg-catador-amber-dark text-white text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Soy +18 y Acepto Cookies</span>
          </button>
        </div>
      </div>
    </div>
  );
}

