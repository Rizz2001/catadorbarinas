import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getAllOrders } from '@/services/order.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newOrder = await createOrder(body);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error procesando pedido en API:', error);
    const message =
      error instanceof Error ? error.message : 'Error al procesar el pedido';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error listando pedidos en API:', error);
    return NextResponse.json(
      { error: 'Error al obtener la lista de pedidos' },
      { status: 500 }
    );
  }
}
