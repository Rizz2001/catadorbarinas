-- ============================================================================
-- MIGRACIÓN 6: Evolución Comercial, Logística GPS/Volumen, CMS de Productos,
-- Marcas Aliadas, Inteligencia de Búsquedas y Preguntas Frecuentes
-- ============================================================================

-- 1. TABLA: productos_config_cms (Configuración comercial por artículo)
CREATE TABLE IF NOT EXISTS public.productos_config_cms (
  cod_articulo TEXT PRIMARY KEY,
  nombre_referencia TEXT,
  modalidad_venta TEXT NOT NULL DEFAULT 'ambos' CHECK (modalidad_venta IN ('ambos', 'solo_unidad', 'solo_caja')),
  unidades_por_caja_custom INTEGER,
  precio_caja_usd_custom NUMERIC(10,2),
  permitir_venta_sin_stock BOOLEAN,
  oculto_en_web BOOLEAN NOT NULL DEFAULT false,
  descripcion_custom TEXT,
  es_tendencia BOOLEAN NOT NULL DEFAULT false,
  categoria_tendencia TEXT NOT NULL DEFAULT 'mas_vendidos' CHECK (categoria_tendencia IN ('mas_vendidos', 'ofertas', 'nuevos')),
  es_oferta_destacada BOOLEAN NOT NULL DEFAULT false,
  precio_oferta_usd NUMERIC(10,2),
  porcentaje_descuento_custom INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.productos_config_cms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de config de productos" ON public.productos_config_cms;
CREATE POLICY "Lectura publica de config de productos" ON public.productos_config_cms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gestiona config de productos" ON public.productos_config_cms;
CREATE POLICY "Admin gestiona config de productos" ON public.productos_config_cms
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 2. NUEVAS COLUMNAS EN configuracion_tienda (Sin Stock Global, Delivery GPS/Volumen y Secciones de Inicio)
ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS permitir_venta_sin_stock_global BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tienda_lat NUMERIC(10,6) NOT NULL DEFAULT 8.622600,
  ADD COLUMN IF NOT EXISTS tienda_lng NUMERIC(10,6) NOT NULL DEFAULT -70.207500,
  ADD COLUMN IF NOT EXISTS delivery_por_km_usd NUMERIC(10,2) NOT NULL DEFAULT 0.45,
  ADD COLUMN IF NOT EXISTS delivery_max_cajas_motorizado INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS delivery_max_unidades_motorizado INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS delivery_recargo_vehiculo_usd NUMERIC(10,2) NOT NULL DEFAULT 3.50,
  ADD COLUMN IF NOT EXISTS seccion_tendencias_activa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seccion_tendencias_titulo TEXT DEFAULT 'Tendencias de la Semana',
  ADD COLUMN IF NOT EXISTS seccion_tendencias_subtitulo TEXT DEFAULT 'Los productos más pedidos en Barinas con precios duales en tiempo real',
  ADD COLUMN IF NOT EXISTS seccion_ofertas_activa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seccion_ofertas_titulo TEXT DEFAULT 'Ofertas Relámpago del Día',
  ADD COLUMN IF NOT EXISTS seccion_aliados_activa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seccion_aliados_titulo TEXT DEFAULT 'Empresas y Marcas Aliadas Oficiales';

-- 3. TABLA: marcas_aliadas (Sección de logotipos de empresas aliadas comerciales)
CREATE TABLE IF NOT EXISTS public.marcas_aliadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  logo_url TEXT,
  categoria_tag TEXT NOT NULL DEFAULT 'Aliado Comercial',
  url_destino TEXT NOT NULL DEFAULT '/catalogo',
  color_acento TEXT NOT NULL DEFAULT '#00227B',
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.marcas_aliadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de marcas aliadas" ON public.marcas_aliadas;
CREATE POLICY "Lectura publica de marcas aliadas" ON public.marcas_aliadas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gestiona marcas aliadas" ON public.marcas_aliadas;
CREATE POLICY "Admin gestiona marcas aliadas" ON public.marcas_aliadas
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Poblar marcas aliadas iniciales si la tabla está vacía
INSERT INTO public.marcas_aliadas (nombre, categoria_tag, url_destino, color_acento, orden, activo)
SELECT * FROM (VALUES
  ('Empresas Polar', 'Cervecería & Alimentos', '/buscar?q=Polar', '#00227B', 1, true),
  ('Ron Santa Teresa', 'Destilados Premium', '/buscar?q=Santa+Teresa', '#B45309', 2, true),
  ('Diageo (Buchanan''s / Old Parr)', 'Whiskies Escoceses', '/catalogo/01/01', '#1E293B', 3, true),
  ('Coca-Cola FEMSA', 'Refrescos & Bebidas', '/catalogo/02', '#DC2626', 4, true),
  ('Pepsi-Cola & Minalba', 'Aguas & Refrescos', '/catalogo/08', '#1D4ED8', 5, true),
  ('Ron Diplomático', 'Rones de Colección', '/buscar?q=Diplomatico', '#065F46', 6, true),
  ('Alimentos Mary & Primor', 'Víveres & Despensa', '/catalogo/11', '#E07A1F', 7, true),
  ('Ron Carúpano', 'Destilados de Oriente', '/buscar?q=Carupano', '#0F172A', 8, true)
) AS v(nombre, categoria_tag, url_destino, color_acento, orden, activo)
WHERE NOT EXISTS (SELECT 1 FROM public.marcas_aliadas LIMIT 1);

-- 4. TABLA: historial_busquedas (Inteligencia de búsquedas de usuarios registrados y visitantes)
CREATE TABLE IF NOT EXISTS public.historial_busquedas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termino TEXT NOT NULL,
  termino_normalizado TEXT NOT NULL,
  resultados_count INTEGER NOT NULL DEFAULT 0,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_nombre TEXT,
  usuario_email TEXT,
  departamento_filtro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_historial_busquedas_termino ON public.historial_busquedas (termino_normalizado);
CREATE INDEX IF NOT EXISTS idx_historial_busquedas_created ON public.historial_busquedas (created_at DESC);

ALTER TABLE public.historial_busquedas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insercion publica de busquedas" ON public.historial_busquedas;
CREATE POLICY "Insercion publica de busquedas" ON public.historial_busquedas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin lee y gestiona busquedas" ON public.historial_busquedas;
CREATE POLICY "Admin lee y gestiona busquedas" ON public.historial_busquedas
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- 5. TABLA: preguntas_frecuentes (Centro de Ayuda y FAQ administrable)
CREATE TABLE IF NOT EXISTS public.preguntas_frecuentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL DEFAULT 'Compras y Precios',
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.preguntas_frecuentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de FAQ" ON public.preguntas_frecuentes;
CREATE POLICY "Lectura publica de FAQ" ON public.preguntas_frecuentes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gestiona FAQ" ON public.preguntas_frecuentes;
CREATE POLICY "Admin gestiona FAQ" ON public.preguntas_frecuentes
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

INSERT INTO public.preguntas_frecuentes (categoria, pregunta, respuesta, orden, activo)
SELECT * FROM (VALUES
  ('Compras por Unidad y Caja', '¿Puedo comprar productos tanto por unidad como por caja cerrada?', 'Sí. En cada producto habilitado verás el selector para elegir entre compra Por Unidad o Por Caja/Bulto cerrado. Nuestro sistema verifica en tiempo real la existencia exacta de botellas/unidades en nuestro Depósito 01 para garantizar que tu pedido esté 100% disponible.', 1, true),
  ('Compras por Unidad y Caja', '¿Qué pasa si quiero pedir 3 cajas pero en inventario hay menos unidades?', 'Nuestro motor de inventario inteligente calcula automáticamente las unidades totales requeridas (Cajas × Unidades por Caja). Si en almacén quedan menos unidades de las necesarias para completar las cajas solicitadas, el sistema te mostrará el máximo exacto disponible para evitar cualquier error de facturación.', 2, true),
  ('Pagos y Tasa BCV', '¿Qué tasa de cambio utilizan para pagos en Bolívares?', 'Todos los precios en Bolívares (Bs.) están sincronizados automáticamente con la tasa oficial vigente del Banco Central de Venezuela (BCV). Puedes pagar por Pago Móvil, Transferencia, Zelle o Efectivo USD.', 3, true),
  ('Delivery y Ubicación GPS', '¿Cómo se calcula el costo del delivery en Barinas?', 'Al finalizar tu compra puedes pulsar el botón "Detectar mi ubicación GPS" o elegir tu zona en Barinas. El sistema cotiza al instante según la distancia y el volumen del pedido: si tu compra es ligera se despacha en Motorizado Express, y si incluye varias cajas o carga pesada se asigna automáticamente un Vehículo de Carga.', 4, true),
  ('Retiro Pick-Up y Horarios', '¿Puedo retirar mi pedido personalmente en el Bodegón?', 'Por supuesto. Selecciona la opción "Retiro Pick-Up en Sede" sin costo de envío. Preparamos tu pedido de inmediato para que solo pases a retirarlo en nuestra sede en Barinas.', 5, true)
) AS v(categoria, pregunta, respuesta, orden, activo)
WHERE NOT EXISTS (SELECT 1 FROM public.preguntas_frecuentes LIMIT 1);

-- 6. COLUMNAS DE TRAZABILIDAD EN pedidos Y pedido_items (GPS, Transporte y Presentación Caja/Unidad)
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS latitud_entrega NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS longitud_entrega NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS distancia_km NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS tipo_transporte TEXT DEFAULT 'motorizado';

ALTER TABLE public.pedido_items
  ADD COLUMN IF NOT EXISTS modalidad_compra TEXT DEFAULT 'unidad',
  ADD COLUMN IF NOT EXISTS unidades_por_caja INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unidades_totales_descontadas INTEGER DEFAULT 1;

