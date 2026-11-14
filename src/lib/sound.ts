/**
 * Sintetizador Web Audio API puro para notificaciones sonoras sin dependencias externas,
 * persistencia de preferencia en localStorage y disparador unificado de alertas de pedidos.
 */

import { OFFICIAL_LOGO_PATH } from '@/constants/config';

export const ADMIN_ALERTS_STORAGE_KEY = 'catador_admin_alerts_enabled';
export const ADMIN_ALERTS_SYNC_EVENT = 'catador:admin-alerts-changed';
export const ADMIN_ORDER_INSERTED_EVENT = 'catador:admin-order-inserted';
export const ADMIN_MESSAGE_INSERTED_EVENT = 'catador:admin-message-inserted';
export const ADMIN_TOAST_ALERT_EVENT = 'catador:admin-toast-alert';
export const ADMIN_NAVIGATE_PEDIDOS_EVENT = 'catador:admin-navigate-pedidos';

export interface TriggerNewOrderAlertParams {
  numeroOrden: string;
  clienteNombre: string;
  montoUsdFormatted: string;
  pedidoId?: string;
  onNavigate?: () => void;
  onToast?: (message: string) => void;
}

export function getAdminAlertsPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(ADMIN_ALERTS_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function setAdminAlertsPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADMIN_ALERTS_STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent<boolean>(ADMIN_ALERTS_SYNC_EVENT, { detail: enabled }));
  } catch {
    // Ignorar errores de almacenamiento en modo privado
  }
}

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Desbloquea explícitamente el AudioContext tras un gesto del usuario (clic en botón).
   */
  async unlockAudioContext(): Promise<void> {
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch {
      // Silencioso si el navegador aún restringe el contexto
    }
  }

  /**
   * Sonido suave tipo burbuja/pop al recibir un nuevo mensaje de chat.
   */
  playMessageBubble() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Silencioso si el navegador bloquea audio antes de interacción
    }
  }

  /**
   * Campanilla doble de notificación al entrar un nuevo pedido en el Admin.
   */
  playOrderAlert() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const playTone = (freq: number, startOffset: number, duration: number, peakGain: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(peakGain, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      playTone(880, 0, 0.25, 0.35);
      playTone(1108.73, 0.12, 0.35, 0.4);
    } catch {
      // Ignorar si audio está restringido
    }
  }
}

export const soundFx = new SoundEffectsManager();

/**
 * Dispara de forma independiente y resiliente:
 * 1) Alerta sonora Web Audio API
 * 2) Toast visual en pantalla
 * 3) Notificación nativa del navegador (new window.Notification) con try/catch aislado
 */
export function triggerNewOrderAlert({
  numeroOrden,
  clienteNombre,
  montoUsdFormatted,
  pedidoId,
  onNavigate,
  onToast,
}: TriggerNewOrderAlertParams): void {
  try {
    soundFx.playOrderAlert();
  } catch (err) {
    console.warn('[AdminRealtime] Error reproduciendo sonido de pedido:', err);
  }

  const toastMessage = `🛒 ¡Nuevo Pedido #${numeroOrden}! (${montoUsdFormatted}) — ${clienteNombre}`;
  try {
    if (onToast) {
      onToast(toastMessage);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<string>(ADMIN_TOAST_ALERT_EVENT, { detail: toastMessage }));
    }
  } catch (err) {
    console.warn('[AdminRealtime] Error mostrando Toast de pedido:', err);
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (window.Notification.permission !== 'granted') return;

  const title = '🛒 ¡Nuevo Pedido en El Catador!';
  const body = `Pedido #${numeroOrden} • ${clienteNombre} — Total: ${montoUsdFormatted}`;
  const tag = `pedido-${pedidoId || numeroOrden}-${Date.now()}`;

  const bindNotificationClick = (notif: Notification) => {
    notif.onclick = () => {
      window.focus();
      if (onNavigate) onNavigate();
      else window.dispatchEvent(new CustomEvent(ADMIN_NAVIGATE_PEDIDOS_EVENT));
      notif.close();
    };
  };

  try {
    const iconUrl = new URL(OFFICIAL_LOGO_PATH, window.location.origin).href;
    const notification = new window.Notification(title, { body, icon: iconUrl, tag });
    bindNotificationClick(notification);
  } catch (iconError) {
    console.warn('[AdminRealtime] Falló Notification con icono, reintentando sin icono:', iconError);
    try {
      const fallbackNotification = new window.Notification(title, { body, tag });
      bindNotificationClick(fallbackNotification);
    } catch (notifError) {
      console.warn('[AdminRealtime] No se pudo mostrar Notification nativa:', notifError);
    }
  }
}
