'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, ExternalLink, PackageCheck, Bike, CheckCheck, CheckCircle, AlertTriangle, Trash2, MapPin, Phone } from 'lucide-react';
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

export function AdminOrderDetail({ order, onUpdateStatus, onDeleteOrder, isUpdating }: AdminOrderDetailProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) {
    return (
      <div className="flex h-[calc(100vh-14rem)] min-h-[520px] max-h-[720px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
        Selecciona un pedido de la columna izquierda para gestionar su despacho y verificación.
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

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[520px] max-h-[720px] rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Cabecera y Botones de Acción */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Orden #{order.numero_orden} • {order.cliente_nombre}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{order.cliente_cedula || 'Sin cédula'}</span>
              <span>•</span>
              {waUrl ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold">
                  <Phone className="h-3 w-3" /> {order.cliente_telefono}
                </a>
              ) : (
                <span>{order.cliente_telefono}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-catador-blue">{formatUsd(order.total_usd)}</span>
            <span className="text-[11px] text-slate-500 block font-mono">{formatVes(order.total_ves)}</span>
          </div>
        </div>

        {/* Acciones de 1 Clic */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-200 text-xs">
          <div className="flex flex-wrap gap-1">
            <button type="button" disabled={isUpdating} onClick={() => onUpdateStatus(undefined, 'verificado')} className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-2 py-1 text-white font-bold text-[11px] cursor-pointer">
              <CheckCircle className="h-3 w-3" /> Pago OK
            </button>
            <button type="button" disabled={isUpdating} onClick={() => onUpdateStatus(undefined, 'rechazado')} className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-300 px-2 py-1 text-white font-bold text-[11px] cursor-pointer">
              <AlertTriangle className="h-3 w-3" /> Rechazar
            </button>
            <button type="button" disabled={isUpdating} onClick={() => onUpdateStatus('preparando')} className="flex items-center gap-1 rounded-lg bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-2 py-1 text-white font-bold text-[11px] cursor-pointer">
              <PackageCheck className="h-3 w-3" /> Bodegón
            </button>
            <button type="button" disabled={isUpdating} onClick={() => onUpdateStatus('en_camino')} className="flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 px-2 py-1 text-white font-bold text-[11px] cursor-pointer">
              <Bike className="h-3 w-3" /> Despacho
            </button>
            <button type="button" disabled={isUpdating} onClick={() => onUpdateStatus('entregado')} className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 px-2 py-1 text-white font-bold text-[11px] cursor-pointer">
              <CheckCheck className="h-3 w-3" /> Entregado
            </button>
          </div>
          <button type="button" onClick={() => setShowDeleteModal(true)} title="Eliminar este pedido" className="flex items-center gap-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2 py-1 font-bold text-[11px] transition-colors cursor-pointer">
            <Trash2 className="h-3 w-3" /> Borrar
          </button>
        </div>
      </div>

      {/* Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {/* Desglose Bimonetario y Tasa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Subtotal</span>
            <span className="font-bold text-slate-800">{formatUsd(order.subtotal_usd)}</span>
            <span className="text-[10px] text-slate-500 font-mono block">{formatVes(order.subtotal_ves)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Delivery</span>
            <span className="font-bold text-slate-800">{formatUsd(order.delivery_usd)}</span>
            <span className="text-[10px] text-slate-500 font-mono block">{formatVes(order.delivery_ves)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Orden</span>
            <span className="font-extrabold text-catador-blue">{formatUsd(order.total_usd)}</span>
            <span className="text-[10px] text-slate-500 font-mono font-bold block">{formatVes(order.total_ves)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Tasa BCV</span>
            <span className="font-mono font-bold text-catador-amber">Bs. {order.tasa_bcv.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">por $1.00 USD</span>
          </div>
        </div>

        {/* Datos de Entrega y Ubicación */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <MapPin className="h-4 w-4 text-catador-amber" />
            <span>Modalidad: {order.tipo_entrega === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Bodegón'}</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">{order.zona_barinas}</span>
          </div>
          {order.direccion_entrega && (
            <p className="text-slate-600 text-[11px] pl-5">{order.direccion_entrega}</p>
          )}
          {order.notas && (
            <div className="mt-1 pl-5 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
              <span className="font-bold">Nota del cliente:</span> {order.notas}
            </div>
          )}
        </div>

        {/* Pago y Comprobante */}
        {order.pago && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                Pago: {order.pago.metodo_pago.toUpperCase()} ({order.estado_pago})
              </span>
              {order.pago.referencia && (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border text-[11px]">
                    Ref: {order.pago.referencia}
                  </span>
                  <button type="button" onClick={() => copyRef(order.pago?.referencia || '')} className="p-1 text-slate-500 hover:text-catador-blue">
                    {copiedRef ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
            </div>

            {order.pago.billete_pago_usd && (
              <p className="text-[11px] text-slate-700">
                Paga con billete de: <strong className="text-emerald-700">${order.pago.billete_pago_usd}</strong> • Vuelto a entregar: <strong className="text-catador-blue">${order.pago.vuelto_calculado_usd || 0}</strong>
              </p>
            )}

            {order.pago.comprobante_url && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white border">
                <Image src={order.pago.comprobante_url} alt="Comprobante de pago" fill sizes="(max-width: 768px) 90vw, 480px" className="object-contain cursor-pointer" onClick={() => setShowProofModal(true)} />
                <button type="button" onClick={() => setShowProofModal(true)} className="absolute bottom-2 right-2 bg-slate-900/80 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Zoom
                </button>
              </div>
            )}
          </div>
        )}

        {/* Artículos FoxData */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px] block">
            Artículos para Facturación en Caja ({order.items.length}):
          </span>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {order.items.map((it) => (
              <div key={it.id} className="p-2 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative h-8 w-8 rounded bg-slate-50 border shrink-0 overflow-hidden">
                    <Image src={it.imagen_url || IMAGE_FALLBACKS.product} alt="" fill sizes="32px" className="object-contain p-0.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate text-[11px]">{it.nombre_articulo}</p>
                    <p className="text-[10px] font-mono font-bold text-catador-blue">SKU: {it.cod_articulo_foxdata}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900">{it.cantidad}x</span>
                  <span className="text-slate-500 block text-[10px]">{formatUsd(it.subtotal_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Zoom */}
        {showProofModal && order.pago?.comprobante_url && (
          <div onClick={() => setShowProofModal(false)} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer">
            <div className="relative max-w-2xl w-full aspect-4/3 bg-white rounded-2xl overflow-hidden p-2">
              <Image src={order.pago.comprobante_url} alt="Comprobante" fill className="object-contain" />
            </div>
          </div>
        )}

        {/* Modal de Borrado */}
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
