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
    numeroOrden: 'TEST-002',
    clienteNombre: 'Juan Pérez (Prueba)',
    clienteCedula: 'V-24123456',
    clienteTelefono: '0422-0012375',
    items: [
      { nombre: 'Polar Pilsen 355ml', cantidad: 1, modalidad: 'caja', unidadesPorCaja: 36, subtotalUsd: 28 },
      { nombre: 'Hielo 5Kg', cantidad: 2, modalidad: 'unidad', subtotalUsd: 4.5 },
    ],
    metodoPago: 'pago_movil',
    referenciaPago: '987654',
    totalUsd: 32.5,
    totalVes: 29394.63,
    tipoEntrega: 'delivery',
    zonaBarinas: 'Alto Barinas',
    direccionEntrega: 'Av. Francia, Res. Las Palmas',
    latitudEntrega: 8.6226,
    longitudEntrega: -70.2075,
  });

  if (result.sent === 0) {
    return NextResponse.json(
      { error: result.errors.join(' | ') || 'No se pudo enviar el mensaje de WhatsApp.', result },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, result });
}
