import Image from 'next/image';
import { PedidoMensajeRow, RemitenteRol } from '@/types';
import { cn } from '@/lib/utils';

interface OrderChatMessageBubbleProps {
  mensaje: PedidoMensajeRow;
  usuarioRol: RemitenteRol;
}

export function OrderChatMessageBubble({ mensaje, usuarioRol }: OrderChatMessageBubbleProps) {
  const isMe = mensaje.remitente_rol === usuarioRol;
  const timeLabel = new Date(mensaje.created_at).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (mensaje.remitente_rol === 'sistema') {
    return (
      <div className="flex justify-center my-2">
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-center text-[11px] text-slate-800 max-w-sm shadow-2xs">
          <span className="font-extrabold text-amber-700 mr-1">Gran Catador:</span>
          <span>{mensaje.mensaje}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
      <div className="flex items-center gap-1.5 mb-0.5 px-1">
        <span className="text-[10px] font-bold text-slate-600">{mensaje.remitente_nombre}</span>
        <span className="text-[10px] text-slate-500 tabular-nums">{timeLabel}</span>
      </div>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-2xs space-y-1.5',
          isMe
            ? 'bg-[#0F172A] text-white rounded-br-xs'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
        )}
      >
        {mensaje.adjunto_url && (
          <div className="relative aspect-video w-52 max-w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/40">
            <Image
              src={mensaje.adjunto_url}
              alt="Comprobante adjunto"
              fill
              sizes="208px"
              className="object-cover"
            />
          </div>
        )}
        {mensaje.mensaje && (
          <p className={cn('leading-relaxed break-words text-[13px]', isMe ? 'text-white !text-white' : 'text-slate-800')}>
            {mensaje.mensaje}
          </p>
        )}
        <span className={cn('block text-[10px] text-right tabular-nums', isMe ? 'text-slate-300 !text-slate-300' : 'text-slate-500')}>
          {timeLabel}
        </span>
      </div>
    </div>
  );
}
