import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { convertUsdToVes } from '@/lib/currency';
import {
  canBuyBox,
  canBuyUnit,
  getEffectivePriceUsd,
  getUnitsPerPurchaseMode,
} from '@/lib/inventory';
import { calculateSmartDeliveryQuote } from '@/lib/delivery';
import { fetchProductById } from '@/services/foxdata.service';
import { fetchBcvRateFromDolarApi } from '@/services/bcv.service';
import type { CartItem, Product, PurchaseMode, StoreConfig } from '@/types';
import type {
  EstadoPago,
  EstadoPedido,
  MetodoPago,
  PagoPedidoRow,
  PedidoConDetalles,
  PedidoInsert,
  PedidoItemRow,
  PedidoMensajeInsert,
  PedidoMensajeRow,
  PedidoRow,
} from '@/types/supabase';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
const PROOF_SIGNED_URL_TTL_SECONDS = 3600;
const ALLOWED_PAYMENT_METHODS: ReadonlySet<MetodoPago> = new Set([
  'pago_movil',
  'zelle',
  'efectivo_usd',
  'punto_venta',
  'transferencia_bancaria',
]);

export class OrderError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'OrderError';
    this.statusCode = statusCode;
  }
}

export interface CreateOrderItemInput {
  codArticuloFoxdata: string;
  codGrupo?: string;
  cantidad: number;
  modalidadCompra?: PurchaseMode;
}

export interface CreateOrderPayload {
  usuarioId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteCedula: string;
  clienteEmail?: string | null;
  tipoEntrega: 'delivery' | 'pickup';
  direccionEntrega?: string | null;
  zonaBarinas?: string | null;
  latitudEntrega?: number | null;
  longitudEntrega?: number | null;
  notas?: string | null;
  items: CreateOrderItemInput[];
  pago: {
    metodoPago: MetodoPago;
    bancoOrigen?: string | null;
    telefonoOrigen?: string | null;
    referencia?: string | null;
    comprobantePath?: string | null;
    billetePagoUsd?: number | null;
  };
}

function extractPaymentProofObjectPath(rawValue?: string | null): string | null {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return null;
  }

  let candidate = trimmed;
  if (candidate.startsWith(`${PAYMENT_PROOFS_BUCKET}:`)) {
    candidate = candidate.slice(PAYMENT_PROOFS_BUCKET.length + 1);
  } else if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    const markerPublic = `/storage/v1/object/public/${PAYMENT_PROOFS_BUCKET}/`;
    const markerSign = `/storage/v1/object/sign/${PAYMENT_PROOFS_BUCKET}/`;
    const idx = candidate.includes(markerPublic)
      ? candidate.indexOf(markerPublic) + markerPublic.length
      : candidate.includes(markerSign)
      ? candidate.indexOf(markerSign) + markerSign.length
      : -1;
    if (idx === -1) return null;
    candidate = candidate.slice(idx).split('?')[0];
  }

  candidate = candidate.replace(/^\/+/, '');
  if (!candidate || candidate.includes('..')) {
    return null;
  }
  return candidate;
}

function normalizeOwnedProofPath(
  rawPath: string | null | undefined,
  usuarioId: string
): string | null {
  const path = extractPaymentProofObjectPath(rawPath);
  if (!path) return null;
  if (!path.startsWith(`${usuarioId}/`)) {
    throw new OrderError(
      'El comprobante de pago no pertenece a la sesión autenticada.',
      403
    );
  }
  return path;
}

async function resolveSignedPaymentProofUrl(
  rawPathOrUrl: string | null | undefined
): Promise<string | null> {
  const objectPath = extractPaymentProofObjectPath(rawPathOrUrl);
  if (!objectPath) return null;

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(objectPath, PROOF_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

async function fetchActiveStoreConfig(): Promise<StoreConfig | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('configuracion_tienda')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new OrderError('Error consultando la configuración oficial de la tienda.', 500);
  }
  return (data as StoreConfig | null) ?? null;
}

async function resolveAuthoritativeBcvRate(storeConfig: StoreConfig | null): Promise<number> {
  if (
    storeConfig?.bcv_usar_manual &&
    typeof storeConfig.bcv_tasa_manual === 'number' &&
    storeConfig.bcv_tasa_manual > 0
  ) {
    return Number(storeConfig.bcv_tasa_manual);
  }

  const info = await fetchBcvRateFromDolarApi();
  if (!Number.isFinite(info.rate) || info.rate <= 0) {
    throw new OrderError('No fue posible validar la tasa oficial BCV.', 503);
  }
  return Number(info.rate);
}

function assertPaymentMethodEnabled(metodo: MetodoPago, storeConfig: StoreConfig | null): void {
  if (!ALLOWED_PAYMENT_METHODS.has(metodo)) {
    throw new OrderError('Método de pago no soportado.', 400);
  }
  if (!storeConfig) return;

  if (metodo === 'transferencia_bancaria' && storeConfig.transferencia_activa === false) {
    throw new OrderError('El método Transferencia Bancaria está deshabilitado temporalmente.', 400);
  }
}

async function rollbackOrderCascade(pedidoId: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from('pedido_mensajes').delete().eq('pedido_id', pedidoId);
  await supabaseAdmin.from('pagos_pedido').delete().eq('pedido_id', pedidoId);
  await supabaseAdmin.from('pedido_items').delete().eq('pedido_id', pedidoId);
  await supabaseAdmin.from('pedidos').delete().eq('id', pedidoId);
}

async function resolveAndValidateOrderItems(
  rawItems: CreateOrderItemInput[],
  tasaBcv: number
): Promise<{
  verifiedItemsData: Array<Omit<PedidoItemRow, 'id' | 'pedido_id' | 'created_at'>>;
  authoritativeCart: CartItem[];
  subtotalUsd: number;
  subtotalVes: number;
}> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new OrderError('El pedido debe contener al menos un producto.', 400);
  }

  const uniqueKeys = new Map<string, { id: string; groupHint?: string }>();
  for (const item of rawItems) {
    const id = typeof item?.codArticuloFoxdata === 'string' ? item.codArticuloFoxdata.trim() : '';
    if (!id) {
      throw new OrderError('Código de producto inválido en el carrito.', 400);
    }
    if (!uniqueKeys.has(id)) {
      uniqueKeys.set(id, {
        id,
        groupHint: typeof item.codGrupo === 'string' ? item.codGrupo.trim() : undefined,
      });
    }
  }

  const productEntries = await Promise.all(
    Array.from(uniqueKeys.values()).map(async ({ id, groupHint }) => {
      const product = await fetchProductById(id, groupHint);
      return [id, product] as const;
    })
  );
  const productsById = new Map<string, Product>();
  for (const [id, product] of productEntries) {
    if (product) productsById.set(id, product);
  }

  const verifiedItemsData: Array<Omit<PedidoItemRow, 'id' | 'pedido_id' | 'created_at'>> = [];
  const authoritativeCart: CartItem[] = [];
  const totalUnitsByProduct = new Map<string, { product: Product; units: number }>();

  for (const rawItem of rawItems) {
    const skuId = rawItem.codArticuloFoxdata.trim();
    const product = productsById.get(skuId);
    if (!product) {
      throw new OrderError(`El producto ${skuId} no existe o no está disponible.`, 400);
    }
    if (product.hiddenFromStore) {
      throw new OrderError(`El producto "${product.name}" fue ocultado del catálogo.`, 400);
    }

    const quantity = Math.floor(Number(rawItem.cantidad));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 500) {
      throw new OrderError(`Cantidad inválida para "${product.name}".`, 400);
    }

    const mode: PurchaseMode = rawItem.modalidadCompra === 'caja' ? 'caja' : 'unidad';
    if (mode === 'unidad' && !canBuyUnit(product)) {
      throw new OrderError(`"${product.name}" solo se comercializa por caja cerrada.`, 400);
    }
    if (mode === 'caja' && !canBuyBox(product)) {
      throw new OrderError(`"${product.name}" solo se comercializa por unidad.`, 400);
    }

    const unitPriceUsd = Number(getEffectivePriceUsd(product, mode).toFixed(2));
    if (!Number.isFinite(unitPriceUsd) || unitPriceUsd <= 0) {
      throw new OrderError(`"${product.name}" no tiene un precio válido configurado.`, 400);
    }

    const unitsPerBox = getUnitsPerPurchaseMode(product, mode);
    const totalUnits = quantity * unitsPerBox;
    const prevCommitted = totalUnitsByProduct.get(product.id);
    totalUnitsByProduct.set(product.id, {
      product,
      units: (prevCommitted?.units || 0) + totalUnits,
    });

    const unitPriceVes = convertUsdToVes(unitPriceUsd, tasaBcv);
    const itemSubtotalUsd = Number((unitPriceUsd * quantity).toFixed(2));
    const itemSubtotalVes = convertUsdToVes(itemSubtotalUsd, tasaBcv);

    authoritativeCart.push({ product, quantity, purchaseMode: mode });
    verifiedItemsData.push({
      cod_articulo_foxdata: product.id,
      nombre_articulo: product.name,
      cantidad: quantity,
      precio_unitario_usd: unitPriceUsd,
      precio_unitario_ves: unitPriceVes,
      subtotal_usd: itemSubtotalUsd,
      subtotal_ves: itemSubtotalVes,
      imagen_url: product.images[0] || null,
      modalidad_compra: mode,
      unidades_por_caja: unitsPerBox,
      unidades_totales_descontadas: totalUnits,
    });
  }

  for (const { product, units } of totalUnitsByProduct.values()) {
    const stockAvailable = Math.max(0, Math.floor(product.stockQuantity || 0));
    if (!product.allowBackorder && units > stockAvailable) {
      throw new OrderError(
        `Stock insuficiente para "${product.name}". Disponible: ${stockAvailable} uds.`,
        400
      );
    }
  }

  const subtotalUsd = Number(
    verifiedItemsData.reduce((sum, item) => sum + item.subtotal_usd, 0).toFixed(2)
  );
  const subtotalVes = convertUsdToVes(subtotalUsd, tasaBcv);

  return { verifiedItemsData, authoritativeCart, subtotalUsd, subtotalVes };
}

/**
 * Crea un pedido en Supabase bajo principio Zero Trust:
 * todo precio, tasa BCV, stock y costo de envío se recalcula en el servidor.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<PedidoConDetalles> {
  const usuarioId = typeof payload.usuarioId === 'string' ? payload.usuarioId.trim() : '';
  const clienteNombre = typeof payload.clienteNombre === 'string' ? payload.clienteNombre.trim() : '';
  const clienteTelefono =
    typeof payload.clienteTelefono === 'string' ? payload.clienteTelefono.trim() : '';
  const clienteCedula =
    typeof payload.clienteCedula === 'string' ? payload.clienteCedula.trim() : '';

  if (!usuarioId) {
    throw new OrderError('Sesión de usuario requerida para crear el pedido.', 401);
  }
  if (!clienteNombre || !clienteTelefono || !clienteCedula) {
    throw new OrderError('Completa nombre, teléfono y cédula para procesar tu pedido.', 400);
  }
  if (payload.tipoEntrega !== 'delivery' && payload.tipoEntrega !== 'pickup') {
    throw new OrderError('Tipo de entrega inválido.', 400);
  }

  const storeConfig = await fetchActiveStoreConfig();
  assertPaymentMethodEnabled(payload.pago?.metodoPago, storeConfig);
  const tasaBcv = await resolveAuthoritativeBcvRate(storeConfig);

  const { verifiedItemsData, authoritativeCart, subtotalUsd, subtotalVes } =
    await resolveAndValidateOrderItems(payload.items, tasaBcv);

  const deliveryQuote = calculateSmartDeliveryQuote({
    items: authoritativeCart,
    subtotalUsd,
    deliveryType: payload.tipoEntrega,
    userLat: payload.latitudEntrega ?? null,
    userLng: payload.longitudEntrega ?? null,
    zonaBarinas: payload.zonaBarinas ?? undefined,
    storeConfig,
  });

  const deliveryUsd =
    payload.tipoEntrega === 'pickup' ? 0 : Number(deliveryQuote.shippingUsd.toFixed(2));
  const deliveryVes = convertUsdToVes(deliveryUsd, tasaBcv);
  const totalUsd = Number((subtotalUsd + deliveryUsd).toFixed(2));
  const totalVes = convertUsdToVes(totalUsd, tasaBcv);

  let billetePagoUsd: number | null = null;
  let vueltoCalculadoUsd: number | null = null;
  if (payload.pago.metodoPago === 'efectivo_usd') {
    const rawBill = payload.pago.billetePagoUsd;
    if (typeof rawBill === 'number' && Number.isFinite(rawBill) && rawBill > 0) {
      if (rawBill < totalUsd) {
        throw new OrderError(
          'El monto en efectivo indicado es inferior al total del pedido.',
          400
        );
      }
      billetePagoUsd = Number(rawBill.toFixed(2));
      vueltoCalculadoUsd = Number(Math.max(0, billetePagoUsd - totalUsd).toFixed(2));
    }
  }

  const normalizedProofPath = normalizeOwnedProofPath(
    payload.pago.comprobantePath,
    usuarioId
  );

  const numeroOrden = `GC-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  const pedidoData: PedidoInsert = {
    numero_orden: numeroOrden,
    usuario_id: usuarioId,
    guest_token: null,
    cliente_nombre: clienteNombre,
    cliente_telefono: clienteTelefono,
    cliente_cedula: clienteCedula,
    cliente_email: payload.clienteEmail?.trim() || null,
    tipo_entrega: payload.tipoEntrega,
    direccion_entrega:
      payload.tipoEntrega === 'pickup'
        ? storeConfig?.direccion_fisica || 'Retiro en Tienda - Gran Catador Barinas'
        : payload.direccionEntrega?.trim() || null,
    zona_barinas: payload.zonaBarinas?.trim() || null,
    subtotal_usd: subtotalUsd,
    subtotal_ves: subtotalVes,
    delivery_usd: deliveryUsd,
    delivery_ves: deliveryVes,
    total_usd: totalUsd,
    total_ves: totalVes,
    tasa_bcv: tasaBcv,
    estado_pedido: 'recibido',
    estado_pago: 'pendiente',
    notas: payload.notas?.trim() || null,
    latitud_entrega: payload.latitudEntrega ?? null,
    longitud_entrega: payload.longitudEntrega ?? null,
    distancia_km:
      payload.tipoEntrega === 'pickup' ? 0 : deliveryQuote.distanceKm,
    tipo_transporte:
      payload.tipoEntrega === 'pickup' ? 'pickup' : deliveryQuote.transportType,
  };

  const supabaseAdmin = getSupabaseAdmin();
  const { data: pedidoInserted, error: pedidoError } = await supabaseAdmin
    .from('pedidos')
    .insert(pedidoData)
    .select()
    .single();

  if (pedidoError || !pedidoInserted) {
    throw new OrderError(
      `No se pudo registrar el pedido: ${pedidoError?.message || 'error interno'}`,
      500
    );
  }

  const createdOrderRow = pedidoInserted as PedidoRow;

  try {
    const itemsRows = verifiedItemsData.map((item) => ({
      ...item,
      pedido_id: createdOrderRow.id,
    }));
    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('pedido_items')
      .insert(itemsRows)
      .select();

    if (itemsError || !insertedItems) {
      throw new Error(itemsError?.message || 'Error guardando los ítems del pedido');
    }

    const pagoData = {
      pedido_id: createdOrderRow.id,
      metodo_pago: payload.pago.metodoPago,
      monto_usd: totalUsd,
      monto_ves: totalVes,
      banco_origen: payload.pago.bancoOrigen?.trim() || null,
      telefono_origen: payload.pago.telefonoOrigen?.trim() || null,
      referencia: payload.pago.referencia?.trim() || null,
      comprobante_url: normalizedProofPath,
      billete_pago_usd: billetePagoUsd,
      vuelto_calculado_usd: vueltoCalculadoUsd,
      estado: 'pendiente' as EstadoPago,
    };

    const { data: insertedPago, error: pagoError } = await supabaseAdmin
      .from('pagos_pedido')
      .insert(pagoData)
      .select()
      .single();

    if (pagoError || !insertedPago) {
      throw new Error(pagoError?.message || 'Error registrando el pago del pedido');
    }

    const initialMessage: PedidoMensajeInsert = {
      pedido_id: createdOrderRow.id,
      remitente_rol: 'sistema',
      remitente_nombre: 'Gran Catador',
      mensaje: `¡Pedido ${numeroOrden} recibido! Nuestro equipo ya está revisando tu orden y comprobante de pago.`,
      tipo_mensaje: 'evento_estado',
      leido: false,
    };

    const { data: insertedMessage, error: messageError } = await supabaseAdmin
      .from('pedido_mensajes')
      .insert(initialMessage)
      .select()
      .single();

    if (messageError || !insertedMessage) {
      throw new Error(messageError?.message || 'Error creando mensaje inicial del pedido');
    }

    const signedProofUrl = await resolveSignedPaymentProofUrl(normalizedProofPath);
    const pagoHydrated: PagoPedidoRow = {
      ...(insertedPago as PagoPedidoRow),
      comprobante_url: signedProofUrl,
    };

    return {
      ...createdOrderRow,
      items: insertedItems as PedidoItemRow[],
      pago: pagoHydrated,
      mensajes: [insertedMessage as PedidoMensajeRow],
    };
  } catch (err) {
    await rollbackOrderCascade(createdOrderRow.id);
    const reason = err instanceof Error ? err.message : 'Fallo persistiendo detalle del pedido';
    throw new OrderError(`No se pudo completar el registro del pedido: ${reason}`, 500);
  }
}

async function hydrateOrderDetails(
  pedido: PedidoRow,
  includeFullMessages: boolean
): Promise<PedidoConDetalles> {
  const supabaseAdmin = getSupabaseAdmin();
  const [itemsRes, pagoRes, messagesRes] = await Promise.all([
    supabaseAdmin.from('pedido_items').select('*').eq('pedido_id', pedido.id),
    supabaseAdmin.from('pagos_pedido').select('*').eq('pedido_id', pedido.id).maybeSingle(),
    includeFullMessages
      ? supabaseAdmin
          .from('pedido_mensajes')
          .select('*')
          .eq('pedido_id', pedido.id)
          .order('created_at', { ascending: true })
      : supabaseAdmin
          .from('pedido_mensajes')
          .select('id', { count: 'exact', head: true })
          .eq('pedido_id', pedido.id)
          .eq('leido', false)
          .neq('remitente_rol', 'admin'),
  ]);

  if (itemsRes.error) {
    throw new OrderError(`Error obteniendo ítems del pedido ${pedido.id}.`, 500);
  }

  let hydratedPago: PagoPedidoRow | undefined = (pagoRes.data as PagoPedidoRow | null) ?? undefined;
  if (hydratedPago?.comprobante_url) {
    const signedUrl = await resolveSignedPaymentProofUrl(hydratedPago.comprobante_url);
    hydratedPago = { ...hydratedPago, comprobante_url: signedUrl };
  }

  return {
    ...pedido,
    items: (itemsRes.data || []) as PedidoItemRow[],
    pago: hydratedPago,
    ...(includeFullMessages
      ? { mensajes: (messagesRes.data || []) as PedidoMensajeRow[] }
      : { mensajes_no_leidos: messagesRes.count || 0 }),
  };
}

export async function getOrderById(id: string): Promise<PedidoConDetalles | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new OrderError(`Error consultando el pedido ${id}.`, 500);
  }
  if (!pedido) return null;

  return hydrateOrderDetails(pedido as PedidoRow, true);
}

export async function getOrdersByUserId(usuarioId: string): Promise<PedidoConDetalles[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: pedidos, error } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new OrderError('Error consultando tus pedidos.', 500);
  }
  if (!pedidos || pedidos.length === 0) return [];

  return Promise.all(
    (pedidos as PedidoRow[]).map((pedido) => hydrateOrderDetails(pedido, false))
  );
}

export async function getAllOrders(): Promise<PedidoConDetalles[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: pedidos, error } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new OrderError('Error consultando la lista de pedidos.', 500);
  }
  if (!pedidos || pedidos.length === 0) return [];

  return Promise.all(
    (pedidos as PedidoRow[]).map((pedido) => hydrateOrderDetails(pedido, false))
  );
}

export async function updateOrderStatus(
  pedidoId: string,
  estadoPedido?: EstadoPedido,
  estadoPago?: EstadoPago
): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  const updateData: {
    estado_pedido?: EstadoPedido;
    estado_pago?: EstadoPago;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };

  if (estadoPedido) updateData.estado_pedido = estadoPedido;
  if (estadoPago) updateData.estado_pago = estadoPago;

  const { error: updateOrderError } = await supabaseAdmin
    .from('pedidos')
    .update(updateData)
    .eq('id', pedidoId);

  if (updateOrderError) {
    throw new OrderError(
      `Error actualizando estado del pedido: ${updateOrderError.message}`,
      500
    );
  }

  if (estadoPago) {
    const { error: updatePagoError } = await supabaseAdmin
      .from('pagos_pedido')
      .update({ estado: estadoPago, updated_at: new Date().toISOString() })
      .eq('pedido_id', pedidoId);

    if (updatePagoError) {
      throw new OrderError(
        `Error actualizando estado de pago: ${updatePagoError.message}`,
        500
      );
    }
  }

  return true;
}

export async function deleteOrder(pedidoId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  const [msgRes, pagoRes, itemsRes] = await Promise.all([
    supabaseAdmin.from('pedido_mensajes').delete().eq('pedido_id', pedidoId),
    supabaseAdmin.from('pagos_pedido').delete().eq('pedido_id', pedidoId),
    supabaseAdmin.from('pedido_items').delete().eq('pedido_id', pedidoId),
  ]);

  if (msgRes.error || pagoRes.error || itemsRes.error) {
    throw new OrderError('Error eliminando dependencias del pedido.', 500);
  }

  const { error: orderDeleteError } = await supabaseAdmin
    .from('pedidos')
    .delete()
    .eq('id', pedidoId);

  if (orderDeleteError) {
    throw new OrderError(`Error eliminando el pedido: ${orderDeleteError.message}`, 500);
  }

  return true;
}
