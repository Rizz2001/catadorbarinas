-- ============================================================================
-- MIGRACIÓN 7: Métricas de Confianza (Trust Bar) personalizables en el CMS
-- ============================================================================

ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS seccion_confianza_activa BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS metricas_confianza JSONB DEFAULT '[
    {
      "figura": "< 45 min",
      "titulo": "Despacho Express en Barinas",
      "subtitulo": "Alto Barinas, Centro, Palma Sola y Varyná en motorizado o carga"
    },
    {
      "figura": "Tasa BCV",
      "titulo": "Cotización Bimonetaria Exacta",
      "subtitulo": "Precios sincronizados al día en Dólares ($ USD) y Bolívares"
    },
    {
      "figura": "Stock Garantizado",
      "titulo": "Inventario Real por Unidad o Caja",
      "subtitulo": "Licores con precinto oficial y víveres directo de nuestro almacén"
    },
    {
      "figura": "Bs. / $ USD",
      "titulo": "Pago Móvil, Zelle y Efectivo",
      "subtitulo": "Verificación inmediata y atención directa en nuestro Chat en Vivo"
    }
  ]'::jsonb;

