'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send, ImagePlus, Loader2, Bot, Shield, User, Sparkles } from 'lucide-react';
import { useOrderChat } from '@/hooks/useOrderChat';
import { RemitenteRol } from '@/types';
import { cn } from '@/lib/utils';

interface OrderLiveChatProps {
  pedidoId: string;
  usuarioRol: RemitenteRol;
  usuarioNombre: string;
  usuarioId?: string | null;
  numeroOrden?: string;
  quickReplies?: string[];
}

export function OrderLiveChat({
  pedidoId,
  usuarioRol,
  usuarioNombre,
  usuarioId = null,
  numeroOrden,
  quickReplies = [],
}: OrderLiveChatProps) {
  const {
    mensajes,
    cargando,
    enviando,
    otherTyping,
    enviarMensaje,
    subirAdjuntoYEnviar,
    emitirTyping,
    marcarComoLeidos,
  } = useOrderChat({ pedidoId, usuarioRol, usuarioNombre, usuarioId });

  const [inputTexto, setInputTexto] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    marcarComoLeidos();
  }, [mensajes, otherTyping, marcarComoLeidos]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTexto.trim() || enviando) return;
    const textToSend = inputTexto;
    setInputTexto('');
    await enviarMensaje(textToSend);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTexto(e.target.value);
    emitirTyping(e.target.value.length > 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await subirAdjuntoYEnviar(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[520px] sm:h-[580px] rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
      {/* Cabecera del Chat */}
      <div className="bg-gradient-to-r from-catador-blue to-blue-900 text-white p-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-xl bg-catador-amber flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {usuarioRol === 'cliente' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-catador-blue animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black leading-tight truncate">
                {usuarioRol === 'cliente' ? 'Concierge en Vivo • Gran Catador' : `Cliente: ${usuarioNombre}`}
              </h4>
              {numeroOrden && (
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                  #{numeroOrden}
                </span>
              )}
            </div>
            <p className="text-[10px] text-blue-200 truncate">
              {otherTyping.isTyping
                ? `${otherTyping.nombre} está escribiendo...`
                : usuarioRol === 'cliente'
                ? 'En línea • Verificando tu pago y despacho'
                : 'Canal directo de la orden'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={enviando}
          className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[10px] font-extrabold text-white transition-colors cursor-pointer"
        >
          <ImagePlus className="h-3.5 w-3.5 text-amber-300" />
          <span className="hidden xs:inline">Enviar Capture</span>
        </button>
      </div>

      {/* Contenedor de Mensajes */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80 text-xs">
        {cargando ? (
          <div className="h-full flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-catador-blue" />
            <span>Conectando con administración...</span>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1.5">
            <Bot className="h-9 w-9 text-catador-amber mb-1" />
            <p className="font-bold text-slate-700">¡Canal de atención en vivo activo!</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Escríbenos cualquier indicación de entrega o adjunta el comprobante de tu pago aquí.
            </p>
          </div>
        ) : (
          mensajes.map((m) => {
            const isMe = m.remitente_rol === usuarioRol;
            const isSystem = m.remitente_rol === 'sistema';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-center text-[11px] text-slate-800 max-w-sm shadow-2xs">
                    <span className="font-extrabold text-catador-amber mr-1">⚡ Gran Catador:</span>
                    <span>{m.mensaje}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-[10px] font-bold text-slate-600">{m.remitente_nombre}</span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(m.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-2xs space-y-1.5',
                    isMe
                      ? 'bg-catador-blue text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  )}
                >
                  {m.adjunto_url && (
                    <div className="relative aspect-video w-52 max-w-full rounded-xl overflow-hidden bg-slate-100 border">
                      <Image src={m.adjunto_url} alt="Comprobante adjunto" fill sizes="208px" className="object-cover" />
                    </div>
                  )}
                  {m.mensaje && <p className="leading-relaxed break-words">{m.mensaje}</p>}
                </div>
              </div>
            );
          })
        )}

        {otherTyping.isTyping && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
            <span className="flex gap-1 items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[10px] text-slate-600 font-semibold">{otherTyping.nombre} está escribiendo...</span>
            </span>
          </div>
        )}
      </div>

      {/* Respuestas rápidas */}
      {quickReplies.length > 0 && (
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <Sparkles className="h-3.5 w-3.5 text-catador-amber shrink-0" />
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => enviarMensaje(qr)}
              className="shrink-0 bg-white border border-slate-200 hover:border-catador-blue hover:text-catador-blue rounded-full px-3 py-1 text-slate-700 font-bold transition-colors cursor-pointer shadow-2xs"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input de Envío */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={enviando}
          title="Adjuntar foto o capture de pago"
          aria-label="Adjuntar foto o capture de pago"
          className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-catador-blue hover:bg-blue-50 transition-colors cursor-pointer shrink-0 border border-slate-200"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={inputTexto}
          onChange={handleInputChange}
          placeholder="Escribe al administrador o envía tu capture..."
          className="flex-1 min-h-[42px] rounded-xl border border-slate-200 px-3.5 py-2 text-base md:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
        />

        <button
          type="submit"
          disabled={!inputTexto.trim() || enviando}
          aria-label="Enviar mensaje"
          className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-200 text-white transition-colors cursor-pointer shadow-xs"
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
