-- Migración 002: Controles de imagen (opacidad/enfoque) en banners para CMS
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER NOT NULL DEFAULT 85,
  ADD COLUMN IF NOT EXISTS object_position TEXT NOT NULL DEFAULT 'center';

COMMENT ON COLUMN public.banners.overlay_opacity IS 'Opacidad de la capa oscura sobre la foto del banner (0 a 100)';
COMMENT ON COLUMN public.banners.object_position IS 'Punto focal vertical de la imagen de fondo (top, center, bottom)';

