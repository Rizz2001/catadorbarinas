import { Product, DepartmentSlug } from '@/types';
import { IMAGE_FALLBACKS } from '@/constants/config';
import { resolveCategoryMetadata } from '@/constants/fallback-products';

/**
 * Contrato de datos crudos (Raw DTO) recibido desde la API de FoxData / SmartVentas.
 */
export interface RawFoxDataProductDto {
  codArticulo?: string;
  nombre?: string;
  codGrupo?: string;
  codSubgrupo?: string;
  unidadSimple?: string;
  unidadGrup?: string;
  impuestoV?: number;
  esAgrupado?: number;
  cantidadGrup?: number;
  precioDiv1?: number;
  precioVentDiv1?: number;
  precioDiv2?: number;
  precioVentDiv2?: number;
  precioDiv3?: number;
  precioVentDiv3?: number;
  precioDiv4?: number;
  precioVentDiv4?: number;
  precioDiv5?: number;
  precioVentDiv5?: number;
  precioDiv6?: number;
  precioVentDiv6?: number;
  precioDiv7?: number;
  precioVentDiv7?: number;
  precioDiv8?: number;
  precioVentDiv8?: number;
  precioGrupDiv1?: number;
  precioVentGrupDiv1?: number;
  suspendido?: number;
  imagenUrl?: string | null;
  smartVentas?: number;
  existencia?: number;
  marca?: string;
  // Campos heredados o alternativos
  id?: string | number;
  codigo?: string;
  sku?: string;
  descripcion?: string;
  name?: string;
  slug?: string;
  brand?: string;
  grupo?: string;
  subgrupo?: string;
  categoria?: string;
  departamento?: string;
  precio?: number | string;
  precio_usd?: number | string;
  precio_regular?: number | string;
  precio_regular_usd?: number | string;
  porcentaje_descuento?: number;
  stock?: number;
  deposito?: string | number;
  disponible?: boolean;
  calificacion?: number;
  rating?: number;
  opiniones?: number;
  reviews_count?: number;
  imagenes?: string[];
  fotos?: string[];
  images?: string[];
  unidad_medida?: string;
  unidad?: string;
  es_oferta_del_dia?: boolean;
  es_tendencia?: boolean;
  es_estrella?: boolean;
  fecha_fin_oferta?: string;
}

/**
 * Mapeo oficial de grupos SmartVentas a departamentos canónicos de Gran Catador
 */
function resolveDepartmentByGroup(codGrupo?: string): DepartmentSlug {
  switch (codGrupo) {
    case '01': // LICORES
    case '09': // CERVEZA
      return 'licores-vinos';
    case '02': // REFRESCOS
    case '03': // HIELOS
    case '08': // AGUA
      return 'bebidas-refrescos';
    case '05': // CONFITERIA
      return 'snacks-dulces';
    case '11': // ALIMENTOS
    case '14': // JUGO Y LACTEAS
      return 'viveres';
    default:
      return 'viveres';
  }
}

/**
 * ADAPTADOR OFICIAL FOXDATA
 * Transforma un producto crudo de FoxData a la interfaz canónica de producto de Gran Catador.
 */
export function adaptFoxDataProduct(
  raw: RawFoxDataProductDto,
  imagesMap?: Map<string, string>
): Product {
  // En SmartVentas / Saint, el precio de venta al detal en divisas de Bodegón está en precioVentDiv5
  const candidatePrices = [
    raw.precioVentDiv5,
    raw.precioVentDiv1,
    raw.precioVentDiv2,
    raw.precioVentDiv3,
    raw.precioVentDiv4,
    raw.precioVentDiv6,
    raw.precioDiv5,
    raw.precioDiv1,
    Number(raw.precio_usd ?? 0),
    Number(raw.precio ?? 0),
  ];
  const resolvedPrice = candidatePrices.find((p) => typeof p === 'number' && p > 0) ?? 0;
  const priceUsd = Number(resolvedPrice.toFixed(2));

  const rawOriginalPrice = raw.precio_regular_usd ?? raw.precio_regular;
  const originalPriceUsd = rawOriginalPrice ? Number(rawOriginalPrice) : undefined;

  const id = String(raw.codArticulo ?? raw.id ?? raw.codigo ?? raw.sku ?? Math.random().toString(36).substring(7));
  const sku = raw.sku ?? raw.codigo ?? `GC-${id.padStart(6, '0')}`;
  const rawCode = (raw.codArticulo ?? raw.sku ?? raw.codigo ?? id).trim();

  // Buscar imagen WebP cargada en el CMS por código de barras / SKU
  const cmsImage =
    imagesMap?.get(rawCode) ??
    imagesMap?.get(rawCode.toLowerCase()) ??
    (raw.codArticulo ? imagesMap?.get(raw.codArticulo.trim()) : undefined) ??
    (raw.sku ? imagesMap?.get(raw.sku.trim()) : undefined);

  // Sanitización de imágenes con prioridad a la imagen oficial subida en el CMS
  const imageSources = [
    cmsImage,
    raw.imagenUrl,
    ...(raw.imagenes ?? raw.fotos ?? raw.images ?? []),
  ].filter((img): img is string => typeof img === 'string' && img.trim() !== '');

  const images = imageSources.length > 0 ? imageSources : [IMAGE_FALLBACKS.product];

  const name = (raw.nombre ?? raw.descripcion ?? raw.name ?? 'Producto Gran Catador').trim();

  const slug =
    raw.slug ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const stock = Number(raw.existencia ?? raw.stock ?? 0);
  const isAvailable = raw.suspendido === 0 && stock > 0;
  const department = resolveDepartmentByGroup(raw.codGrupo);
  const { categoryLabel, searchKeywords } = resolveCategoryMetadata(raw.codGrupo, raw.codSubgrupo);

  const discountPercentage =
    raw.porcentaje_descuento ??
    (originalPriceUsd && originalPriceUsd > priceUsd
      ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
      : undefined);

  return {
    id,
    sku,
    name,
    slug,
    description: `${name} - ${categoryLabel} (${searchKeywords}) - Gran Catador Barinas`,
    brand: (raw.marca ?? raw.brand ?? categoryLabel.split('•')[0].trim() ?? 'Gran Catador').trim(),
    category: (raw.categoria ?? raw.grupo ?? categoryLabel).trim(),
    department,
    priceUsd: Math.max(0, priceUsd),
    originalPriceUsd: originalPriceUsd && originalPriceUsd > priceUsd ? originalPriceUsd : undefined,
    discountPercentage,
    inStock: raw.disponible ?? isAvailable,
    stockQuantity: stock,
    rating: Number(raw.calificacion ?? raw.rating ?? 4.9),
    reviewsCount: Number(raw.opiniones ?? raw.reviews_count ?? 18),
    images,
    unit: raw.unidadSimple ?? raw.unidad_medida ?? raw.unidad ?? 'Unidad',
    isDealOfTheDay: Boolean(raw.es_oferta_del_dia),
    dealEndsAt: raw.fecha_fin_oferta,
    isWeeklyTrend: Boolean(raw.es_tendencia),
    isStarProduct: Boolean(raw.es_estrella),
    codGrupo: raw.codGrupo,
    codSubgrupo: raw.codSubgrupo,
  };
}

/**
 * Transforma una lista de artículos de FoxData vinculándolos opcionalmente con existencias y fotos CMS
 */
export function adaptFoxDataProducts(
  rawList: RawFoxDataProductDto[],
  existenciasMap?: Map<string, number>,
  imagesMap?: Map<string, string>
): Product[] {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .filter((item) => item.suspendido !== 1)
    .map((item) => {
      const artId = item.codArticulo ?? String(item.id);
      const stock = existenciasMap?.has(artId) ? existenciasMap.get(artId) : item.existencia;
      return adaptFoxDataProduct({ ...item, existencia: stock }, imagesMap);
    })
    .sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    });
}
