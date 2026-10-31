/**
 * Tipos de dominio para Gran Catador / Bodegón del Catador
 * Estricto cumplimiento: Cero uso de 'any'.
 */

export type DepartmentSlug =
  | 'licores-vinos'
  | 'viveres'
  | 'charcuteria-quesos'
  | 'carniceria'
  | 'snacks-dulces'
  | 'bebidas-refrescos'
  | 'cuidado-personal'
  | 'hogar-limpieza';

export interface Category {
  id: string;
  name: string;
  slug: DepartmentSlug | string;
  icon?: string;
  itemCount?: number;
  featured?: boolean;
}

export type SaleMode = 'ambos' | 'solo_unidad' | 'solo_caja';
export type PurchaseMode = 'unidad' | 'caja';
export type TrendCategoryTab = 'mas_vendidos' | 'ofertas' | 'nuevos';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  department: DepartmentSlug;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage?: number;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  unit: string; // ej: "Botella 750ml", "Kg", "Unidad", "Pack 6x"
  // Datos de venta por caja / bulto e inventario unificado
  saleMode?: SaleMode; // 'ambos' | 'solo_unidad' | 'solo_caja'
  unitsPerBox?: number; // ej. 12, 24, 36
  boxPriceUsd?: number; // Precio por caja en USD
  boxUnitLabel?: string; // ej. "CAJA", "BULTO", "PACK"
  allowBackorder?: boolean; // Permitir vender sin stock (global o por producto)
  hiddenFromStore?: boolean; // Ocultar aunque tenga existencia
  trendTab?: TrendCategoryTab;
  isDealOfTheDay?: boolean;
  dealEndsAt?: string; // ISO date string
  isWeeklyTrend?: boolean;
  isStarProduct?: boolean; // Para el producto destacado central del Bento Grid
  codGrupo?: string;
  codSubgrupo?: string;
  badges?: string[];
  attributes?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  purchaseMode?: PurchaseMode; // 'unidad' (por defecto) o 'caja'
}

export interface BcvRateInfo {
  rate: number;
  lastUpdated: string;
  source: 'BCV' | 'Oficial';
  changePercentage?: number;
}

export interface DualPriceResult {
  usdFormatted: string;   // e.g. "$1,250.50"
  vesFormatted: string;   // e.g. "Bs. 54.521,75"
  priceUsd: number;
  priceVes: number;
  bcvRate: number;
  savingsUsdFormatted?: string;
  savingsVesFormatted?: string;
}

export interface CartTotals {
  subtotalUsd: number;
  subtotalVes: number;
  discountUsd: number;
  discountVes: number;
  shippingUsd: number;
  shippingVes: number;
  totalUsd: number;
  totalVes: number;
  itemCount: number;
}

export type BannerType = 'hero' | 'promo_1' | 'promo_2' | 'promo_3' | 'promocion_grid' | 'secundario' | string;

export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string | null;
  badge_texto?: string | null;
  boton_texto: string;
  boton_url: string;
  imagen_url?: string | null;
  tipo: BannerType;
  promo_titulo?: string | null;
  promo_precio?: number | null;
  promo_badge?: string | null;
  promo_ahorro?: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuickCategory {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  icono: string;
  orden: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StoreConfig {
  id: string;
  nombre_tienda: string;
  razon_social: string;
  rif: string;
  telefono_atencion: string;
  direccion_fisica: string;
  horario_despacho: string;
  delivery_base_usd: number;
  delivery_gratis_minimo_usd: number;
  pago_movil_banco: string;
  pago_movil_telefono: string;
  pago_movil_cedula: string;
  zelle_email: string;
  zelle_titular: string;
  bcv_tasa_manual?: number | null;
  bcv_usar_manual: boolean;
  logo_url?: string | null;
  logo_alto_px?: number | null;
  logo_ancho_px?: number | null;
  catalogo_titulo?: string | null;
  catalogo_subtitulo?: string | null;
  permitir_venta_sin_stock_global?: boolean;
  tienda_lat?: number;
  tienda_lng?: number;
  delivery_por_km_usd?: number;
  delivery_max_cajas_motorizado?: number;
  delivery_max_unidades_motorizado?: number;
  delivery_recargo_vehiculo_usd?: number;
  seccion_tendencias_activa?: boolean;
  seccion_tendencias_titulo?: string | null;
  seccion_tendencias_subtitulo?: string | null;
  seccion_ofertas_activa?: boolean;
  seccion_ofertas_titulo?: string | null;
  seccion_aliados_activa?: boolean;
  seccion_aliados_titulo?: string | null;
  updated_at?: string;
}

export interface ProductCmsConfig {
  cod_articulo: string;
  nombre_referencia?: string | null;
  modalidad_venta: SaleMode;
  unidades_por_caja_custom?: number | null;
  precio_caja_usd_custom?: number | null;
  permitir_venta_sin_stock?: boolean | null;
  oculto_en_web: boolean;
  descripcion_custom?: string | null;
  es_tendencia: boolean;
  categoria_tendencia: TrendCategoryTab;
  es_oferta_destacada: boolean;
  precio_oferta_usd?: number | null;
  porcentaje_descuento_custom?: number | null;
  updated_at?: string;
}

export interface AlliedBrand {
  id: string;
  nombre: string;
  logo_url?: string | null;
  categoria_tag: string;
  url_destino: string;
  color_acento: string;
  orden: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SearchLogEntry {
  id: string;
  termino: string;
  termino_normalizado: string;
  resultados_count: number;
  usuario_id?: string | null;
  usuario_nombre?: string | null;
  usuario_email?: string | null;
  departamento_filtro?: string | null;
  created_at: string;
}

export interface FaqItem {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
  created_at?: string;
}

export interface DeliveryQuoteResult {
  distanceKm: number;
  transportType: 'motorizado' | 'vehiculo_carga' | 'pickup';
  shippingUsd: number;
  baseFeeUsd: number;
  distanceFeeUsd: number;
  heavyLoadSurchargeUsd: number;
  isFreeShipping: boolean;
  totalBoxesEquivalent: number;
  totalUnitsEquivalent: number;
  reasonText: string;
}

export interface ProductImageMapping {
  codigo_articulo: string;
  nombre_articulo?: string | null;
  imagen_url: string;
  nombre_archivo: string;
  formato?: string;
  created_at?: string;
  updated_at?: string;
}

export * from './supabase';

