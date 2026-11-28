'use client';

import { useCallback, useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function detectIosNeedsPwaInstall(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as { standalone?: boolean }).standalone);
  return !isStandalone;
}

export interface UseAdminWebPushState {
  isSupported: boolean;
  isConfigured: boolean;
  isIosNeedsInstall: boolean;
  isSubscribed: boolean;
  isBusy: boolean;
  isTesting: boolean;
  subscribe: () => Promise<{ ok: boolean; message: string }>;
  unsubscribe: () => Promise<{ ok: boolean; message: string }>;
  sendTestPush: () => Promise<{ ok: boolean; message: string }>;
}

export function useAdminWebPush(): UseAdminWebPushState {
  const [isSupported, setIsSupported] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isIosNeedsInstall, setIsIosNeedsInstall] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const syncSubscriptionState = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const iosInstallNeeded = detectIosNeedsPwaInstall();
    setIsIosNeedsInstall(iosInstallNeeded);

    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    try {
      const res = await fetch('/api/admin/push');
      if (res.ok) {
        const data = (await res.json()) as { configured?: boolean; publicKey?: string | null };
        setIsConfigured(Boolean(data.configured && data.publicKey));
        setPublicKey(data.publicKey ?? null);
      }
    } catch {
      setIsConfigured(false);
    }

    if (!supported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const existing = await registration?.pushManager.getSubscription();
      setIsSubscribed(Boolean(existing));
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void syncSubscriptionState();
    }, 0);
    return () => clearTimeout(timer);
  }, [syncSubscriptionState]);

  const subscribe = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (detectIosNeedsPwaInstall()) {
      return {
        ok: false,
        message: 'En iPhone: pulsa Compartir → "Agregar a pantalla de inicio" y abre la app desde allí para activar Push.',
      };
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return { ok: false, message: 'Este navegador no soporta notificaciones Web Push.' };
    }

    const vapidKey = publicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    if (!vapidKey) {
      return { ok: false, message: 'Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY en el servidor.' };
    }

    setIsBusy(true);
    try {
      const permission = await window.Notification.requestPermission();
      if (permission !== 'granted') {
        return {
          ok: false,
          message: 'Permiso bloqueado. Habilita las notificaciones de este sitio en los ajustes del navegador.',
        };
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const json = subscription.toJSON();
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, message: errData.error || 'No se pudo registrar este dispositivo.' };
      }

      setIsSubscribed(true);
      return {
        ok: true,
        message: '¡Push Móvil activado! Recibirás cada pedido nuevo en este dispositivo incluso con pantalla bloqueada.',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error activando Web Push.';
      return { ok: false, message: msg };
    } finally {
      setIsBusy(false);
    }
  }, [publicKey]);

  const unsubscribe = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch('/api/admin/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
      return { ok: true, message: 'Push Móvil desactivado en este dispositivo.' };
    } catch {
      return { ok: false, message: 'No se pudo desactivar el Push Móvil.' };
    } finally {
      setIsBusy(false);
    }
  }, []);

  const sendTestPush = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/admin/push/test', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { error?: string; summary?: { sent: number } };
      if (!res.ok) {
        return { ok: false, message: data.error || 'No se pudo enviar la notificación push de prueba.' };
      }
      return {
        ok: true,
        message: `Notificación Push enviada (${data.summary?.sent ?? 1} dispositivo${(data.summary?.sent ?? 1) === 1 ? '' : 's'}).`,
      };
    } catch {
      return { ok: false, message: 'Error de red enviando la prueba Push.' };
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    isSupported, isConfigured, isIosNeedsInstall, isSubscribed, isBusy, isTesting,
    subscribe, unsubscribe, sendTestPush,
  };
}
