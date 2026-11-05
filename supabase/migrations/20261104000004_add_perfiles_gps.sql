-- Migration: Añadir coordenadas GPS (latitud y longitud) al perfil de usuario
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS latitud NUMERIC,
ADD COLUMN IF NOT EXISTS longitud NUMERIC;

COMMENT ON COLUMN public.perfiles.latitud IS 'Coordenada GPS de latitud predeterminada del cliente en Barinas';
COMMENT ON COLUMN public.perfiles.longitud IS 'Coordenada GPS de longitud predeterminada del cliente en Barinas';

