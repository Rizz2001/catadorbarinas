import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/supabase/api-auth';
import {
  countAdminPushSubscriptions,
  deleteAdminPushSubscription,
  getPushPublicConfig,
  upsertAdminPushSubscription,
} from '@/services/push.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  const { configured, publicKey } = getPushPublicConfig();
  const subscribedCount = await countAdminPushSubscriptions(auth.context.user.id);

  return NextResponse.json({
    configured,
    publicKey,
    subscribedCount,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const endpoint = typeof record.endpoint === 'string' ? record.endpoint.trim() : '';
  const keys = (record.keys && typeof record.keys === 'object' ? record.keys : {}) as Record<string, unknown>;
  const p256dh = typeof keys.p256dh === 'string' ? keys.p256dh.trim() : '';
  const authSecret = typeof keys.auth === 'string' ? keys.auth.trim() : '';

  if (!endpoint.startsWith('https://') || !p256dh || !authSecret) {
    return NextResponse.json(
      { error: 'Suscripción Web Push incompleta o inválida.' },
      { status: 400 }
    );
  }

  try {
    await upsertAdminPushSubscription({
      usuarioId: auth.context.user.id,
      endpoint,
      p256dh,
      auth: authSecret,
      userAgent: request.headers.get('user-agent'),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error guardando suscripción push.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const endpoint = typeof record.endpoint === 'string' ? record.endpoint.trim() : '';
  if (!endpoint) {
    return NextResponse.json({ error: 'Falta endpoint a eliminar.' }, { status: 400 });
  }

  try {
    await deleteAdminPushSubscription(auth.context.user.id, endpoint);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error eliminando suscripción push.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
