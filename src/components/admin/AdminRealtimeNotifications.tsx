'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@astryxdesign/core/Toast';
import { supabase } from '@/lib/supabase';
import { OFFICIAL_LOGO_PATH } from '@/constants/config';
import { formatUsd } from '@/lib/currency';
import {
  ADMIN_ALERTS_STORAGE_KEY,
  ADMIN_ALERTS_SYNC_EVENT,
  ADMIN_MESSAGE_INSERTED_EVENT,
  ADMIN_NAVIGATE_PEDIDOS_EVENT,
  ADMIN_ORDER_INSERTED_EVENT,
  ADMIN_TOAST_ALERT_EVENT,
  getAdminAlertsPreference,
  soundFx,
  triggerNewOrderAlert,
} from '@/lib/sound';

/**
 * Listener global para administradores en /admin/*.
 * Espera a que session.access_token esté confirmado, sincroniza el JWT con
 * Supabase Realtime (requerido por RLS is_admin()) y dispara sonido + Notification + Toast.
 */
export function AdminRealtimeNotifications() {
  const router = useRouter();
  const showToast = useToast();
  const routerRef = useRef(router);
  const showToastRef = useRef(showToast);
  const alertsEnabledRef = useRef(true);

  useEffect(() => {
    routerRef.current = router;
    showToastRef.current = showToast;
  }, [router, showToast]);

  useEffect(() => {
    alertsEnabledRef.current = getAdminAlertsPreference();
    const onSync = (event: Event) => {
      const custom = event as CustomEvent<boolean>;
      alertsEnabledRef.current = typeof custom.detail === 'boolean' ? custom.detail : getAdminAlertsPreference();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_ALERTS_STORAGE_KEY) alertsEnabledRef.current = getAdminAlertsPreference();
    };
    const onToastEvent = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail) showToastRef.current({ body: custom.detail });
    };
    const onNavigateEvent = () => { routerRef.current.push('/admin/pedidos'); };

    window.addEventListener(ADMIN_ALERTS_SYNC_EVENT, onSync);
    window.addEventListener('storage', onStorage);
    window.addEventListener(ADMIN_TOAST_ALERT_EVENT, onToastEvent);
    window.addEventListener(ADMIN_NAVIGATE_PEDIDOS_EVENT, onNavigateEvent);
    return () => {
      window.removeEventListener(ADMIN_ALERTS_SYNC_EVENT, onSync);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ADMIN_TOAST_ALERT_EVENT, onToastEvent);
      window.removeEventListener(ADMIN_NAVIGATE_PEDIDOS_EVENT, onNavigateEvent);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const triggerChatNotification = (remitente: string, texto: string, tagId: string) => {
      if (typeof window === 'undefined' || !('Notification' in window) || window.Notification.permission !== 'granted') return;
      const title = '💬 Nuevo mensaje de cliente';
      const body = `${remitente}: ${texto}`;
      try {
        const iconUrl = new URL(OFFICIAL_LOGO_PATH, window.location.origin).href;
        const notif = new window.Notification(title, { body, icon: iconUrl, tag: `mensaje-${tagId}` });
        notif.onclick = () => { window.focus(); routerRef.current.push('/admin/pedidos'); notif.close(); };
      } catch {
        try {
          const fallback = new window.Notification(title, { body, tag: `mensaje-${tagId}` });
          fallback.onclick = () => { window.focus(); routerRef.current.push('/admin/pedidos'); fallback.close(); };
        } catch (err) {
          console.warn('[AdminRealtime] Error creando Notification de mensaje:', err);
        }
      }
    };

    const connectAdminRealtime = async () => {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (sessionErr || !session?.access_token || !session.user) {
        console.warn('[AdminRealtime] Sin sesión activa con access_token para conectar Realtime:', sessionErr?.message ?? 'sin token');
        return;
      }

      const { data: perfil } = (await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', session.user.id)
        .single()) as { data: { rol: string } | null };

      if (!isMounted || perfil?.rol !== 'admin') {
        console.warn('[AdminRealtime] Usuario actual no tiene rol admin, omitiendo canal admin-orders-alert.');
        return;
      }

      supabase.realtime.setAuth(session.access_token);
      if (channel) supabase.removeChannel(channel);

      channel = supabase
        .channel('admin-orders-alert')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload: { new: Record<string, unknown> }) => {
          console.info('[AdminRealtime] Evento INSERT recibido en pedidos:', payload.new);
          window.dispatchEvent(new CustomEvent(ADMIN_ORDER_INSERTED_EVENT, { detail: payload.new }));
          if (!alertsEnabledRef.current) return;

          const pedido = payload.new;
          const pedidoId = String(pedido.id ?? Date.now());
          const numeroOrden = String(pedido.numero_orden ?? pedidoId.slice(0, 8).toUpperCase());
          const clienteNombre = String(pedido.cliente_nombre ?? 'Cliente');
          const montoUsdFormatted = formatUsd(Number(pedido.total_usd ?? 0));

          triggerNewOrderAlert({
            numeroOrden,
            clienteNombre,
            montoUsdFormatted,
            pedidoId,
            onNavigate: () => routerRef.current.push('/admin/pedidos'),
            onToast: (msg) => showToastRef.current({ body: msg }),
          });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, (payload: { new: Record<string, unknown> }) => {
          console.info('[AdminRealtime] Evento UPDATE recibido en pedidos:', payload.new);
          window.dispatchEvent(new CustomEvent(ADMIN_ORDER_INSERTED_EVENT, { detail: payload.new }));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_mensajes' }, (payload: { new: Record<string, unknown> }) => {
          const msg = payload.new;
          if (msg.remitente_rol !== 'cliente') return;
          console.info('[AdminRealtime] Evento INSERT de cliente en pedido_mensajes:', msg);
          window.dispatchEvent(new CustomEvent(ADMIN_MESSAGE_INSERTED_EVENT, { detail: msg }));
          if (!alertsEnabledRef.current) return;

          const remitente = String(msg.remitente_nombre ?? 'Cliente');
          const texto = String(msg.mensaje ?? 'Envió un comprobante o imagen').slice(0, 90);
          const tagId = String(msg.pedido_id ?? msg.id ?? Date.now());

          soundFx.playMessageBubble();
          showToastRef.current({ body: `💬 ${remitente}: ${texto}` });
          triggerChatNotification(remitente, texto, tagId);
        })
        .subscribe((status: string, err?: Error) => {
          if (status === 'SUBSCRIBED') {
            console.info('[AdminRealtime] Canal admin-orders-alert SUBSCRIBED con JWT de administrador.');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn(`[AdminRealtime] Alerta en canal admin-orders-alert (${status}):`, err?.message ?? '');
          } else {
            console.info(`[AdminRealtime] Estado de suscripción admin-orders-alert: ${status}`);
          }
        });
    };

    connectAdminRealtime();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: string, newSession: { access_token?: string } | null) => {
        if (newSession?.access_token) {
          supabase.realtime.setAuth(newSession.access_token);
          if (!channel) connectAdminRealtime();
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
