-- Migration: Añadir estado de correo_confirmado en perfiles
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS correo_confirmado BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.perfiles.correo_confirmado IS 'Indica si el cliente ha confirmado su correo electrónico para poder realizar pedidos';

-- Marcar como confirmados a los usuarios que ya están verificados en auth.users
UPDATE public.perfiles p
SET correo_confirmado = true
FROM auth.users u
WHERE p.id = u.id AND u.email_confirmed_at IS NOT NULL;

-- Administradores siempre confirmados
UPDATE public.perfiles
SET correo_confirmado = true
WHERE rol = 'admin';

