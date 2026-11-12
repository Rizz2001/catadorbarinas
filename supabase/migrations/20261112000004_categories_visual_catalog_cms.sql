-- ============================================================================
-- MIGRACIÓN: Catálogo Visual de Categorías (/catalogo) y Uploader CMS (/admin/categorias)
-- 1. Añade image_url (TEXT) e is_featured (BOOLEAN DEFAULT false) a public.categorias_rapidas.
-- 2. Desacopla show_on_homepage de activo en el trigger para permitir categorías exclusivas del catálogo visual.
-- 3. Crea y asegura el bucket público 'category-images' en Supabase Storage.
-- ============================================================================

-- 1. Nuevas columnas para navegación visual y colecciones destacadas
ALTER TABLE public.categorias_rapidas
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 2. Trigger actualizado: sincroniza icon_name <-> icono, pero mantiene activo e show_on_homepage independientes
CREATE OR REPLACE FUNCTION public.sync_categorias_rapidas_cms_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.icon_name IS NOT NULL AND NEW.icon_name <> '' THEN
    NEW.icono := NEW.icon_name;
  ELSE
    NEW.icon_name := COALESCE(NULLIF(NEW.icono, ''), 'Wine');
  END IF;

  NEW.show_on_homepage := COALESCE(NEW.show_on_homepage, true);
  NEW.activo := COALESCE(NEW.activo, true);
  NEW.is_featured := COALESCE(NEW.is_featured, false);

  RETURN NEW;
END;
$$;

-- 3. Bucket público 'category-images' en Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Lectura publica category-images" ON storage.objects;
CREATE POLICY "Lectura publica category-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admin gestiona category-images" ON storage.objects;
CREATE POLICY "Admin gestiona category-images"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'category-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  )
  WITH CHECK (
    bucket_id = 'category-images'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );

