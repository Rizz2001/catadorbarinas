import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/supabase/api-auth';
import { getPushPublicConfig, sendPushToAdminUser } from '@/services/push.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  if (!getPushPublicConfig().configured) {
    return NextResponse.json(
      { error: 'Faltan las variables VAPID en el servidor.' },
      { status: 503 }
    );
  }

  const summary = await sendPushToAdminUser(auth.context.user.id, {
    title: 'EL CATADOR. — Alerta Push Activa',
    body: '¡Listo! Así recibirás cada pedido nuevo incluso con la pantalla bloqueada.',
    url: '/admin/pedidos',
    tag: `catador-test-${Date.now()}`,
  });

  if (summary.sent === 0) {
    return NextResponse.json(
      {
        error: 'No hay dispositivos registrados para tu cuenta. Activa primero "Push Móvil".',
        summary,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, summary });
}
