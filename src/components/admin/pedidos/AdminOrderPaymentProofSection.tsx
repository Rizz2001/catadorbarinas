'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Badge } from '@astryxdesign/core/Badge';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { PedidoConDetalles } from '@/types';

interface AdminOrderPaymentProofSectionProps {
  order: PedidoConDetalles;
}

/**
 * Tarjeta operativa de verificación de pago, copia de referencia y modal
 * de ampliación del comprobante adjunto por el cliente.
 */
export function AdminOrderPaymentProofSection({
  order,
}: AdminOrderPaymentProofSectionProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  if (!order.pago) return null;

  const copyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <>
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
                aria-label="Copiar referencia"
              >
                {copiedRef ? (
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          )}
        </div>

        {order.pago.billete_pago_usd && (
          <p className="text-xs text-slate-700 tabular-nums">
            Cliente paga con billete de{' '}
            <strong className="text-emerald-700">${order.pago.billete_pago_usd}</strong> • Vuelto a
            entregar:{' '}
            <strong className="text-catador-blue">${order.pago.vuelto_calculado_usd || 0}</strong>
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
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Ampliar Comprobante</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {order.pago.comprobante_url && (
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
                subtitle={order.pago.referencia ? `Referencia #${order.pago.referencia}` : undefined}
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
    </>
  );
}

