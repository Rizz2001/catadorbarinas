'use client';

import { Loader2, Send, Smartphone } from 'lucide-react';
import { useToast } from '@astryxdesign/core/Toast';
import { useAdminWebPush } from '@/hooks/useAdminWebPush';

/**
 * Control compacto en /admin/pedidos para suscribir el teléfono o PC del administrador
 * a notificaciones Web Push nativas (funciona con navegador cerrado / pantalla bloqueada).
 */
export function AdminPushToggle() {
  const showToast = useToast();
  const {
    isSupported,
    isConfigured,
    isIosNeedsInstall,
    isSubscribed,
    isBusy,
    isTesting,
    subscribe,
    unsubscribe,
    sendTestPush,
  } = useAdminWebPush();

  const handleToggle = async () => {
    const result = isSubscribed ? await unsubscribe() : await subscribe();
    showToast({ body: result.message });
  };

  const handleTest = async () => {
    const result = await sendTestPush();
    showToast({ body: result.message });
  };

  if (isIosNeedsInstall) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title='En iPhone, agrega esta web a tu pantalla de inicio ("Compartir → Agregar a inicio") para activar notificaciones Push'
        className="flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-50 min-h-[36px] px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
      >
        <Smartphone className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.75} />
        <span>Instalar App (iPhone)</span>
      </button>
    );
  }

  if (!isSupported || !isConfigured) return null;

  if (isSubscribed) {
    return (
      <div className="inline-flex items-center rounded-lg border border-emerald-300 bg-emerald-50 overflow-hidden min-h-[36px]">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isBusy}
          title="Notificaciones Web Push activas en este dispositivo. Haz clic para desactivar."
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" strokeWidth={1.75} />
          ) : (
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          )}
          <Smartphone className="h-3.5 w-3.5 text-emerald-700" strokeWidth={1.75} />
          <span>Push Móvil</span>
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting || isBusy}
          title="Enviar notificación Web Push de prueba a tus dispositivos registrados"
          className="flex items-center gap-1 px-2.5 py-1.5 border-l border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isTesting ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
          ) : (
            <Send className="h-3 w-3" strokeWidth={1.75} />
          )}
          <span className="hidden sm:inline">Test</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isBusy}
      title="Activar notificaciones Web Push nativas en este teléfono o PC (llegan con el navegador cerrado)"
      className="flex items-center gap-1.5 rounded-lg border border-[#0016C2]/30 bg-[#0016C2]/5 min-h-[36px] px-3 py-1.5 text-xs font-bold text-[#0016C2] hover:bg-[#0016C2]/10 transition-colors cursor-pointer disabled:opacity-60"
    >
      {isBusy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
      ) : (
        <Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
      )}
      <span>Activar Push Móvil</span>
    </button>
  );
}
