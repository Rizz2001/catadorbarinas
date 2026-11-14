-- ==============================================================================
-- GRAN CATADOR: Reparación de Publicación Supabase Realtime + Permisos WALRUS RLS
-- Asegura que los eventos INSERT/UPDATE en public.pedidos y public.pedido_mensajes
-- se emitan en tiempo real hacia los clientes autenticados con rol 'admin'.
-- ==============================================================================

-- 1. Asegurar permisos de ejecución en la función public.is_admin() para Realtime (WALRUS)
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. Asegurar permisos de tabla base para el rol authenticated (evaluado por Realtime)
GRANT SELECT ON public.perfiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos_pedido TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_mensajes TO authenticated;

-- 3. Configurar REPLICA IDENTITY FULL para que Realtime envíe todas las columnas en INSERT/UPDATE
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;
ALTER TABLE public.pagos_pedido REPLICA IDENTITY FULL;
ALTER TABLE public.pedido_mensajes REPLICA IDENTITY FULL;

-- 4. Política explícita de SELECT para administradores en pedidos y pedido_mensajes
-- (Supabase Realtime evalúa políticas FOR SELECT para autorizar eventos INSERT)
DROP POLICY IF EXISTS "Admins leen todos los pedidos (Realtime)" ON public.pedidos;
CREATE POLICY "Admins leen todos los pedidos (Realtime)"
  ON public.pedidos
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins leen todos los mensajes (Realtime)" ON public.pedido_mensajes;
CREATE POLICY "Admins leen todos los mensajes (Realtime)"
  ON public.pedido_mensajes
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 5. Registrar tablas en la publicación supabase_realtime de forma idempotente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pedidos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pagos_pedido'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pagos_pedido;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pedido_mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedido_mensajes;
  END IF;
END $$;

