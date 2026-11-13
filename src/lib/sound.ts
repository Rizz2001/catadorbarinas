/**
 * Sintetizador Web Audio API puro para notificaciones sonoras sin dependencias externas
 * y persistencia de preferencia de alertas del administrador.
 */

export const ADMIN_ALERTS_STORAGE_KEY = 'catador_admin_alerts_enabled';
export const ADMIN_ALERTS_SYNC_EVENT = 'catador:admin-alerts-changed';

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

      playTone(880, 0, 0.25, 0.3);
      playTone(1108.73, 0.12, 0.33, 0.35);
    } catch {
      // Ignorar si audio está restringido
    }
  }
}

export const soundFx = new SoundEffectsManager();
