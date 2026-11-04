'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { DeleteOrderModal } from './DeleteOrderModal';

interface AdminOrderDetailProps {
  order: PedidoConDetalles | null;
  onUpdateStatus: (estadoPedido?: EstadoPedido, estadoPago?: EstadoPago) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  isUpdating: boolean;
}

export function AdminOrderDetail({
  order,
  onUpdateStatus,
  onDeleteOrder,
  isUpdating,
}: AdminOrderDetailProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) {
    return (
      <div className="flex h-[calc(100vh-14rem)] min-h-[520px] max-h-[720px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
        Selecciona un pedido de la cola izquierda para gestionar su facturación y despacho.
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
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[520px] max-h-[720px] rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
      {/* Cabecera Operativa */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 tabular-nums">
              Orden #{order.numero_orden} • {order.cliente_nombre}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5 tabular-nums">
              <span>CI/RIF: {order.cliente_cedula || 'No indicada'}</span>
              <span>•</span>
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <Phone className="h-3 w-3" /> {order.cliente_telefono}
                </a>
              ) : (
                <span>{order.cliente_telefono}</span>
              )}
            </div>
          </div>
          <div className="text-right tabular-nums">
            <span className="text-base font-black text-catador-blue block leading-none">
              {formatUsd(order.total_usd)}
            </span>
            <span className="text-[11px] font-bold text-slate-600 block mt-1">
              {formatVes(order.total_ves)}
            </span>
          </div>
        </div>

        {/* Botonera de Estado (1 Clic) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-200/80 text-xs">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(undefined, 'verificado')}
              className="flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold text-[11px] cursor-pointer"
            >
              <CheckCircle className="h-3 w-3" /> Pago OK
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(undefined, 'rechazado')}
              className="flex items-center gap-1 rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold text-[11px] cursor-pointer"
            >
              <AlertTriangle className="h-3 w-3" /> Rechazar
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('preparando')}
              className="flex items-center gap-1 rounded-md bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-2.5 py-1 text-white font-bold text-[11px] cursor-pointer"
            >
              <PackageCheck className="h-3 w-3" /> Bodegón
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('en_camino')}
              className="flex items-center gap-1 rounded-md bg-catador-amber hover:bg-catador-amber-dark disabled:bg-slate-300 px-2.5 py-1 text-white font-bold text-[11px] cursor-pointer"
            >
              <Bike className="h-3 w-3" /> En Ruta
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus('entregado')}
              className="flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold text-[11px] cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" /> Entregado
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 px-2 py-1 font-bold text-[11px] transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" /> Borrar
          </button>
        </div>
      </div>

      {/* Cuerpo de Datos */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl bg-slate-50 border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 tabular-nums">
          <div className="p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold block">Subtotal</span>
            <span className="font-extrabold text-slate-900">{formatUsd(order.subtotal_usd)}</span>
            <span className="text-[10px] text-slate-500 block">{formatVes(order.subtotal_ves)}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold block">Delivery</span>
            <span className="font-extrabold text-slate-900">{formatUsd(order.delivery_usd)}</span>
            <span className="text-[10px] text-slate-500 block">{formatVes(order.delivery_ves)}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold block">Total Orden</span>
            <span className="font-black text-catador-blue">{formatUsd(order.total_usd)}</span>
            <span className="text-[10px] text-slate-600 font-bold block">
              {formatVes(order.total_ves)}
            </span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-slate-500 font-semibold block">Tasa BCV</span>
            <span className="font-black text-catador-amber">Bs. {order.tasa_bcv.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">por $1.00 USD</span>
          </div>
        </div>

        {/* Logística y GPS */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-extrabold text-slate-900">
              {order.tipo_transporte === 'vehiculo_carga' ? (
                <Truck className="h-4 w-4 text-catador-amber" />
              ) : (
                <MapPin className="h-4 w-4 text-catador-blue" />
              )}
              <span>
                {order.tipo_entrega === 'pickup'
                  ? 'Retiro en Bodegón (Pick-Up)'
                  : order.tipo_transporte === 'vehiculo_carga'
                  ? 'Delivery en Vehículo de Carga'
                  : 'Delivery en Motorizado'}
              </span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
              {order.zona_barinas}
              {order.distancia_km ? ` • ${order.distancia_km} km` : ''}
            </span>
          </div>

          {order.direccion_entrega && (
            <p className="text-slate-700 text-[11px]">{order.direccion_entrega}</p>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-catador-blue hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Abrir Coordenadas GPS en Google Maps
            </a>
          )}

          {order.notas && (
            <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <strong>Nota:</strong> {order.notas}
            </div>
          )}
        </div>

        {/* Datos de Pago */}
        {order.pago && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-[11px]">
                Método: {order.pago.metodo_pago.toUpperCase()} • Estado: {order.estado_pago.toUpperCase()}
              </span>
              {order.pago.referencia && (
                <div className="flex items-center gap-1 tabular-nums">
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border text-[11px]">
                    Ref: #{order.pago.referencia}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRef(order.pago?.referencia || '')}
                    className="p-1 text-slate-500 hover:text-catador-blue cursor-pointer"
                  >
                    {copiedRef ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {order.pago.billete_pago_usd && (
              <p className="text-[11px] text-slate-700 tabular-nums">
                Cliente paga con billete de{' '}
                <strong className="text-emerald-700">${order.pago.billete_pago_usd}</strong> •
                Vuelto: <strong className="text-catador-blue">${order.pago.vuelto_calculado_usd || 0}</strong>
              </p>
            )}

            {order.pago.comprobante_url && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white border">
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
                  className="absolute bottom-2 right-2 bg-slate-900/85 text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" /> Ampliar Comprobante
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabla de Facturación en Caja */}
        <div className="space-y-1.5">
          <span className="font-extrabold text-slate-900 text-[11px] block">
            Artículos para Facturación en Caja ({order.items.length})
          </span>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
            {order.items.map((it) => (
              <div key={it.id} className="p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-9 w-9 rounded-lg bg-slate-50 border shrink-0 overflow-hidden">
                    <Image
                      src={it.imagen_url || IMAGE_FALLBACKS.product}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate text-xs">{it.nombre_articulo}</p>
                    <p className="text-[10px] font-mono text-slate-500 tabular-nums">
                      SKU: <strong className="text-catador-blue">{it.cod_articulo_foxdata}</strong>
                      {it.unidades_totales_descontadas
                        ? ` • Descuenta ${it.unidades_totales_descontadas} und de stock`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="font-black text-slate-900">{it.cantidad}x</span>
                  <span className="text-slate-600 font-semibold block text-[11px]">
                    {formatUsd(it.subtotal_usd)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showProofModal && order.pago?.comprobante_url && (
          <div
            onClick={() => setShowProofModal(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-2xl w-full aspect-4/3 bg-white rounded-2xl overflow-hidden p-2">
              <Image src={order.pago.comprobante_url} alt="Comprobante" fill className="object-contain" />
            </div>
          </div>
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
