-- ============================================================================
-- MIGRACIÓN 5: CMS Extensible (Promos Grid, Categorías Rápidas y Cabecera de Catálogo)
-- ============================================================================

-- 1. Eliminar la restricción tipo_check para permitir nuevos slots de banners
ALTER TABLE public.banners DROP CONSTRAINT IF EXISTS banners_tipo_check;

-- 2. Insertar los 3 banners de la cuadrícula si no existen
INSERT INTO public.banners (tipo, titulo, subtitulo, badge_texto, boton_texto, boton_url, imagen_url, activo, orden)
VALUES 
  ('promo_1', 'Whiskies Escoceses', 'Buchanan''s, Old Parr, Chivas y Black Label al mejor precio oficial.', 'SELECCIÓN PREMIUM', 'Ver selección', '/catalogo/01/01', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80', true, 1),
  ('promo_2', 'Cervezas & Refrescos', 'Polar Pilsen, Solera, Corona y combos con hielo para tus celebraciones.', 'BEBIDAS BIEN FRÍAS', 'Ver cervezas frías', '/catalogo/09', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80', true, 2),
  ('promo_3', 'Víveres & Despensa', 'Harina P.A.N., arroz, aceites de oliva, salsas y productos esenciales para tu hogar.', 'DISPENSARIO Y HOGAR', 'Explorar víveres', '/catalogo/11', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', true, 3)
ON CONFLICT DO NOTHING;

-- 3. Crear tabla categorias_rapidas para la barra de 6 accesos
CREATE TABLE IF NOT EXISTS public.categorias_rapidas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  url TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'Wine',
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categorias_rapidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica categorias rapidas" ON public.categorias_rapidas;
CREATE POLICY "Lectura publica categorias rapidas" ON public.categorias_rapidas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gestiona categorias rapidas" ON public.categorias_rapidas;
CREATE POLICY "Admin gestiona categorias rapidas" ON public.categorias_rapidas FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 4. Agregar columnas para encabezado de catalogo en configuracion_tienda
ALTER TABLE public.configuracion_tienda 
  ADD COLUMN IF NOT EXISTS catalogo_titulo TEXT DEFAULT 'Catálogo Bodegón & Supermercado (Depósito 01)',
  ADD COLUMN IF NOT EXISTS catalogo_subtitulo TEXT DEFAULT 'Inventario en tiempo real sincronizado con precios oficiales en $ USD y Bs. BCV';
