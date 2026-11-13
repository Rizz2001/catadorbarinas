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
  getAdminAlertsPreference,
  soundFx,
} from '@/lib/sound';

/**
 * Listener global para administradores en /admin/*.
 * Suscribe a Realtime (pedidos nuevos y mensajes) y dispara notificación nativa + sonido Web Audio + Toast.
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
    window.addEventListener(ADMIN_ALERTS_SYNC_EVENT, onSync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ADMIN_ALERTS_SYNC_EVENT, onSync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const triggerNativeNotification = (title: string, body: string, tag: string) => {
      if (typeof window === 'undefined' || !('Notification' in window) || window.Notification.permission !== 'granted') return;
      const notification = new window.Notification(title, { body, icon: OFFICIAL_LOGO_PATH, badge: OFFICIAL_LOGO_PATH, tag });
      notification.onclick = () => {
        window.focus();
        routerRef.current.push('/admin/pedidos');
        notification.close();
      };
    };

    const setupAdminListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted || !user) return;
      const { data: perfil } = (await supabase.from('perfiles').select('rol').eq('id', user.id).single()) as {
        data: { rol: string } | null;
      };
      if (!isMounted || perfil?.rol !== 'admin') return;

      channel = supabase
        .channel('admin-orders-alert')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload: { new: Record<string, unknown> }) => {
          if (!alertsEnabledRef.current) return;
          const pedido = payload.new;
          const pedidoId = String(pedido.id ?? Date.now());
          const numeroOrden = String(pedido.numero_orden ?? pedidoId.slice(0, 8).toUpperCase());
          const clienteNombre = String(pedido.cliente_nombre ?? 'Cliente');
          const montoUsd = formatUsd(Number(pedido.total_usd ?? 0));

          soundFx.playOrderAlert();
          showToastRef.current({ body: `🛒 ¡Nuevo Pedido #${numeroOrden}! (${montoUsd}) — ${clienteNombre}` });
          triggerNativeNotification(
            '🛒 ¡Nuevo Pedido en El Catador!',
            `Pedido #${numeroOrden} • ${clienteNombre} — Total: ${montoUsd}`,
            `pedido-${pedidoId}`
          );
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_mensajes' }, (payload: { new: Record<string, unknown> }) => {
          const msg = payload.new;
          if (msg.remitente_rol !== 'cliente' || !alertsEnabledRef.current) return;
          const remitente = String(msg.remitente_nombre ?? 'Cliente');
          const texto = String(msg.mensaje ?? 'Envió un comprobante o imagen').slice(0, 90);
          const tagId = String(msg.pedido_id ?? msg.id ?? Date.now());

          soundFx.playMessageBubble();
          showToastRef.current({ body: `💬 ${remitente}: ${texto}` });
          triggerNativeNotification('💬 Nuevo mensaje de cliente', `${remitente}: ${texto}`, `mensaje-${tagId}`);
        })
        .subscribe();
    };

    setupAdminListener();
    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
