'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PedidoMensajeRow, TipoMensaje, RemitenteRol } from '@/types';
import { soundFx } from '@/lib/sound';

interface UseOrderChatProps {
  pedidoId: string;
  usuarioRol: RemitenteRol;
  usuarioNombre: string;
  usuarioId?: string | null;
}

interface OtherTypingState {
  isTyping: boolean;
  nombre: string;
}

export function useOrderChat({
  pedidoId,
  usuarioRol,
  usuarioNombre,
  usuarioId = null,
}: UseOrderChatProps) {
  const [mensajes, setMensajes] = useState<PedidoMensajeRow[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [otherTyping, setOtherTyping] = useState<OtherTypingState>({
    isTyping: false,
    nombre: '',
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 1. Cargar historial inicial de mensajes
  const cargarHistorial = useCallback(async () => {
    if (!pedidoId) return;
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('pedido_mensajes')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        setMensajes(data as PedidoMensajeRow[]);
      }
    } catch (err) {
      console.warn('Error cargando historial de chat en Supabase:', err);
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  // 2. Suscribirse a Supabase Realtime (Cambios en BD + Typing Broadcast)
  useEffect(() => {
    if (!pedidoId) return;

    const timer = setTimeout(() => {
      cargarHistorial();
    }, 0);

    const channelName = `pedido-chat-${pedidoId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    // Escuchar nuevos mensajes insertados
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pedido_mensajes',
          filter: `pedido_id=eq.${pedidoId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const nuevoMensaje = payload.new as unknown as PedidoMensajeRow;
          setMensajes((prev) => {
            if (prev.some((m) => m.id === nuevoMensaje.id)) return prev;
            return [...prev, nuevoMensaje];
          });

          // Sonido de burbuja si el mensaje lo envió otra persona
          if (nuevoMensaje.remitente_rol !== usuarioRol) {
            soundFx.playMessageBubble();
          }
        }
      )
      // Escuchar actualizaciones (ej. leido = true)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedido_mensajes',
          filter: `pedido_id=eq.${pedidoId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as PedidoMensajeRow;
          setMensajes((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      // Escuchar indicador de "Escribiendo..."
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload?: { remitenteRol?: string; isTyping?: boolean; remitenteNombre?: string } }) => {
        if (payload?.remitenteRol !== usuarioRol && payload?.isTyping) {
          setOtherTyping({ isTyping: true, nombre: payload.remitenteNombre || 'Operador' });

          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setOtherTyping({ isTyping: false, nombre: '' });
          }, 3500);
        } else if (!payload?.isTyping) {
          setOtherTyping({ isTyping: false, nombre: '' });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearTimeout(timer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [pedidoId, usuarioRol, cargarHistorial]);

  // 3. Emitir estado "Escribiendo..." al canal
  const emitirTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return;
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          isTyping,
          remitenteNombre: usuarioNombre,
          remitenteRol: usuarioRol,
        },
      });
    },
    [usuarioNombre, usuarioRol]
  );

  // 4. Enviar Mensaje
  const enviarMensaje = async (
    texto: string,
    tipo: TipoMensaje = 'texto',
    adjuntoUrl?: string
  ): Promise<boolean> => {
    const cleanText = texto.trim();
    if (!cleanText && !adjuntoUrl) return false;

    setEnviando(true);
    emitirTyping(false);

    const payload = {
      pedido_id: pedidoId,
      remitente_id: usuarioId,
      remitente_rol: usuarioRol,
      remitente_nombre: usuarioNombre,
      mensaje: cleanText || (tipo === 'imagen' ? 'Foto adjunta' : ''),
      adjunto_url: adjuntoUrl || null,
      tipo_mensaje: tipo,
      leido: false,
    };

    try {
      const { data, error } = await supabase
        .from('pedido_mensajes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Fallback optimista local si aún no está creada la tabla en remoto
        const optimisticMsg: PedidoMensajeRow = {
          id: Math.random().toString(36).substring(7),
          ...payload,
          created_at: new Date().toISOString(),
        };
        setMensajes((prev) => [...prev, optimisticMsg]);
      } else if (data) {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === (data as PedidoMensajeRow).id)) return prev;
          return [...prev, data as PedidoMensajeRow];
        });
      }
      return true;
    } catch {
      return false;
    } finally {
      setEnviando(false);
    }
  };

  // 5. Subir imagen y enviar mensaje
  const subirAdjuntoYEnviar = async (file: File): Promise<boolean> => {
    try {
      setEnviando(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${pedidoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      let publicUrl = '';
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(uploadData.path);
        publicUrl = urlData.publicUrl;
      } else {
        // Fallback si el bucket no está creado: DataURL en Base64 para visualización directa
        publicUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      return await enviarMensaje(file.name, 'imagen', publicUrl);
    } catch (err) {
      console.error('Error subiendo imagen en chat:', err);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  // 6. Marcar mensajes como leídos
  const marcarComoLeidos = useCallback(async () => {
    try {
      await supabase
        .from('pedido_mensajes')
        .update({ leido: true })
        .eq('pedido_id', pedidoId)
        .neq('remitente_rol', usuarioRol)
        .eq('leido', false);

      setMensajes((prev) =>
        prev.map((m) => (m.remitente_rol !== usuarioRol ? { ...m, leido: true } : m))
      );
    } catch {
      // Ignorar errores menores
    }
  }, [pedidoId, usuarioRol]);

  return {
    mensajes,
    cargando,
    enviando,
    otherTyping,
    enviarMensaje,
    subirAdjuntoYEnviar,
    emitirTyping,
    marcarComoLeidos,
  };
}
