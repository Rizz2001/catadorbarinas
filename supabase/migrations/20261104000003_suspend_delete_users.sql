-- ============================================================================
-- MIGRACIÓN 9: Suspender y Eliminar Usuarios en el CMS
-- ============================================================================

-- Agregar columna 'suspendido' y 'motivo_suspension' a perfiles
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS suspendido BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS motivo_suspension TEXT DEFAULT NULL;

-- Actualizar función o trigger si aplica
COMMENT ON COLUMN public.perfiles.suspendido IS 'Indica si la cuenta ha sido suspendida por el administrador';

