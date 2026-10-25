'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, ExternalLink, PackageCheck, Bike, CheckCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { PedidoConDetalles, EstadoPedido, EstadoPago } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';

interface AdminOrderDetailProps {
  order: PedidoConDetalles | null;
  onUpdateStatus: (estadoPedido?: EstadoPedido, estadoPago?: EstadoPago) => Promise<void>;
  isUpdating: boolean;
}

export function AdminOrderDetail({ order, onUpdateStatus, isUpdating }: AdminOrderDetailProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  if (!order) {
    return (
      <div className="flex h-[700px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
        Selecciona un pedido de la columna izquierda para gestionar su despacho y verificación.
      </div>
    );
  }

  const copyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="flex flex-col h-[700px] rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Cabecera y Botones de Acción Rápida */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Orden #{order.numero_orden} • {order.cliente_nombre}
            </h3>
            <p className="text-[11px] text-slate-500">
              {order.cliente_telefono} • {order.cliente_cedula}
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-catador-blue">{formatUsd(order.total_usd)}</span>
            <span className="text-[11px] text-slate-500 block">{formatVes(order.total_ves)}</span>
          </div>
        </div>

        {/* Botones de Acción de 1 Clic */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200 text-xs">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(undefined, 'verificado')}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold cursor-pointer"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Aprobar Pago
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(undefined, 'rechazado')}
            className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Rechazar Pago
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus('preparando')}
            className="flex items-center gap-1 rounded-lg bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-300 px-2.5 py-1 text-white font-bold cursor-pointer"
          >
            <PackageCheck className="h-3.5 w-3.5" /> En Bodegón
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus('en_camino')}
            className="flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold cursor-pointer"
          >
            <Bike className="h-3.5 w-3.5" /> A Despacho
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus('entregado')}
            className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 px-2.5 py-1 text-white font-bold cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Entregado
          </button>
        </div>
      </div>

      {/* Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Comprobante de Pago y Referencia */}
        {order.pago && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                Comprobante de Pago ({order.pago.metodo_pago})
              </span>
              {order.pago.referencia && (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border">
                    Ref: {order.pago.referencia}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRef(order.pago?.referencia || '')}
                    className="p-1 text-slate-500 hover:text-catador-blue"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {order.pago.comprobante_url && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white border">
                <Image
                  src={order.pago.comprobante_url}
                  alt="Capture de pago"
                  fill
                  className="object-contain cursor-pointer hover:opacity-90"
                  onClick={() => setShowProofModal(true)}
                />
                <button
                  type="button"
                  onClick={() => setShowProofModal(true)}
                  className="absolute bottom-2 right-2 bg-slate-900/80 text-white p-1 rounded text-[10px] flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Ver Zoom
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Artículos con SKU FoxData para facturación en caja */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px] block">
            Artículos para Facturación en Caja (Depósito 01):
          </span>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {order.items.map((it) => (
              <div key={it.id} className="p-2.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative h-9 w-9 rounded bg-slate-50 border shrink-0 overflow-hidden">
                    <Image src={it.imagen_url || IMAGE_FALLBACKS.product} alt="" fill className="object-contain p-0.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{it.nombre_articulo}</p>
                    <p className="text-[11px] font-mono font-bold text-catador-blue">
                      SKU FOXDATA: {it.cod_articulo_foxdata}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900">{it.cantidad}x</span>
                  <span className="text-slate-500 block text-[11px]">{formatUsd(it.subtotal_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Zoom para el comprobante */}
        {showProofModal && order.pago?.comprobante_url && (
          <div
            onClick={() => setShowProofModal(false)}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-2xl w-full aspect-4/3 bg-white rounded-2xl overflow-hidden p-2">
              <Image src={order.pago.comprobante_url} alt="Comprobante en alta resolución" fill className="object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
