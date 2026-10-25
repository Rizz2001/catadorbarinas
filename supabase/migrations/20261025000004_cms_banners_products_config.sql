-- ============================================================================
-- MIGRACIÓN 4: CMS COMPLETO (Banners, Configuración del Negocio e Imágenes de Productos)
-- ============================================================================

-- 1. TABLA: banners (Gestión de banners de cabecera y promociones)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  badge_texto TEXT DEFAULT 'DISTRIBUIDORA & BODEGÓN OFICIAL',
  boton_texto TEXT NOT NULL DEFAULT 'Ver Ofertas del Día',
  boton_url TEXT NOT NULL DEFAULT '/catalogo',
  imagen_url TEXT,
  tipo TEXT NOT NULL DEFAULT 'hero' CHECK (tipo IN ('hero', 'promocion_grid', 'secundario')),
  promo_titulo TEXT DEFAULT 'COMBO PARRILLERO & WHISKY',
  promo_precio NUMERIC(10,2) DEFAULT 49.99,
  promo_badge TEXT DEFAULT 'Edición Limitada',
  promo_ahorro TEXT DEFAULT 'Ahorra hasta 25% hoy',
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insertar Banner Hero inicial por defecto si está vacía
INSERT INTO public.banners (
  titulo, subtitulo, badge_texto, boton_texto, boton_url, tipo,
  promo_titulo, promo_precio, promo_badge, promo_ahorro, activo, orden
)
SELECT
  'Los Mejores Licores y Víveres Directo a tu Puerta',
  'Catálogo completo con precios duales en Dólares ($ USD) y Bolívares (Bs. BCV). Despachos rápidos en toda la ciudad de Barinas.',
  'DISTRIBUIDORA & BODEGÓN OFICIAL',
  'Ver Ofertas del Día',
  '/catalogo',
  'hero',
  'COMBO PARRILLERO & WHISKY',
  49.99,
  'Edición Limitada',
  'Ahorra hasta 25% hoy',
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.banners WHERE tipo = 'hero');

-- 2. TABLA: configuracion_tienda (Datos globales del negocio)
CREATE TABLE IF NOT EXISTS public.configuracion_tienda (
  id TEXT PRIMARY KEY DEFAULT 'general',
  nombre_tienda TEXT NOT NULL DEFAULT 'Gran Catador',
  razon_social TEXT NOT NULL DEFAULT 'Distribuidora Bodegón del Catador C.A.',
  rif TEXT NOT NULL DEFAULT 'J-50123456-7',
  telefono_atencion TEXT NOT NULL DEFAULT '+58 414-0000000',
  direccion_fisica TEXT NOT NULL DEFAULT 'Av. Alberto Arvelo Torrealba, Barinas, Edo. Barinas',
  horario_despacho TEXT NOT NULL DEFAULT 'Lunes a Domingo: 8:00 AM - 9:00 PM',
  delivery_base_usd NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  delivery_gratis_minimo_usd NUMERIC(10,2) NOT NULL DEFAULT 30.00,
  pago_movil_banco TEXT NOT NULL DEFAULT 'Banesco (0134)',
  pago_movil_telefono TEXT NOT NULL DEFAULT '0414-0000000',
  pago_movil_cedula TEXT NOT NULL DEFAULT 'J-50123456-7',
  zelle_email TEXT NOT NULL DEFAULT 'pagos@grancatador.com',
  zelle_titular TEXT NOT NULL DEFAULT 'Gran Catador LLC',
  bcv_tasa_manual NUMERIC(12,4),
  bcv_usar_manual BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT DEFAULT '/logo-catador.svg',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insertar configuración por defecto si no existe
INSERT INTO public.configuracion_tienda (id)
VALUES ('general')
ON CONFLICT (id) DO NOTHING;

-- 3. TABLA: producto_imagenes (Mapeo de Código de Barras / SKU -> Imagen WebP)
CREATE TABLE IF NOT EXISTS public.producto_imagenes (
  codigo_articulo TEXT PRIMARY KEY,
  nombre_articulo TEXT,
  imagen_url TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  formato TEXT DEFAULT 'webp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_imagenes ENABLE ROW LEVEL SECURITY;

-- Políticas para banners: Lectura pública, modificación sólo admin
CREATE POLICY "Lectura publica de banners" ON public.banners
  FOR SELECT USING (true);

CREATE POLICY "Admin gestiona banners" ON public.banners
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Políticas para configuracion_tienda: Lectura pública, modificación sólo admin
CREATE POLICY "Lectura publica de configuracion" ON public.configuracion_tienda
  FOR SELECT USING (true);

CREATE POLICY "Admin gestiona configuracion" ON public.configuracion_tienda
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Políticas para producto_imagenes: Lectura pública, modificación sólo admin
CREATE POLICY "Lectura publica de imagenes de producto" ON public.producto_imagenes
  FOR SELECT USING (true);

CREATE POLICY "Admin gestiona imagenes de producto" ON public.producto_imagenes
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ============================================================================
-- STORAGE POLICIES PARA BUCKET 'products'
-- ============================================================================
-- Asegurar que el bucket sea público
UPDATE storage.buckets SET public = true WHERE id = 'products';

DROP POLICY IF EXISTS "Acceso publico de lectura a products" ON storage.objects;
CREATE POLICY "Acceso publico de lectura a products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin puede subir productos" ON storage.objects;
CREATE POLICY "Admin puede subir productos" ON storage.objects
  FOR ALL USING (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'service_role' OR auth.uid() IS NOT NULL));
