-- ============================================================================
-- SCRIPT CONSOLIDADO: BASE DE DATOS COMPLETA GRAN CATADOR BARINAS
-- Proyecto: peqyfpsdqwtdaytqllxy (peqyfpsdqwtdaytqllxy.supabase.co)
-- Pega este código completo en el SQL Editor de tu Dashboard de Supabase y presiona RUN.
-- ============================================================================

-- Habilitar extensión UUID
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

-- Función para verificar si un usuario es administrador
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
  guest_token TEXT,
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

-- Índices de alta velocidad
CREATE INDEX IF NOT EXISTS idx_pedido_mensajes_pedido ON public.pedido_mensajes(pedido_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado_pedido, estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON public.pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido_pedido ON public.pagos_pedido(pedido_id);

-- ============================================================================
-- TRIGGER: Creación automática de perfiles al registrarse en auth.users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (
    id,
    nombre,
    telefono,
    cedula,
    direccion,
    rol
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'cedula',
    NEW.raw_user_meta_data->>'direccion',
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = COALESCE(EXCLUDED.telefono, public.perfiles.telefono),
    cedula = COALESCE(EXCLUDED.cedula, public.perfiles.cedula),
    direccion = COALESCE(EXCLUDED.direccion, public.perfiles.direccion),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER: Mensajes automáticos del sistema en el chat ante cambios de orden
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
        '✅ Tu pago ha sido verificado con éxito por administración.',
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

-- Políticas de perfiles
DROP POLICY IF EXISTS "Usuarios ven su propio perfil o admin ve todos" ON public.perfiles;
CREATE POLICY "Usuarios ven su propio perfil o admin ve todos" ON public.perfiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios editan su propio perfil" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON public.perfiles;
CREATE POLICY "Permitir inserción de perfiles" ON public.perfiles
  FOR INSERT WITH CHECK (true);

-- Políticas de pedidos
DROP POLICY IF EXISTS "Admins gestionan todos los pedidos" ON public.pedidos;
CREATE POLICY "Admins gestionan todos los pedidos" ON public.pedidos
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Clientes pueden insertar pedidos" ON public.pedidos;
CREATE POLICY "Clientes pueden insertar pedidos" ON public.pedidos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Clientes ven sus pedidos" ON public.pedidos;
CREATE POLICY "Clientes ven sus pedidos" ON public.pedidos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Actualizar pedidos" ON public.pedidos;
CREATE POLICY "Actualizar pedidos" ON public.pedidos
  FOR UPDATE USING (true);

-- Políticas de pedido_items, pagos_pedido y mensajes
DROP POLICY IF EXISTS "Acceso a pedido_items" ON public.pedido_items;
CREATE POLICY "Acceso a pedido_items" ON public.pedido_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Acceso a pagos_pedido" ON public.pagos_pedido;
CREATE POLICY "Acceso a pagos_pedido" ON public.pagos_pedido FOR ALL USING (true);

DROP POLICY IF EXISTS "Acceso a pedido_mensajes" ON public.pedido_mensajes;
CREATE POLICY "Acceso a pedido_mensajes" ON public.pedido_mensajes FOR ALL USING (true);

-- ============================================================================
-- ACTIVACIÓN DE SUPABASE REALTIME
-- ============================================================================
DO $$
BEGIN
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

-- ============================================================================
-- STORAGE BUCKETS (Captures de Pago y Adjuntos de Chat)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acceso publico a payment-proofs" ON storage.objects;
CREATE POLICY "Acceso publico a payment-proofs" ON storage.objects
  FOR ALL USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Acceso publico a chat-attachments" ON storage.objects;
CREATE POLICY "Acceso publico a chat-attachments" ON storage.objects
  FOR ALL USING (bucket_id = 'chat-attachments');
