-- ============================================================================
-- HABILITAR INSERT Y MEJORAR UPDATE EN public.perfiles PARA UPSERTS
-- ============================================================================

-- 1. Permitir que usuarios autenticados inserten su propio perfil (o admin inserte)
DROP POLICY IF EXISTS "Usuarios insertan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios insertan su propio perfil" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. Permitir que usuarios autenticados actualicen su propio perfil (o admin edite)
DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.perfiles;
CREATE POLICY "Usuarios editan su propio perfil" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());
