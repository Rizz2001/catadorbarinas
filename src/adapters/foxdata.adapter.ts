import { Product, DepartmentSlug, ProductCmsConfig } from '@/types';
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
 * Transforma un producto crudo de FoxData a la interfaz canónica de producto de Gran Catador,
 * fusionando las reglas comerciales configuradas en el CMS (Unidad/Caja, Sin Stock, Ocultar, Descripción, Ofertas).
 */
export function adaptFoxDataProduct(
  raw: RawFoxDataProductDto,
  imagesMap?: Map<string, string>,
  cmsConfigMap?: Map<string, ProductCmsConfig>,
  globalAllowBackorder = false
): Product {
  const id = String(raw.codArticulo ?? raw.id ?? raw.codigo ?? raw.sku ?? Math.random().toString(36).substring(7));
  const sku = raw.sku ?? raw.codigo ?? `GC-${id.padStart(6, '0')}`;
  const rawCode = (raw.codArticulo ?? raw.sku ?? raw.codigo ?? id).trim();

  const cmsConfig =
    cmsConfigMap?.get(rawCode) ??
    cmsConfigMap?.get(rawCode.toLowerCase()) ??
    cmsConfigMap?.get(id);

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
  const resolvedBasePrice = candidatePrices.find((p) => typeof p === 'number' && p > 0) ?? 0;
  const basePriceUsd = Number(resolvedBasePrice.toFixed(2));

  // Si tiene precio de oferta en CMS o porcentaje de descuento en CMS, se aplica
  let priceUsd = basePriceUsd;
  let originalPriceUsd = raw.precio_regular_usd ?? raw.precio_regular
    ? Number(raw.precio_regular_usd ?? raw.precio_regular)
    : undefined;

  if (cmsConfig?.precio_oferta_usd && Number(cmsConfig.precio_oferta_usd) > 0 && Number(cmsConfig.precio_oferta_usd) < basePriceUsd) {
    priceUsd = Number(Number(cmsConfig.precio_oferta_usd).toFixed(2));
    originalPriceUsd = basePriceUsd;
  } else if (cmsConfig?.porcentaje_descuento_custom && cmsConfig.porcentaje_descuento_custom > 0 && cmsConfig.porcentaje_descuento_custom < 100) {
    originalPriceUsd = basePriceUsd;
    priceUsd = Number((basePriceUsd * (1 - cmsConfig.porcentaje_descuento_custom / 100)).toFixed(2));
  }

  // Configuración de Caja / Bulto
  const defaultBoxSize = raw.codGrupo === '09' ? 24 : 12;
  const foxBoxUnits = raw.cantidadGrup && raw.cantidadGrup > 1 ? Math.round(raw.cantidadGrup) : defaultBoxSize;
  const unitsPerBox =
    cmsConfig?.unidades_por_caja_custom && cmsConfig.unidades_por_caja_custom > 1
      ? Math.round(cmsConfig.unidades_por_caja_custom)
      : foxBoxUnits;

  const foxBoxPrice =
    raw.precioVentGrupDiv1 && raw.precioVentGrupDiv1 > priceUsd
      ? Number(raw.precioVentGrupDiv1.toFixed(2))
      : Number((priceUsd * unitsPerBox).toFixed(2));

  const boxPriceUsd =
    cmsConfig?.precio_caja_usd_custom && Number(cmsConfig.precio_caja_usd_custom) > 0
      ? Number(Number(cmsConfig.precio_caja_usd_custom).toFixed(2))
      : foxBoxPrice;

  const saleMode = cmsConfig?.modalidad_venta ?? 'ambos';
  const boxUnitLabel = (raw.unidadGrup && raw.unidadGrup.trim() !== '' ? raw.unidadGrup.trim() : 'CAJA');

  // Buscar imagen WebP cargada en el CMS por código de barras / SKU
  const cmsImage =
    imagesMap?.get(rawCode) ??
    imagesMap?.get(rawCode.toLowerCase()) ??
    (raw.codArticulo ? imagesMap?.get(raw.codArticulo.trim()) : undefined) ??
    (raw.sku ? imagesMap?.get(raw.sku.trim()) : undefined);

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

  const stock = Math.max(0, Math.floor(Number(raw.existencia ?? raw.stock ?? 0)));
  const allowBackorder =
    typeof cmsConfig?.permitir_venta_sin_stock === 'boolean'
      ? cmsConfig.permitir_venta_sin_stock
      : Boolean(globalAllowBackorder);

  // Si es solo_caja y no permite backorder, requiere al menos unitsPerBox en stock para estar disponible
  const minRequiredStock = saleMode === 'solo_caja' ? unitsPerBox : 1;
  const isAvailable = raw.suspendido === 0 && (stock >= minRequiredStock || allowBackorder);

  const department = resolveDepartmentByGroup(raw.codGrupo);
  const { categoryLabel, searchKeywords } = resolveCategoryMetadata(raw.codGrupo, raw.codSubgrupo);

  const discountPercentage =
    cmsConfig?.porcentaje_descuento_custom ??
    raw.porcentaje_descuento ??
    (originalPriceUsd && originalPriceUsd > priceUsd
      ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
      : undefined);

  const customDesc = cmsConfig?.descripcion_custom?.trim();
  const description =
    customDesc && customDesc.length > 0
      ? customDesc
      : `${name} • ${categoryLabel} (${searchKeywords}) • Disponible por unidad o caja en Gran Catador Barinas.`;

  return {
    id,
    sku,
    name,
    slug,
    description,
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
    saleMode,
    unitsPerBox,
    boxPriceUsd,
    boxUnitLabel,
    allowBackorder,
    hiddenFromStore: Boolean(cmsConfig?.oculto_en_web),
    trendTab: cmsConfig?.categoria_tendencia ?? 'mas_vendidos',
    isDealOfTheDay: Boolean(cmsConfig?.es_oferta_destacada ?? raw.es_oferta_del_dia),
    dealEndsAt: raw.fecha_fin_oferta,
    isWeeklyTrend: Boolean(cmsConfig?.es_tendencia ?? raw.es_tendencia),
    isStarProduct: Boolean(raw.es_estrella),
    codGrupo: raw.codGrupo,
    codSubgrupo: raw.codSubgrupo,
  };
}

/**
 * Transforma una lista de artículos de FoxData vinculándolos con existencias, fotos y reglas CMS
 */
export function adaptFoxDataProducts(
  rawList: RawFoxDataProductDto[],
  existenciasMap?: Map<string, number>,
  imagesMap?: Map<string, string>,
  cmsConfigMap?: Map<string, ProductCmsConfig>,
  globalAllowBackorder = false,
  includeHidden = false
): Product[] {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .filter((item) => item.suspendido !== 1)
    .map((item) => {
      const artId = item.codArticulo ?? String(item.id);
      const stock = existenciasMap?.has(artId) ? existenciasMap.get(artId) : item.existencia;
      return adaptFoxDataProduct(
        { ...item, existencia: stock },
        imagesMap,
        cmsConfigMap,
        globalAllowBackorder
      );
    })
    .filter((p) => (includeHidden ? true : !p.hiddenFromStore))
    .sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    });
}
