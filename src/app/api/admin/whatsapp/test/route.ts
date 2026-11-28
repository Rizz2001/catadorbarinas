import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/supabase/api-auth';
import {
  isWhatsAppConfigured,
  sendWhatsAppOrderAlertToAdmins,
} from '@/services/whatsapp.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      {
        error:
          'Faltan variables de WhatsApp API (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ADMIN_PHONE).',
      },
      { status: 503 }
    );
  }

  const result = await sendWhatsAppOrderAlertToAdmins({
    numeroOrden: 'TEST-001',
    clienteNombre: 'Prueba El Catador',
    clienteTelefono: '0424-0000000',
    totalUsd: 25,
    totalVes: 22611.25,
    tipoEntrega: 'delivery',
    zonaBarinas: 'Alto Barinas',
  });

  if (result.sent === 0) {
    return NextResponse.json(
      { error: result.errors.join(' | ') || 'No se pudo enviar el mensaje de WhatsApp.', result },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, result });
}
