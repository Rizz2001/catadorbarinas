-- ============================================================================
-- MIGRACIÓN 8: Campos editables en CMS para el Footer
-- ============================================================================

ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS footer_descripcion TEXT DEFAULT 'Distribuidora y bodegón en Barinas con venta al detal por unidad y al mayor por caja cerrada con despacho express.',
  ADD COLUMN IF NOT EXISTS footer_transparencia_texto TEXT DEFAULT 'Todos nuestros precios están expresados en Dólares ($ USD) y Bolívares (Bs. / VES) calculados a la tasa oficial vigente del Banco Central de Venezuela (BCV).',
  ADD COLUMN IF NOT EXISTS footer_subdireccion TEXT DEFAULT 'Av. 23 de Enero • Barinas, Estado Barinas, Venezuela',
  ADD COLUMN IF NOT EXISTS footer_garantias JSONB DEFAULT '[
    {
      "figura": "Gratis desde $30",
      "titulo": "Delivery en Barinas",
      "subtitulo": "Cotización automática por GPS y volumen"
    },
    {
      "figura": "100% Original",
      "titulo": "Precinto Oficial",
      "subtitulo": "Licores importados y despensa garantizada"
    },
    {
      "figura": "Bs. BCV / $ USD",
      "titulo": "Pagos Bimonetarios",
      "subtitulo": "Pago Móvil, Zelle y Efectivo Divisas"
    },
    {
      "figura": "Sala en Vivo",
      "titulo": "Atención Directa",
      "subtitulo": "Chat en tiempo real en cada pedido"
    }
  ]'::jsonb;

