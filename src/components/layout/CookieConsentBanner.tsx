'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'gran_catador_cookie_consent_v1';

export function CookieConsentBanner() {
  const isMounted = useSyncExternalStore(
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
    <div className="fixed bottom-20 md:bottom-5 left-2.5 right-2.5 md:left-auto md:right-6 md:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl bg-[#081229]/95 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-white shadow-xl space-y-2.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D99B38]/20 text-[#EB9C53] border border-[#EB9C53]/40">
            <Cookie className="h-4 w-4" strokeWidth={1.5}/>
          </div>
          <div className="space-y-0.5 text-xs leading-snug text-slate-200">
            <h4 className="font-black text-white flex items-center gap-1.5 text-xs sm:text-[13px]">
              <span>Mayoría de Edad (+18) y Cookies</span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#EB9C53] shrink-0" strokeWidth={1.5}/>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Al continuar confirmas ser <strong>mayor de 18 años</strong> y aceptas nuestras{' '}
              <Link href="/privacidad" className="text-[#EB9C53] underline hover:text-white">
                Políticas
              </Link>{' '}
              y{' '}
              <Link href="/terminos" className="text-[#EB9C53] underline hover:text-white">
                Términos
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/privacidad"
            className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
          >
            Políticas
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D99B38] hover:bg-[#C88A28] text-white text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2}/>
            <span>Soy +18 y Acepto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
