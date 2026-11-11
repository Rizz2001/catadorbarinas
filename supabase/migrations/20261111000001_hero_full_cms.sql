-- ============================================================================
-- MIGRACIÓN: Edición completa del Hero Principal Opción C desde el CMS
-- ============================================================================

ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS titulo_destacado TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS boton_secundario_texto TEXT DEFAULT 'Explorar Catálogo',
  ADD COLUMN IF NOT EXISTS boton_secundario_url TEXT DEFAULT '/catalogo',
  ADD COLUMN IF NOT EXISTS color_fondo TEXT DEFAULT '#081229';

UPDATE public.banners
SET
  boton_secundario_texto = COALESCE(NULLIF(boton_secundario_texto, ''), 'Explorar Catálogo'),
  boton_secundario_url = COALESCE(NULLIF(boton_secundario_url, ''), '/catalogo'),
  color_fondo = COALESCE(NULLIF(color_fondo, ''), '#081229')
WHERE tipo = 'hero';

