-- ==============================================================================
-- GRAN CATADOR: Endurecimiento de Seguridad RLS (P0) + Bucket Privado Comprobantes
-- 1. Elimina reglas permisivas (OR true / USING (true)) en pedidos, items, pagos y chat.
-- 2. Restringe lectura de órdenes exclusivamente al propietario autenticado o Admin.
-- 3. Reserva creación/modificación de pedidos, ítems y pagos al backend (service_role) y Admin.
-- 4. Convierte el bucket 'payment-proofs' en privado (public = false) con políticas por propietario/Admin.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PUBLIC.PEDIDOS
-- ------------------------------------------------------------------------------
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gestionan todos los pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes pueden insertar pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes ven sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes ven sus pedidos propios" ON public.pedidos;

CREATE POLICY "Admins gestionan todos los pedidos"
  ON public.pedidos
  FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Clientes ven sus pedidos propios"
  ON public.pedidos
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND usuario_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 2. PUBLIC.PEDIDO_ITEMS
-- ------------------------------------------------------------------------------
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso a pedido_items" ON public.pedido_items;
DROP POLICY IF EXISTS "Admins gestionan pedido_items" ON public.pedido_items;
DROP POLICY IF EXISTS "Clientes ven items de sus pedidos" ON public.pedido_items;

CREATE POLICY "Admins gestionan pedido_items"
  ON public.pedido_items
  FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Clientes ven items de sus pedidos"
  ON public.pedido_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pedido_items.pedido_id
        AND p.usuario_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 3. PUBLIC.PAGOS_PEDIDO
-- ------------------------------------------------------------------------------
ALTER TABLE public.pagos_pedido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso a pagos_pedido" ON public.pagos_pedido;
DROP POLICY IF EXISTS "Admins gestionan pagos_pedido" ON public.pagos_pedido;
DROP POLICY IF EXISTS "Clientes ven pagos de sus pedidos" ON public.pagos_pedido;

CREATE POLICY "Admins gestionan pagos_pedido"
  ON public.pagos_pedido
  FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Clientes ven pagos de sus pedidos"
  ON public.pagos_pedido
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pagos_pedido.pedido_id
        AND p.usuario_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4. PUBLIC.PEDIDO_MENSAJES (Chat en tiempo real por pedido)
-- ------------------------------------------------------------------------------
ALTER TABLE public.pedido_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver mensajes del pedido" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Insertar mensajes en pedido" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Marcar mensajes como leidos" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Admins gestionan mensajes" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Clientes leen mensajes de sus pedidos" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Clientes envian mensajes en sus pedidos" ON public.pedido_mensajes;
DROP POLICY IF EXISTS "Clientes actualizan lectura de mensajes propios" ON public.pedido_mensajes;

CREATE POLICY "Admins gestionan mensajes"
  ON public.pedido_mensajes
  FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Clientes leen mensajes de sus pedidos"
  ON public.pedido_mensajes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pedido_mensajes.pedido_id
        AND p.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Clientes envian mensajes en sus pedidos"
  ON public.pedido_mensajes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pedido_mensajes.pedido_id
        AND p.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Clientes actualizan lectura de mensajes propios"
  ON public.pedido_mensajes
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pedido_mensajes.pedido_id
        AND p.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.pedidos p
      WHERE p.id = pedido_mensajes.pedido_id
        AND p.usuario_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 5. STORAGE: Bucket privado para comprobantes de pago ('payment-proofs')
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Acceso publico a payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Clientes suben su propio comprobante" ON storage.objects;
DROP POLICY IF EXISTS "Lectura privada de comprobantes" ON storage.objects;
DROP POLICY IF EXISTS "Admins eliminan comprobantes" ON storage.objects;

CREATE POLICY "Clientes suben su propio comprobante"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (
      public.is_admin()
      OR (
        auth.uid() IS NOT NULL
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Lectura privada de comprobantes"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND (
      public.is_admin()
      OR auth.role() = 'service_role'
      OR (
        auth.uid() IS NOT NULL
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Admins eliminan comprobantes"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'payment-proofs'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

-- Endurecer chat-attachments: lectura pública de adjuntos de chat pero escritura sólo autenticados/admin
DROP POLICY IF EXISTS "Acceso publico a chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Lectura chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados suben chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins gestionan chat-attachments" ON storage.objects;

CREATE POLICY "Lectura chat-attachments"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Usuarios autenticados suben chat-attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (auth.uid() IS NOT NULL OR public.is_admin())
  );

CREATE POLICY "Admins gestionan chat-attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

NOTIFY pgrst, 'reload schema';

