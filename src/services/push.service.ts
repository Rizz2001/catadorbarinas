import * as webpush from 'web-push';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface AdminPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface UpsertPushSubscriptionInput {
  usuarioId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}

interface StoredPushSubscription {
  id: string;
  usuario_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushDeliverySummary {
  sent: number;
  failed: number;
  removed: number;
}

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || '';
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@elcatadorbarinas.com';
  return {
    configured: Boolean(publicKey && privateKey),
    publicKey,
    privateKey,
    subject,
  };
}

function ensureVapidConfigured(): boolean {
  const { configured, publicKey, privateKey, subject } = getVapidConfig();
  if (!configured) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export function getPushPublicConfig() {
  const { configured, publicKey } = getVapidConfig();
  return { configured, publicKey: configured ? publicKey : null };
}

export async function upsertAdminPushSubscription(input: UpsertPushSubscriptionInput): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin.from('admin_push_subscriptions').upsert(
    {
      usuario_id: input.usuarioId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent ?? null,
      updated_at: now,
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    throw new Error(`No se pudo guardar la suscripción push: ${error.message}`);
  }
}

export async function deleteAdminPushSubscription(usuarioId: string, endpoint: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('admin_push_subscriptions')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('endpoint', endpoint);

  if (error) {
    throw new Error(`No se pudo eliminar la suscripción push: ${error.message}`);
  }
}

export async function countAdminPushSubscriptions(usuarioId: string): Promise<number> {
  const supabaseAdmin = getSupabaseAdmin();
  const { count, error } = await supabaseAdmin
    .from('admin_push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId);

  if (error) return 0;
  return count ?? 0;
}

async function deliverToSubscriptions(
  subscriptions: StoredPushSubscription[],
  payload: AdminPushPayload
): Promise<PushDeliverySummary> {
  if (!ensureVapidConfigured() || subscriptions.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const serializedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/admin/pedidos',
    tag: payload.tag || `catador-order-${Date.now()}`,
  });

  const staleIds: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          serializedPayload,
          { TTL: 3600, urgency: 'high' }
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id);
        } else {
          failed += 1;
        }
      }
    })
  );

  if (staleIds.length > 0) {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('admin_push_subscriptions').delete().in('id', staleIds);
  }

  return { sent, failed, removed: staleIds.length };
}

/**
 * Envía una notificación Web Push exclusivamente a los dispositivos registrados
 * de usuarios con rol 'admin' activo (no suspendidos).
 */
export async function sendPushToAllAdmins(payload: AdminPushPayload): Promise<PushDeliverySummary> {
  if (!ensureVapidConfigured()) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: admins, error: adminErr } = await supabaseAdmin
    .from('perfiles')
    .select('id')
    .eq('rol', 'admin')
    .or('suspendido.is.null,suspendido.eq.false');

  if (adminErr || !admins || admins.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const adminIds = (admins as Array<{ id: string }>).map((a) => a.id);
  const { data: subs, error: subErr } = await supabaseAdmin
    .from('admin_push_subscriptions')
    .select('id, usuario_id, endpoint, p256dh, auth')
    .in('usuario_id', adminIds);

  if (subErr || !subs || subs.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  return deliverToSubscriptions(subs as StoredPushSubscription[], payload);
}

export async function sendPushToAdminUser(
  usuarioId: string,
  payload: AdminPushPayload
): Promise<PushDeliverySummary> {
  if (!ensureVapidConfigured()) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: subs, error } = await supabaseAdmin
    .from('admin_push_subscriptions')
    .select('id, usuario_id, endpoint, p256dh, auth')
    .eq('usuario_id', usuarioId);

  if (error || !subs || subs.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  return deliverToSubscriptions(subs as StoredPushSubscription[], payload);
}
