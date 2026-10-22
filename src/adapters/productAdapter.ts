import { Product, DepartmentSlug } from '@/types';
import { IMAGE_FALLBACKS } from '@/constants/config';

/**
 * DTO crudo recibido desde una API externa o servicio headless.
 */
export interface RawProductDto {
  id: string | number;
  sku?: string;
  nombre?: string;
  name?: string;
  slug?: string;
  descripcion?: string;
  description?: string;
  marca?: string;
  brand?: string;
  categoria?: string;
  category?: string;
  departamento?: string;
  department?: string;
  precio_usd?: number | string;
  price_usd?: number | string;
  precio_regular_usd?: number | string;
  original_price_usd?: number | string;
  porcentaje_descuento?: number;
  stock?: number;
  disponible?: boolean;
  calificacion?: number;
  rating?: number;
  opiniones?: number;
  reviews_count?: number;
  imagenes?: string[];
  images?: string[];
  unidad?: string;
  unit?: string;
  es_oferta_del_dia?: boolean;
  es_tendencia?: boolean;
  es_producto_estrella?: boolean;
  fecha_fin_oferta?: string;
}

/**
 * ADAPTADOR DE PRODUCTO
 * Transforma, limpia y asigna fallbacks a la entidad de dominio estricta.
 */
export function adaptProduct(raw: RawProductDto): Product {
  const priceUsd = Number(raw.precio_usd ?? raw.price_usd ?? 0);
  const originalPriceUsd = raw.precio_regular_usd ?? raw.original_price_usd
    ? Number(raw.precio_regular_usd ?? raw.original_price_usd)
    : undefined;

  const rawImages = raw.imagenes ?? raw.images ?? [];
  const sanitizedImages =
    rawImages.length > 0 && rawImages[0]?.trim() !== ''
      ? rawImages
      : [IMAGE_FALLBACKS.product];

  const defaultDepartment: DepartmentSlug = 'licores-vinos';
  const department = (raw.departamento ?? raw.department ?? defaultDepartment) as DepartmentSlug;

  return {
    id: String(raw.id),
    sku: raw.sku ?? `GC-${String(raw.id).padStart(4, '0')}`,
    name: raw.nombre ?? raw.name ?? 'Producto Gran Catador',
    slug: raw.slug ?? (raw.nombre ?? raw.name ?? 'producto').toLowerCase().replace(/\s+/g, '-'),
    description: raw.descripcion ?? raw.description ?? '',
    brand: raw.marca ?? raw.brand ?? 'Gran Catador',
    category: raw.categoria ?? raw.category ?? 'General',
    department,
    priceUsd: Math.max(0, priceUsd),
    originalPriceUsd: originalPriceUsd && originalPriceUsd > priceUsd ? originalPriceUsd : undefined,
    discountPercentage:
      raw.porcentaje_descuento ??
      (originalPriceUsd && originalPriceUsd > priceUsd
        ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
        : undefined),
    inStock: raw.disponible ?? (raw.stock !== undefined ? raw.stock > 0 : true),
    stockQuantity: raw.stock ?? 10,
    rating: Number(raw.calificacion ?? raw.rating ?? 5.0),
    reviewsCount: Number(raw.opiniones ?? raw.reviews_count ?? 12),
    images: sanitizedImages,
    unit: raw.unidad ?? raw.unit ?? 'Unidad',
    isDealOfTheDay: Boolean(raw.es_oferta_del_dia),
    dealEndsAt: raw.fecha_fin_oferta,
    isWeeklyTrend: Boolean(raw.es_tendencia),
    isStarProduct: Boolean(raw.es_producto_estrella),
  };
}

export function adaptProducts(rawList: RawProductDto[]): Product[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptProduct);
}
