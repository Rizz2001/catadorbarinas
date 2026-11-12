import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser, requireAuthenticatedUser } from '@/lib/supabase/api-auth';
import {
  deleteOrder,
  getOrderById,
  OrderError,
  updateOrderStatus,
} from '@/services/order.service';
import type { EstadoPago, EstadoPedido } from '@/types/supabase';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ORDER_STATES: ReadonlySet<EstadoPedido> = new Set([
  'recibido',
  'preparando',
  'en_camino',
  'entregado',
  'cancelado',
]);
const ALLOWED_PAYMENT_STATES: ReadonlySet<EstadoPago> = new Set([
  'pendiente',
  'verificado',
  'rechazado',
]);

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (
      auth.context.rol !== 'admin' &&
      order.usuario_id !== auth.context.user.id
    ) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para ver este pedido' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'Error al obtener el pedido' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const body = (await request.json()) as {
      estado_pedido?: EstadoPedido;
      estado_pago?: EstadoPago;
    };

    if (body.estado_pedido && !ALLOWED_ORDER_STATES.has(body.estado_pedido)) {
      return NextResponse.json({ error: 'Estado de pedido inválido' }, { status: 400 });
    }
    if (body.estado_pago && !ALLOWED_PAYMENT_STATES.has(body.estado_pago)) {
      return NextResponse.json({ error: 'Estado de pago inválido' }, { status: 400 });
    }

    await updateOrderStatus(id, body.estado_pedido, body.estado_pago);
    const updated = await getOrderById(id);
    if (!updated) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'Error al eliminar el pedido' },
      { status: 500 }
    );
  }
}
