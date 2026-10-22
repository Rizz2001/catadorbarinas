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
