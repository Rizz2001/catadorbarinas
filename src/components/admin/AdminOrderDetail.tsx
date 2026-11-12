'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Copy,
  Check,
  ExternalLink,
  PackageCheck,
  Bike,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  Trash2,
  MapPin,
  Phone,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Badge } from '@astryxdesign/core/Badge';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { getDeliveryTierInfo } from '@/lib/delivery';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { DeleteOrderModal } from './DeleteOrderModal';

interface AdminOrderDetailProps {
  order: PedidoConDetalles | null;
  onUpdateStatus: (estadoPedido?: EstadoPedido, estadoPago?: EstadoPago) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  isUpdating: boolean;
  onBackToList?: () => void;
}

export function AdminOrderDetail({
  order,
  onUpdateStatus,
  onDeleteOrder,
  isUpdating,
  onBackToList,
}: AdminOrderDetailProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) {
    return (
      <div className="flex h-[calc(100vh-16rem)] min-h-[460px] lg:h-[calc(100vh-14rem)] lg:min-h-[520px] lg:max-h-[720px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-sm font-medium text-slate-400">
        Selecciona un pedido de la lista para gestionar su pago, despacho y entrega.
      </div>
    );
  }

  const copyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteOrder(order.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const cleanPhone = order.cliente_telefono.replace(/\D/g, '');
  const waUrl = cleanPhone.length >= 10 ? `https://wa.me/58${cleanPhone.slice(-10)}` : null;
  const mapsUrl =
    order.latitud_entrega && order.longitud_entrega
      ? `https://maps.google.com/?q=${order.latitud_entrega},${order.longitud_entrega}`
      : null;

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[460px] lg:h-[calc(100vh-14rem)] lg:min-h-[520px] lg:max-h-[720px] rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      {/* Cabecera Operativa */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 space-y-3">
        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs w-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Volver a la Lista de Pedidos</span>
          </button>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900 tabular-nums">
                Orden #{order.numero_orden}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-catador-blue/10 text-catador-blue">
                {order.tipo_entrega === 'delivery' ? 'Delivery Barinas' : 'Pick-Up Bodegón'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">
              {order.cliente_nombre}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Cédula / RIF: {order.cliente_cedula || 'No indicada'}
            </p>
          </div>

          <div className="text-right tabular-nums shrink-0">
            <span className="text-lg font-black text-catador-blue block leading-none">
              {formatUsd(order.total_usd)}
            </span>
            <span className="text-xs font-bold text-slate-600 block mt-1">
              {formatVes(order.total_ves)}
            </span>
          </div>
        </div>

        {/* Botón WhatsApp Gigante para el Administrador / Adulto Mayor */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white min-h-[46px] px-4 py-2 font-black text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
            <span>Chatear por WhatsApp ({order.cliente_telefono})</span>
          </a>
        )}

        {/* Botonera de Acciones Rápidas (Organizada y con Touch Targets >= 44px) */}
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cambiar Estado del Pedido
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5}/>
              <span>Eliminar Pedido</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(undefined, 'verificado')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-h-[44px] px-2 py-1.5 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>Pago OK</span>
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(undefined, 'rechazado')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 min-h-[44px] px-2 py-1.5 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>Rechazar</span>
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('preparando')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 min-h-[44px] px-2 py-1.5 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PackageCheck className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>Bodegón</span>
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('en_camino')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-catador-amber hover:bg-catador-amber-dark disabled:bg-slate-300 min-h-[44px] px-2 py-1.5 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Bike className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>En Ruta</span>
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('entregado')}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 min-h-[44px] px-2 py-1.5 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>Entregado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cuerpo de Datos */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs">
        {/* Desglose de Totales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl bg-slate-50 border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 tabular-nums">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 font-semibold block">Subtotal</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatUsd(order.subtotal_usd)}</span>
            <span className="text-[10px] text-slate-500 block">{formatVes(order.subtotal_ves)}</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 font-semibold block">Delivery</span>
            <span className="font-extrabold text-slate-900 text-sm">{formatUsd(order.delivery_usd)}</span>
            <span className="text-[10px] text-slate-500 block">{formatVes(order.delivery_ves)}</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Orden</span>
            <span className="font-black text-catador-blue text-sm">{formatUsd(order.total_usd)}</span>
            <span className="text-[10px] text-slate-600 font-bold block">
              {formatVes(order.total_ves)}
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 font-semibold block">Tasa BCV</span>
            <span className="font-black text-catador-amber text-sm">Bs. {order.tasa_bcv.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">por $1.00 USD</span>
          </div>
        </div>

        {/* Logística y Coordenadas GPS */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
              {order.tipo_transporte === 'vehiculo_carga' ? (
                <Truck className="h-5 w-5 text-catador-amber shrink-0" strokeWidth={1.5}/>
              ) : (
                <MapPin className="h-5 w-5 text-catador-blue shrink-0" strokeWidth={1.5}/>
              )}
              <span>
                {order.tipo_entrega === 'pickup'
                  ? 'Retiro en Bodegón (Pick-Up)'
                  : order.tipo_transporte === 'vehiculo_carga'
                  ? 'Delivery en Vehículo de Carga'
                  : 'Delivery en Motorizado'}
              </span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {order.distancia_km ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-catador-blue font-black uppercase tracking-wider">
                  {getDeliveryTierInfo(order.distancia_km).tierBadge}
                </span>
              ) : null}
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-bold text-slate-700">
                {order.zona_barinas}
                {order.distancia_km ? ` • ${order.distancia_km} km` : ''}
              </span>
            </div>
          </div>

          {order.direccion_entrega && (
            <p className="text-slate-800 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
              {order.direccion_entrega}
            </p>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-catador-blue font-extrabold text-xs border border-blue-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.5}/>
              <span>Abrir Ubicación en Google Maps (GPS)</span>
            </a>
          )}

          {order.notas && (
            <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <strong>Nota del Cliente:</strong> {order.notas}
            </div>
          )}
        </div>

        {/* Datos de Pago y Comprobante */}
        {order.pago && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-xs">
                  Método:{' '}
                  <strong className="text-catador-blue">
                    {order.pago.metodo_pago.replaceAll('_', ' ').toUpperCase()}
                  </strong>
                </span>
                <Badge
                  variant={
                    order.estado_pago === 'verificado'
                      ? 'success'
                      : order.estado_pago === 'rechazado'
                      ? 'error'
                      : 'warning'
                  }
                  label={order.estado_pago.toUpperCase()}
                />
              </div>
              {order.pago.referencia && (
                <div className="flex items-center gap-1 tabular-nums">
                  <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border text-xs">
                    Ref: #{order.pago.referencia}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRef(order.pago?.referencia || '')}
                    className="p-1.5 text-slate-500 hover:text-catador-blue cursor-pointer"
                    title="Copiar referencia"
                  >
                    {copiedRef ? (
                      <Check className="h-4 w-4 text-emerald-600" strokeWidth={1.5}/>
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={1.5}/>
                    )}
                  </button>
                </div>
              )}
            </div>

            {order.pago.billete_pago_usd && (
              <p className="text-xs text-slate-700 tabular-nums">
                Cliente paga con billete de{' '}
                <strong className="text-emerald-700">${order.pago.billete_pago_usd}</strong> •
                Vuelto a entregar: <strong className="text-catador-blue">${order.pago.vuelto_calculado_usd || 0}</strong>
              </p>
            )}

            {order.pago.comprobante_url && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Comprobante Adjunto por el Cliente:
                </span>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white border border-slate-200">
                  <Image
                    src={order.pago.comprobante_url}
                    alt="Comprobante de pago"
                    fill
                    sizes="(max-width: 768px) 90vw, 480px"
                    className="object-contain cursor-pointer"
                    onClick={() => setShowProofModal(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowProofModal(true)}
                    className="absolute bottom-2 right-2 bg-slate-900/90 text-white min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5}/>
                    <span>Ampliar Comprobante</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabla de Artículos para Facturación en Caja */}
        <div className="space-y-2">
          <span className="font-extrabold text-slate-900 text-xs block">
            Artículos para Facturación en Caja ({order.items.length})
          </span>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
            {order.items.map((it) => (
              <div key={it.id} className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 rounded-lg bg-slate-50 border shrink-0 overflow-hidden">
                    <Image
                      src={it.imagen_url || IMAGE_FALLBACKS.product}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate text-xs sm:text-sm">
                      {it.nombre_articulo}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                      SKU: <strong className="text-catador-blue">{it.cod_articulo_foxdata}</strong>
                      {it.unidades_totales_descontadas
                        ? ` • Descuenta ${it.unidades_totales_descontadas} und`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="font-black text-slate-900 text-sm block">{it.cantidad}x</span>
                  <span className="text-slate-600 font-bold block text-xs">
                    {formatUsd(it.subtotal_usd)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.pago?.comprobante_url && (
          <Dialog
            isOpen={showProofModal}
            onOpenChange={(open) => setShowProofModal(open)}
            width={720}
            purpose="info"
          >
            <Layout
              height="auto"
              header={
                <DialogHeader
                  title={`Comprobante — Orden #${order.numero_orden}`}
                  subtitle={
                    order.pago.referencia ? `Referencia #${order.pago.referencia}` : undefined
                  }
                  onOpenChange={(open) => setShowProofModal(open)}
                  hasDivider
                />
              }
              content={
                <LayoutContent>
                  <div className="relative w-full aspect-4/3 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <Image
                      src={order.pago.comprobante_url}
                      alt="Comprobante de pago ampliado"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </LayoutContent>
              }
            />
          </Dialog>
        )}

        <DeleteOrderModal
          orderNumber={order.numero_orden}
          isOpen={showDeleteModal}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
}
