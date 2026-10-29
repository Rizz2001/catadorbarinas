import { getSupabaseAdmin } from '@/lib/supabase/server';
import {
  PedidoRow,
  PedidoInsert,
  PedidoItemRow,
  PagoPedidoRow,
  PedidoConDetalles,
  PedidoMensajeRow,
  EstadoPedido,
  EstadoPago,
} from '@/types';
import { fetchExistenciasBodegonMap } from './foxdata.service';

// Memoria volátil de respaldo para desarrollo si Supabase no está sincronizado
const memoryOrders = new Map<string, PedidoConDetalles>();

export interface CreateOrderPayload {
  usuarioId?: string | null;
  clienteNombre: string;
  clienteTelefono: string;
  clienteCedula: string;
  clienteEmail?: string;
  tipoEntrega: 'delivery' | 'pickup';
  direccionEntrega?: string;
  zonaBarinas?: string;
  notas?: string;
  subtotalUsd: number;
  subtotalVes: number;
  deliveryUsd: number;
  deliveryVes: number;
  totalUsd: number;
  totalVes: number;
  tasaBcv: number;
  items: Array<{
    codArticuloFoxdata: string;
    nombreArticulo: string;
    cantidad: number;
    precioUnitarioUsd: number;
    precioUnitarioVes: number;
    subtotalUsd: number;
    subtotalVes: number;
    imagenUrl?: string;
  }>;
  pago: {
    metodoPago: 'pago_movil' | 'zelle' | 'efectivo_usd' | 'punto_venta';
    montoUsd: number;
    montoVes: number;
    bancoOrigen?: string;
    telefonoOrigen?: string;
    referencia?: string;
    comprobanteUrl?: string;
    billetePagoUsd?: number;
    vueltoCalculadoUsd?: number;
  };
}

/**
 * Valida stock en Bodegón (Depósito 01) y crea el pedido en Supabase
 */
export async function createOrder(payload: CreateOrderPayload): Promise<PedidoConDetalles> {
  // 1. Validar existencias contra FoxData Depósito 01
  try {
    const existencias = await fetchExistenciasBodegonMap();
    if (existencias.size > 0) {
      for (const item of payload.items) {
        const stockActual = existencias.get(item.codArticuloFoxdata) ?? 0;
        if (stockActual < item.cantidad) {
          console.warn(`Stock bajo para ${item.nombreArticulo}. Solicitado: ${item.cantidad}, Disponible: ${stockActual}`);
        }
      }
    }
  } catch (err) {
    console.warn('Advertencia verificando stock con FoxData:', err);
  }

  const supabaseAdmin = getSupabaseAdmin();
  const numeroOrden = `GC-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = crypto.randomUUID();

  const pedidoData: PedidoInsert = {
    id: orderId,
    numero_orden: numeroOrden,
    usuario_id: payload.usuarioId || null,
    cliente_nombre: payload.clienteNombre,
    cliente_telefono: payload.clienteTelefono,
    cliente_cedula: payload.clienteCedula,
    cliente_email: payload.clienteEmail || null,
    tipo_entrega: payload.tipoEntrega,
    direccion_entrega: payload.direccionEntrega || null,
    zona_barinas: payload.zonaBarinas || 'Barinas Centro / Alto Barinas',
    subtotal_usd: payload.subtotalUsd,
    subtotal_ves: payload.subtotalVes,
    delivery_usd: payload.deliveryUsd,
    delivery_ves: payload.deliveryVes,
    total_usd: payload.totalUsd,
    total_ves: payload.totalVes,
    tasa_bcv: payload.tasaBcv,
    estado_pedido: 'recibido',
    estado_pago: 'pendiente',
    notas: payload.notas || null,
  };

  const itemsData = payload.items.map((it) => ({
    id: crypto.randomUUID(),
    pedido_id: orderId,
    cod_articulo_foxdata: it.codArticuloFoxdata,
    nombre_articulo: it.nombreArticulo,
    cantidad: it.cantidad,
    precio_unitario_usd: it.precioUnitarioUsd,
    precio_unitario_ves: it.precioUnitarioVes,
    subtotal_usd: it.subtotalUsd,
    subtotal_ves: it.subtotalVes,
    imagen_url: it.imagenUrl || null,
    created_at: new Date().toISOString(),
  }));

  const pagoData = {
    id: crypto.randomUUID(),
    pedido_id: orderId,
    metodo_pago: payload.pago.metodoPago,
    monto_usd: payload.pago.montoUsd,
    monto_ves: payload.pago.montoVes,
    banco_origen: payload.pago.bancoOrigen || null,
    telefono_origen: payload.pago.telefonoOrigen || null,
    referencia: payload.pago.referencia || null,
    comprobante_url: payload.pago.comprobanteUrl || null,
    billete_pago_usd: payload.pago.billetePagoUsd || null,
    vuelto_calculado_usd: payload.pago.vueltoCalculadoUsd || null,
    estado: 'pendiente' as EstadoPago,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const initialMessage: PedidoMensajeRow = {
    id: crypto.randomUUID(),
    pedido_id: orderId,
    remitente_id: null,
    remitente_rol: 'sistema' as const,
    remitente_nombre: 'Gran Catador Bot',
    mensaje: `¡Hola ${payload.clienteNombre}! Hemos recibido tu pedido #${numeroOrden}. Un administrador de Gran Catador está verificando tu orden en este momento por esta vía.`,
    adjunto_url: null,
    tipo_mensaje: 'evento_estado' as const,
    leido: false,
    created_at: new Date().toISOString(),
  };

  // Intentar guardar en Supabase
  try {
    await supabaseAdmin.from('pedidos').insert(pedidoData);
    await supabaseAdmin.from('pedido_items').insert(itemsData);
    await supabaseAdmin.from('pagos_pedido').insert(pagoData);
    await supabaseAdmin.from('pedido_mensajes').insert(initialMessage);
  } catch (err) {
    console.warn('Error guardando en Supabase remoto, usando almacenamiento local en memoria:', err);
  }

  const fullOrder: PedidoConDetalles = {
    ...(pedidoData as PedidoRow),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: itemsData as PedidoItemRow[],
    pago: pagoData as PagoPedidoRow,
    mensajes: [initialMessage],
  };

  memoryOrders.set(orderId, fullOrder);
  return fullOrder;
}

/**
 * Obtiene un pedido por su UUID
 */
export async function getOrderById(id: string): Promise<PedidoConDetalles | null> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (!pedidoError && pedido) {
      const [itemsRes, pagoRes, mensajesRes] = await Promise.all([
        supabaseAdmin.from('pedido_items').select('*').eq('pedido_id', id),
        supabaseAdmin.from('pagos_pedido').select('*').eq('pedido_id', id).single(),
        supabaseAdmin.from('pedido_mensajes').select('*').eq('pedido_id', id).order('created_at', { ascending: true }),
      ]);

      const items = (itemsRes.data || []) as PedidoItemRow[];
      const pago = (pagoRes.data || undefined) as PagoPedidoRow | undefined;
      const mensajes = (mensajesRes.data || []) as PedidoConDetalles['mensajes'];

      const orderResult: PedidoConDetalles = {
        ...(pedido as PedidoRow),
        items,
        pago,
        mensajes,
      };

      memoryOrders.set(id, orderResult);
      return orderResult;
    }
  } catch (err) {
    console.warn('Error obteniendo orden de Supabase, consultando memoria:', err);
  }

  return memoryOrders.get(id) || null;
}

/**
 * Obtiene todos los pedidos para la consola del Administrador
 */
export async function getAllOrders(): Promise<PedidoConDetalles[]> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { data: pedidos, error } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(pedidos)) {
      const fullList: PedidoConDetalles[] = [];
      for (const p of pedidos) {
        const [itemsRes, pagoRes, unreadRes] = await Promise.all([
          supabaseAdmin.from('pedido_items').select('*').eq('pedido_id', p.id),
          supabaseAdmin.from('pagos_pedido').select('*').eq('pedido_id', p.id).single(),
          supabaseAdmin.from('pedido_mensajes').select('id', { count: 'exact' }).eq('pedido_id', p.id).eq('leido', false).neq('remitente_rol', 'admin'),
        ]);

        fullList.push({
          ...(p as PedidoRow),
          items: (itemsRes.data || []) as PedidoItemRow[],
          pago: (pagoRes.data || undefined) as PagoPedidoRow | undefined,
          mensajes_no_leidos: unreadRes.count || 0,
        });
      }
      return fullList;
    }
  } catch (err) {
    console.warn('Error listando órdenes de Supabase, usando memoria:', err);
  }

  return Array.from(memoryOrders.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Actualiza el estado de la orden o del pago
 */
export async function updateOrderStatus(
  pedidoId: string,
  estadoPedido?: EstadoPedido,
  estadoPago?: EstadoPago
): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  const updateData: Partial<PedidoRow> = {
    updated_at: new Date().toISOString(),
  };

  if (estadoPedido) updateData.estado_pedido = estadoPedido;
  if (estadoPago) updateData.estado_pago = estadoPago;

  try {
    await supabaseAdmin.from('pedidos').update(updateData).eq('id', pedidoId);
    if (estadoPago) {
      await supabaseAdmin.from('pagos_pedido').update({ estado: estadoPago }).eq('pedido_id', pedidoId);
    }
  } catch (err) {
    console.warn('Error actualizando orden en Supabase:', err);
  }

  const mem = memoryOrders.get(pedidoId);
  if (mem) {
    if (estadoPedido) mem.estado_pedido = estadoPedido;
    if (estadoPago) {
      mem.estado_pago = estadoPago;
      if (mem.pago) mem.pago.estado = estadoPago;
    }
    mem.updated_at = new Date().toISOString();
  }

  return true;
}

/**
 * Elimina un pedido y sus registros asociados (items, pagos, mensajes)
 */
export async function deleteOrder(pedidoId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    await supabaseAdmin.from('pedido_mensajes').delete().eq('pedido_id', pedidoId);
    await supabaseAdmin.from('pagos_pedido').delete().eq('pedido_id', pedidoId);
    await supabaseAdmin.from('pedido_items').delete().eq('pedido_id', pedidoId);
    await supabaseAdmin.from('pedidos').delete().eq('id', pedidoId);
  } catch (err) {
    console.warn('Error eliminando orden de Supabase:', err);
  }

  memoryOrders.delete(pedidoId);
  return true;
}
