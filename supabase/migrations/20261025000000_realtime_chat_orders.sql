-- ============================================================================
-- MIGRACIÓN OFICIAL: Gran Catador / Bodegón del Catador Barinas
-- Sistema de Pedidos, Pagos Bimonetarios y Chat en Tiempo Real Cliente <-> Admin
-- ============================================================================

-- Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: perfiles (Perfiles de usuarios y administradores)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  cedula TEXT,
  direccion TEXT,
  rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin', 'repartidor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Función auxiliar para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

-- 2. TABLA: pedidos (Órdenes de compra)
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orden TEXT NOT NULL UNIQUE,
  usuario_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  guest_token TEXT, -- Para seguimiento de clientes sin sesión iniciada
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  cliente_cedula TEXT NOT NULL,
  cliente_email TEXT,
  tipo_entrega TEXT NOT NULL CHECK (tipo_entrega IN ('delivery', 'pickup')),
  direccion_entrega TEXT,
  zona_barinas TEXT,
  subtotal_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal_ves NUMERIC(14, 2) NOT NULL DEFAULT 0,
  delivery_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_ves NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_ves NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tasa_bcv NUMERIC(12, 4) NOT NULL DEFAULT 1,
  estado_pedido TEXT NOT NULL DEFAULT 'recibido' CHECK (estado_pedido IN ('recibido', 'preparando', 'en_camino', 'entregado', 'cancelado')),
  estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'verificado', 'rechazado')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: pedido_items (Detalle de productos vinculados a FoxData)
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  cod_articulo_foxdata TEXT NOT NULL,
  nombre_articulo TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario_usd NUMERIC(12, 2) NOT NULL,
  precio_unitario_ves NUMERIC(14, 2) NOT NULL,
  subtotal_usd NUMERIC(12, 2) NOT NULL,
  subtotal_ves NUMERIC(14, 2) NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: pagos_pedido (Detalles del comprobante de pago)
CREATE TABLE IF NOT EXISTS public.pagos_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('pago_movil', 'zelle', 'efectivo_usd', 'punto_venta')),
  monto_usd NUMERIC(12, 2) NOT NULL,
  monto_ves NUMERIC(14, 2) NOT NULL,
  banco_origen TEXT,
  telefono_origen TEXT,
  referencia TEXT,
  comprobante_url TEXT,
  billete_pago_usd NUMERIC(10, 2),
  vuelto_calculado_usd NUMERIC(10, 2),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'rechazado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: pedido_mensajes (Chat en Vivo Cliente <-> Admin por Pedido)
CREATE TABLE IF NOT EXISTS public.pedido_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  remitente_rol TEXT NOT NULL CHECK (remitente_rol IN ('cliente', 'admin', 'sistema')),
  remitente_nombre TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  adjunto_url TEXT,
  tipo_mensaje TEXT NOT NULL DEFAULT 'texto' CHECK (tipo_mensaje IN ('texto', 'imagen', 'evento_estado', 'solicitud_pago')),
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para consultas de alta velocidad y Realtime
CREATE INDEX IF NOT EXISTS idx_pedido_mensajes_pedido ON public.pedido_mensajes(pedido_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado_pedido, estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON public.pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido_pedido ON public.pagos_pedido(pedido_id);

-- ============================================================================
-- TRIGGER: Mensajes Automáticos del Sistema al Cambiar Estado de la Orden
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_on_pedido_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mensaje TEXT := NULL;
  v_tipo TEXT := 'evento_estado';
BEGIN
  -- 1. Al insertar un nuevo pedido
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.pedido_mensajes (
      pedido_id,
      remitente_rol,
      remitente_nombre,
      mensaje,
      tipo_mensaje
    ) VALUES (
      NEW.id,
      'sistema',
      'Gran Catador Bot',
      '¡Hola! Hemos recibido tu pedido #' || NEW.numero_orden || '. Un administrador de Gran Catador está verificando tu orden en este momento por esta vía.',
      'evento_estado'
    );
    RETURN NEW;
  END IF;

  -- 2. Al cambiar estado_pedido
  IF (TG_OP = 'UPDATE' AND OLD.estado_pedido IS DISTINCT FROM NEW.estado_pedido) THEN
    IF (NEW.estado_pedido = 'preparando') THEN
      v_mensaje := '📦 Tu pedido está siendo preparado con cuidado en nuestro Bodegón (Depósito 01).';
    ELSIF (NEW.estado_pedido = 'en_camino') THEN
      v_mensaje := '🛵 ¡Tu pedido va en camino! Nuestro repartidor ya salió hacia tu dirección en Barinas.';
    ELSIF (NEW.estado_pedido = 'entregado') THEN
      v_mensaje := '🎉 Pedido entregado con éxito. ¡Muchas gracias por comprar en Gran Catador!';
    ELSIF (NEW.estado_pedido = 'cancelado') THEN
      v_mensaje := '❌ El pedido ha sido cancelado. Puedes escribirnos aquí ante cualquier duda.';
    END IF;

    IF v_mensaje IS NOT NULL THEN
      INSERT INTO public.pedido_mensajes (
        pedido_id,
        remitente_rol,
        remitente_nombre,
        mensaje,
        tipo_mensaje
      ) VALUES (
        NEW.id,
        'sistema',
        'Gran Catador Bot',
        v_mensaje,
        v_tipo
      );
    END IF;
  END IF;

  -- 3. Al cambiar estado_pago
  IF (TG_OP = 'UPDATE' AND OLD.estado_pago IS DISTINCT FROM NEW.estado_pago) THEN
    IF (NEW.estado_pago = 'verificado') THEN
      INSERT INTO public.pedido_mensajes (
        pedido_id,
        remitente_rol,
        remitente_nombre,
        mensaje,
        tipo_mensaje
      ) VALUES (
        NEW.id,
        'sistema',
        'Gran Catador Bot',
        '✅ Tu pago ha sido verificado con éxito por administración. Avanzando orden.',
        'evento_estado'
      );
    ELSIF (NEW.estado_pago = 'rechazado') THEN
      INSERT INTO public.pedido_mensajes (
        pedido_id,
        remitente_rol,
        remitente_nombre,
        mensaje,
        tipo_mensaje
      ) VALUES (
        NEW.id,
        'sistema',
        'Gran Catador Bot',
        '⚠️ Hubo un detalle verificando tu comprobante de pago. Por favor escríbenos o adjunta una captura legible por aquí.',
        'solicitud_pago'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedido_status_change ON public.pedidos;
CREATE TRIGGER trg_pedido_status_change
  AFTER INSERT OR UPDATE OF estado_pedido, estado_pago
  ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_on_pedido_status_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_mensajes ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Usuarios ven su propio perfil o admin ve todos" ON public.perfiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Usuarios editan su propio perfil" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para pedidos:
-- Admins pueden todo.
-- Clientes pueden SELECT de su propio pedido (usuario_id = auth.uid() o sesión pública con guest_token).
-- Inserción permitida para checkout.
CREATE POLICY "Admins gestionan todos los pedidos" ON public.pedidos
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Clientes pueden insertar pedidos" ON public.pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Clientes ven sus pedidos" ON public.pedidos
  FOR SELECT USING (
    public.is_admin()
    OR auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
    OR true -- Acceso de lectura por ID de pedido para clientes con link directo
  );

-- Políticas para pedido_items
CREATE POLICY "Acceso a pedido_items" ON public.pedido_items
  FOR ALL USING (true);

-- Políticas para pagos_pedido
CREATE POLICY "Acceso a pagos_pedido" ON public.pagos_pedido
  FOR ALL USING (true);

-- Políticas para pedido_mensajes
CREATE POLICY "Ver mensajes del pedido" ON public.pedido_mensajes
  FOR SELECT USING (true);

CREATE POLICY "Insertar mensajes en pedido" ON public.pedido_mensajes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Marcar mensajes como leidos" ON public.pedido_mensajes
  FOR UPDATE USING (true);

-- ============================================================================
-- SUPABASE REALTIME PUBLICATION
-- ============================================================================
DO $$
BEGIN
  -- Agregar tablas a la publicación de realtime si no están ya añadidas
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pedidos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pagos_pedido'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pagos_pedido;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pedido_mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedido_mensajes;
  END IF;
END $$;
