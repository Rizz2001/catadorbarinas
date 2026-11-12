import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/supabase/api-auth';
import {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  OrderError,
  type CreateOrderItemInput,
  type CreateOrderPayload,
} from '@/services/order.service';
import type { PurchaseMode } from '@/types';
import type { MetodoPago } from '@/types/supabase';

export const dynamic = 'force-dynamic';

function parseCoordinate(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

function sanitizeOrderPayload(
  rawBody: unknown,
  verifiedUserId: string
): CreateOrderPayload {
  if (!rawBody || typeof rawBody !== 'object') {
    throw new OrderError('Cuerpo de solicitud inválido.', 400);
  }

  const body = rawBody as Record<string, unknown>;
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: CreateOrderItemInput[] = rawItems.map((entry) => {
    const record = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
    const rawMode = record.modalidadCompra === 'caja' ? 'caja' : 'unidad';
    return {
      codArticuloFoxdata:
        typeof record.codArticuloFoxdata === 'string' ? record.codArticuloFoxdata : '',
      codGrupo: typeof record.codGrupo === 'string' ? record.codGrupo : undefined,
      cantidad: Number(record.cantidad),
      modalidadCompra: rawMode as PurchaseMode,
    };
  });

  const rawPago = (body.pago && typeof body.pago === 'object'
    ? body.pago
    : {}) as Record<string, unknown>;

  const rawBill =
    typeof rawPago.billetePagoUsd === 'number' && Number.isFinite(rawPago.billetePagoUsd)
      ? rawPago.billetePagoUsd
      : null;

  return {
    usuarioId: verifiedUserId,
    clienteNombre: typeof body.clienteNombre === 'string' ? body.clienteNombre : '',
    clienteTelefono: typeof body.clienteTelefono === 'string' ? body.clienteTelefono : '',
    clienteCedula: typeof body.clienteCedula === 'string' ? body.clienteCedula : '',
    clienteEmail: typeof body.clienteEmail === 'string' ? body.clienteEmail : null,
    tipoEntrega: body.tipoEntrega === 'pickup' ? 'pickup' : 'delivery',
    direccionEntrega:
      typeof body.direccionEntrega === 'string' ? body.direccionEntrega : null,
    zonaBarinas: typeof body.zonaBarinas === 'string' ? body.zonaBarinas : null,
    latitudEntrega: parseCoordinate(body.latitudEntrega, -90, 90),
    longitudEntrega: parseCoordinate(body.longitudEntrega, -180, 180),
    notas: typeof body.notas === 'string' ? body.notas : null,
    items,
    pago: {
      metodoPago: (typeof rawPago.metodoPago === 'string'
        ? rawPago.metodoPago
        : 'pago_movil') as MetodoPago,
      bancoOrigen: typeof rawPago.bancoOrigen === 'string' ? rawPago.bancoOrigen : null,
      telefonoOrigen:
        typeof rawPago.telefonoOrigen === 'string' ? rawPago.telefonoOrigen : null,
      referencia: typeof rawPago.referencia === 'string' ? rawPago.referencia : null,
      comprobantePath:
        typeof rawPago.comprobantePath === 'string' ? rawPago.comprobantePath : null,
      billetePagoUsd: rawBill,
    },
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return auth.response;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido en la solicitud.' }, { status: 400 });
  }

  try {
    const payload = sanitizeOrderPayload(rawBody, auth.context.user.id);
    const newOrder = await createOrder(payload);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message =
      error instanceof Error ? error.message : 'Error interno procesando el pedido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return auth.response;

  try {
    const orders =
      auth.context.rol === 'admin'
        ? await getAllOrders()
        : await getOrdersByUserId(auth.context.user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message =
      error instanceof Error ? error.message : 'Error obteniendo pedidos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
