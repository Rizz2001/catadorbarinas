'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, MapPin, Phone, Truck } from 'lucide-react';
import { EstadoPago, EstadoPedido, PedidoConDetalles } from '@/types';
import { formatUsd, formatVes } from '@/lib/currency';
import { getDeliveryTierInfo } from '@/lib/delivery';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { DeleteOrderModal } from './DeleteOrderModal';
import { AdminOrderStatusStepper } from './pedidos/AdminOrderStatusStepper';
import { AdminOrderPaymentProofSection } from './pedidos/AdminOrderPaymentProofSection';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) {
    return (
      <div className="flex h-[480px] xl:h-[calc(100vh-220px)] items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-sm font-medium text-slate-400">
        Selecciona un pedido de la lista para gestionar su pago, despacho y entrega.
      </div>
    );
  }

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
  const deliveryTitle =
    order.tipo_entrega === 'pickup'
      ? 'Retiro en Bodegón (Pick-Up)'
      : order.tipo_transporte === 'vehiculo_carga'
      ? 'Delivery en Vehículo de Carga'
      : 'Delivery en Motorizado';

  const summaryCells = [
    { label: 'Subtotal', primary: formatUsd(order.subtotal_usd), secondary: formatVes(order.subtotal_ves), primaryClass: 'font-extrabold text-slate-900', secondaryClass: 'text-slate-500' },
    { label: 'Delivery', primary: formatUsd(order.delivery_usd), secondary: formatVes(order.delivery_ves), primaryClass: 'font-extrabold text-slate-900', secondaryClass: 'text-slate-500' },
    { label: 'Total Orden', primary: formatUsd(order.total_usd), secondary: formatVes(order.total_ves), primaryClass: 'font-black text-[#0F172A]', secondaryClass: 'text-slate-600 font-bold' },
    { label: 'Tasa BCV', primary: `Bs. ${order.tasa_bcv.toFixed(2)}`, secondary: 'por $1.00 USD', primaryClass: 'font-black text-amber-600', secondaryClass: 'text-slate-400' },
  ];

  return (
    <div className="flex flex-col xl:h-[calc(100vh-220px)] xl:overflow-y-auto rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 space-y-3 shrink-0">
        {onBackToList && (
          <button type="button" onClick={onBackToList} className="xl:hidden flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs w-full transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Volver a la Lista de Pedidos</span>
          </button>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900 tabular-nums">Orden #{order.numero_orden}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#0F172A]/10 text-[#0F172A]">
                {order.tipo_entrega === 'delivery' ? 'Delivery Barinas' : 'Pick-Up Bodegón'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">{order.cliente_nombre}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Cédula / RIF: {order.cliente_cedula || 'No indicada'}</p>
          </div>
          <div className="text-right tabular-nums shrink-0">
            <span className="text-lg font-black text-[#0F172A] block leading-none">{formatUsd(order.total_usd)}</span>
            <span className="text-xs font-bold text-slate-600 block mt-1">{formatVes(order.total_ves)}</span>
          </div>
        </div>

        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white min-h-[46px] px-4 py-2 font-black text-sm shadow-sm transition-colors cursor-pointer">
            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>Chatear por WhatsApp ({order.cliente_telefono})</span>
          </a>
        )}

        <AdminOrderStatusStepper order={order} isUpdating={isUpdating} onUpdateStatus={onUpdateStatus} onRequestDelete={() => setShowDeleteModal(true)} />
      </div>

      <div className="p-3.5 sm:p-4 space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl bg-slate-50 border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 tabular-nums">
          {summaryCells.map((cell) => (
            <div key={cell.label} className="p-3">
              <span className="text-[11px] text-slate-500 font-semibold block">{cell.label}</span>
              <span className={`text-sm ${cell.primaryClass}`}>{cell.primary}</span>
              <span className={`text-[10px] block ${cell.secondaryClass}`}>{cell.secondary}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
              {order.tipo_transporte === 'vehiculo_carga' ? <Truck className="h-5 w-5 text-amber-500 shrink-0" strokeWidth={1.5} /> : <MapPin className="h-5 w-5 text-[#0F172A] shrink-0" strokeWidth={1.5} />}
              <span>{deliveryTitle}</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {order.distancia_km ? (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-[#0F172A] font-black uppercase tracking-wider">
                  {getDeliveryTierInfo(order.distancia_km).tierBadge}
                </span>
              ) : null}
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-bold text-slate-700">
                {order.zona_barinas}{order.distancia_km ? ` • ${order.distancia_km} km` : ''}
              </span>
            </div>
          </div>
          {order.direccion_entrega && <p className="text-slate-800 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">{order.direccion_entrega}</p>}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#00227B] font-extrabold text-xs border border-blue-200 transition-colors">
              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>Abrir Ubicación en Google Maps (GPS)</span>
            </a>
          )}
          {order.notas && <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200"><strong>Nota del Cliente:</strong> {order.notas}</div>}
        </div>

        <AdminOrderPaymentProofSection order={order} />

        <div className="space-y-2">
          <span className="font-extrabold text-slate-900 text-xs block">Artículos para Facturación en Caja ({order.items.length})</span>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
            {order.items.map((it) => (
              <div key={it.id} className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 rounded-lg bg-slate-50 border shrink-0 overflow-hidden">
                    <Image src={it.imagen_url || IMAGE_FALLBACKS.product} alt="" fill sizes="44px" className="object-contain p-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate text-xs sm:text-sm">{it.nombre_articulo}</p>
                    <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                      SKU: <strong className="text-[#00227B]">{it.cod_articulo_foxdata}</strong>
                      {it.unidades_totales_descontadas ? ` • Descuenta ${it.unidades_totales_descontadas} und` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <span className="font-black text-slate-900 text-sm block">{it.cantidad}x</span>
                  <span className="text-slate-600 font-bold block text-xs">{formatUsd(it.subtotal_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DeleteOrderModal orderNumber={order.numero_orden} isOpen={showDeleteModal} isDeleting={isDeleting} onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)} />
      </div>
    </div>
  );
}
