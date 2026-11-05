-- Migration: Añadir columnas de token de confirmación de correo
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS token_confirmacion TEXT,
ADD COLUMN IF NOT EXISTS token_confirmacion_expira TIMESTAMPTZ;

COMMENT ON COLUMN public.perfiles.token_confirmacion IS 'Token de seguridad para confirmar correo electrónico';
COMMENT ON COLUMN public.perfiles.token_confirmacion_expira IS 'Fecha de expiración del token de confirmación';

