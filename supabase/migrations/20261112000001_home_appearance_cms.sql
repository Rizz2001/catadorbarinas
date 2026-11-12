-- ============================================================================
-- MIGRACIÓN: Panel CMS de Portada e Inicio (/admin/inicio)
-- Nodos estructurales JSONB, Categorías rápidas (icon_name, show_on_homepage)
-- y Campaña de Ofertas Relámpago con fecha límite
-- ============================================================================

-- 1. Nodos estructurales JSONB y campaña de portada en configuracion_tienda
ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS bento_cards JSONB,
  ADD COLUMN IF NOT EXISTS flash_sale_campaign JSONB,
  ADD COLUMN IF NOT EXISTS weekly_trends_config JSONB;

-- 2. Campos solicitados en categorias_rapidas: icon_name y show_on_homepage
ALTER TABLE public.categorias_rapidas
  ADD COLUMN IF NOT EXISTS icon_name TEXT,
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT true;

UPDATE public.categorias_rapidas
SET
  icon_name = COALESCE(NULLIF(icon_name, ''), NULLIF(icono, ''), 'Wine'),
  show_on_homepage = COALESCE(show_on_homepage, activo, true);

-- Mantener sincronizados icono <-> icon_name y activo <-> show_on_homepage
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

  IF NEW.show_on_homepage IS DISTINCT FROM OLD.show_on_homepage THEN
    NEW.activo := COALESCE(NEW.show_on_homepage, true);
  ELSIF NEW.activo IS DISTINCT FROM OLD.activo THEN
    NEW.show_on_homepage := COALESCE(NEW.activo, true);
  ELSE
    NEW.show_on_homepage := COALESCE(NEW.show_on_homepage, NEW.activo, true);
    NEW.activo := COALESCE(NEW.activo, NEW.show_on_homepage, true);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_categorias_rapidas_cms ON public.categorias_rapidas;
CREATE TRIGGER trg_sync_categorias_rapidas_cms
  BEFORE INSERT OR UPDATE ON public.categorias_rapidas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_categorias_rapidas_cms_fields();

-- 3. Índice rápido para consultar artículos marcados en Oferta Relámpago
CREATE INDEX IF NOT EXISTS idx_productos_config_cms_oferta
  ON public.productos_config_cms (es_oferta_destacada)
  WHERE es_oferta_destacada = true;

