'use client';

import React from 'react';
import Image from 'next/image';
import { FileText, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { PedidoConDetalles } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { cn } from '@/lib/utils';

interface OrderReceiptCardProps {
  order: PedidoConDetalles;
}

export function OrderReceiptCard({ order }: OrderReceiptCardProps) {
  const paymentLabels: Record<string, string> = {
    pago_movil: 'Pago Móvil (Bs. BCV)',
    zelle: 'Zelle ($ USD)',
    efectivo_usd: 'Efectivo Divisas ($ USD)',
    punto_venta: 'Punto de Venta',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-catador-blue text-white">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Recibo Digital #{order.numero_orden}
            </h3>
            <p className="text-[11px] text-slate-400" suppressHydrationWarning>
              {new Date(order.created_at).toLocaleString('es-VE')}
            </p>
          </div>
        </div>

        {/* Badge de Pago */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
              order.estado_pago === 'verificado'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : order.estado_pago === 'rechazado'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}
          >
            Pago: {order.estado_pago === 'verificado' ? 'Verificado ✅' : order.estado_pago === 'rechazado' ? 'Requiere Corrección ⚠️' : 'En Verificación ⏳'}
          </span>
        </div>
      </div>

      {/* Datos del Cliente y Entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente</span>
          <span className="font-bold text-slate-800">{order.cliente_nombre}</span>
          <span className="text-slate-500 block text-[11px]">{order.cliente_cedula} • {order.cliente_telefono}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Modalidad &amp; Destino</span>
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-catador-amber" />
            <span>{order.tipo_entrega === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Bodegón'}</span>
          </div>
          {order.direccion_entrega && (
            <span className="text-slate-500 block text-[11px] truncate">{order.direccion_entrega}</span>
          )}
        </div>
      </div>

      {/* Detalle de Productos */}
      <div className="space-y-2 text-xs">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">Productos:</span>
        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
          {order.items.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative h-9 w-9 rounded-md bg-slate-50 border overflow-hidden shrink-0">
                  <Image
                    src={item.imagen_url || IMAGE_FALLBACKS.product}
                    alt={item.nombre_articulo}
                    fill
                    sizes="36px"
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{item.nombre_articulo}</p>
                  <p className="text-[10px] text-slate-400">SKU FoxData: {item.cod_articulo_foxdata} • {item.cantidad}x</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-slate-900">{formatUsd(item.subtotal_usd)}</p>
                <p className="text-[10px] text-slate-400">{formatVes(item.subtotal_ves)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales y Tasa Congelada */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span>{formatUsd(order.subtotal_usd)} / {formatVes(order.subtotal_ves)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Envío Barinas:</span>
          <span>{order.delivery_usd === 0 ? 'Gratis' : `${formatUsd(order.delivery_usd)} / ${formatVes(order.delivery_ves)}`}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Tasa BCV fijada en orden:</span>
          <span>Bs. {Number(order.tasa_bcv).toFixed(2)} / $</span>
        </div>
        <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
          <span className="font-bold text-slate-800">Total Facturado:</span>
          <div className="text-right">
            <span className="text-xl font-black text-catador-blue">{formatUsd(order.total_usd)}</span>
            <span className="text-xs font-bold text-slate-600 block">{formatVes(order.total_ves)}</span>
          </div>
        </div>
      </div>

      {/* Método de pago */}
      {order.pago && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-catador-blue" />
            <span>Método: <strong>{paymentLabels[order.pago.metodo_pago] || order.pago.metodo_pago}</strong></span>
          </div>
          {order.pago.referencia && (
            <span className="text-[11px] font-mono text-slate-500">Ref: {order.pago.referencia}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>Garantía Gran Catador: Atención directa por el chat en vivo.</span>
      </div>
    </div>
  );
}
