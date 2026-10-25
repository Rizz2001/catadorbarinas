import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/services/order.service';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error(`Error obteniendo pedido ${id}:`, error);
    return NextResponse.json({ error: 'Error al obtener el pedido' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { estado_pedido, estado_pago } = body;
    await updateOrderStatus(id, estado_pedido, estado_pago);
    const updated = await getOrderById(id);
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error(`Error actualizando pedido ${id}:`, error);
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
  }
}
