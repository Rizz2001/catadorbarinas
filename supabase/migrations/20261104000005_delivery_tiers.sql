-- Migration: Tarifas escalonadas de delivery por distancia y volumen
ALTER TABLE public.configuracion_tienda
ADD COLUMN IF NOT EXISTS delivery_corta_usd NUMERIC DEFAULT 1.50,
ADD COLUMN IF NOT EXISTS delivery_media_usd NUMERIC DEFAULT 2.50,
ADD COLUMN IF NOT EXISTS delivery_larga_usd NUMERIC DEFAULT 3.50,
ADD COLUMN IF NOT EXISTS delivery_extralarga_usd NUMERIC DEFAULT 4.50;

COMMENT ON COLUMN public.configuracion_tienda.delivery_corta_usd IS 'Tarifa de delivery para Carrera Corta (0 a 3 km) en USD';
COMMENT ON COLUMN public.configuracion_tienda.delivery_media_usd IS 'Tarifa de delivery para Carrera Media (3 a 6 km) en USD';
COMMENT ON COLUMN public.configuracion_tienda.delivery_larga_usd IS 'Tarifa de delivery para Carrera Larga (6 a 9 km) en USD';
COMMENT ON COLUMN public.configuracion_tienda.delivery_extralarga_usd IS 'Tarifa de delivery para Carrera Extra Larga (9 a 12 km) en USD';

-- Actualizar la fila general si existe
UPDATE public.configuracion_tienda
SET delivery_corta_usd = 1.50,
    delivery_media_usd = 2.50,
    delivery_larga_usd = 3.50,
    delivery_extralarga_usd = 4.50,
    delivery_base_usd = 1.50,
    delivery_por_km_usd = 0.45,
    delivery_recargo_vehiculo_usd = 3.50
WHERE id = 'general';

