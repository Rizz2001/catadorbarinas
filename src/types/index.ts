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
  updated_at?: string;
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

