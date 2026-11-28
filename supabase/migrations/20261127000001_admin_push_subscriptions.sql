-- ==============================================================================
-- EL CATADOR: Suscripciones Web Push exclusivas para Administradores (PWA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_push_subscriptions_usuario_id
  ON public.admin_push_subscriptions (usuario_id);

ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_push_subscriptions TO authenticated;
GRANT ALL ON public.admin_push_subscriptions TO service_role;

DROP POLICY IF EXISTS "Admins gestionan sus propias suscripciones push" ON public.admin_push_subscriptions;
CREATE POLICY "Admins gestionan sus propias suscripciones push"
  ON public.admin_push_subscriptions
  FOR ALL
  TO authenticated
  USING (public.is_admin() AND (SELECT auth.uid()) = usuario_id)
  WITH CHECK (public.is_admin() AND (SELECT auth.uid()) = usuario_id);
