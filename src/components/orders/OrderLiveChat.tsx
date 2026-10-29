'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send, ImagePlus, Loader2, Bot, Shield, User } from 'lucide-react';
import { useOrderChat } from '@/hooks/useOrderChat';
import { RemitenteRol } from '@/types';
import { cn } from '@/lib/utils';

interface OrderLiveChatProps {
  pedidoId: string;
  usuarioRol: RemitenteRol;
  usuarioNombre: string;
  usuarioId?: string | null;
  quickReplies?: string[];
}

export function OrderLiveChat({
  pedidoId,
  usuarioRol,
  usuarioNombre,
  usuarioId = null,
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

  // Auto-scroll local al último mensaje sin alterar el scroll global de la página
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
    <div className="flex flex-col h-[580px] rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Cabecera del Chat */}
      <div className="bg-catador-blue text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-catador-amber flex items-center justify-center font-bold text-xs text-white">
              {usuarioRol === 'cliente' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-catador-blue animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">
              {usuarioRol === 'cliente' ? 'Atención en Vivo • Gran Catador' : `Chat con Cliente: ${usuarioNombre}`}
            </h4>
            <p className="text-[10px] text-blue-200">
              {otherTyping.isTyping
                ? `${otherTyping.nombre} está escribiendo...`
                : usuarioRol === 'cliente'
                ? 'Administrador conectado en tiempo real'
                : 'Canal directo de la orden'}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor de Mensajes */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
        {cargando ? (
          <div className="h-full flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-catador-blue" />
            <span>Cargando mensajes en vivo...</span>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1">
            <Bot className="h-8 w-8 text-catador-amber mb-1" />
            <p className="font-bold text-slate-600">Canal en tiempo real iniciado</p>
            <p className="text-[11px] text-slate-400">Puedes escribir dudas o adjuntar fotos de comprobantes aquí.</p>
          </div>
        ) : (
          mensajes.map((m) => {
            const isMe = m.remitente_rol === usuarioRol;
            const isSystem = m.remitente_rol === 'sistema';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-center text-[11px] text-slate-700 max-w-sm shadow-2xs">
                    <span className="font-bold text-catador-amber mr-1">⚡ Gran Catador:</span>
                    <span>{m.mensaje}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-1 mb-0.5 px-1">
                  <span className="text-[10px] font-bold text-slate-500">{m.remitente_nombre}</span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(m.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2 shadow-2xs space-y-1.5',
                    isMe
                      ? 'bg-catador-blue text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  )}
                >
                  {m.adjunto_url && (
                    <div className="relative aspect-video w-48 rounded-lg overflow-hidden bg-slate-100 border">
                      <Image src={m.adjunto_url} alt="Adjunto" fill className="object-cover" />
                    </div>
                  )}
                  {m.mensaje && <p className="leading-relaxed break-words">{m.mensaje}</p>}
                </div>
              </div>
            );
          })
        )}

        {/* Indicador Escribiendo */}
        {otherTyping.isTyping && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
            <span className="flex gap-1 items-center bg-white px-2.5 py-1 rounded-full border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-catador-amber animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[10px] text-slate-600 font-medium">{otherTyping.nombre} está escribiendo...</span>
            </span>
          </div>
        )}
      </div>

      {/* Respuestas rápidas si se pasan */}
      {quickReplies.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[10px]">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => enviarMensaje(qr)}
              className="shrink-0 bg-white border border-slate-200 hover:border-catador-blue rounded-full px-2.5 py-1 text-slate-700 font-semibold transition-colors cursor-pointer"
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
          title="Adjuntar imagen o comprobante"
          className="p-2 rounded-xl text-slate-400 hover:text-catador-blue hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={inputTexto}
          onChange={handleInputChange}
          placeholder="Escribe tu mensaje aquí..."
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-catador-blue/20"
        />

        <button
          type="submit"
          disabled={!inputTexto.trim() || enviando}
          className="flex items-center justify-center h-8 w-8 rounded-xl bg-catador-blue hover:bg-catador-blue-light disabled:bg-slate-200 text-white transition-colors cursor-pointer"
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
