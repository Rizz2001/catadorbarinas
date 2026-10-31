import { Product } from '@/types';
import { fetchArticulosSmartVentas } from './foxdata.service';

/**
 * Obtiene los productos reales del catálogo SmartVentas con stock en Bodegón (Depósito 01)
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await fetchArticulosSmartVentas('01');
    return products.filter((p) => p.priceUsd > 0);
  } catch (err) {
    console.error('Error cargando productos de SmartVentas:', err);
    return [];
  }
}

/**
 * Deriva las Ofertas Destacadas en memoria dando prioridad absoluta a los productos fijados en el CMS ("2. Ofertas")
 */
export function deriveFeaturedDeals(all: Product[]): Product[] {
  const cmsPinned = all.filter((p) => p.isDealOfTheDay);
  const inStock = all.filter((p) => p.inStock && !p.isDealOfTheDay);
  const combined = [...cmsPinned, ...(inStock.length >= 6 ? inStock : all.filter((p) => !p.isDealOfTheDay))];

  return combined.slice(0, 6).map((p, idx) => ({
    ...p,
    isDealOfTheDay: true,
    discountPercentage: p.discountPercentage || (idx % 2 === 0 ? 15 : 10),
    originalPriceUsd: p.originalPriceUsd || Number((p.priceUsd * 1.15).toFixed(2)),
  }));
}

/**
 * Deriva las Tendencias de la Semana en memoria dando prioridad a los productos fijados en el CMS ("1. Tendencias")
 */
export function deriveWeeklyTrends(all: Product[]): Product[] {
  const cmsPinned = all.filter((p) => p.isWeeklyTrend);
  const inStock = all.filter((p) => p.inStock && !p.isWeeklyTrend);
  const combined = [...cmsPinned, ...(inStock.length >= 8 ? inStock : all.filter((p) => !p.isWeeklyTrend))];

  return combined.slice(0, 12).map((p, idx) => ({
    ...p,
    isWeeklyTrend: true,
    discountPercentage: p.discountPercentage ?? (idx % 3 === 0 ? 10 : undefined),
    originalPriceUsd:
      p.originalPriceUsd ?? (idx % 3 === 0 ? Number((p.priceUsd * 1.1).toFixed(2)) : undefined),
  }));
}

/**
 * Deriva el Producto Estrella en memoria
 */
export function deriveStarProduct(all: Product[]): Product | undefined {
  const inStock = all.filter((p) => p.inStock && p.priceUsd > 20);
  const star = inStock[0] || all[0];
  if (!star) return undefined;
  return {
    ...star,
    isStarProduct: true,
  };
}

/**
 * Ofertas Destacadas basadas en productos reales de SmartVentas con stock
 */
export async function getFeaturedDeals(): Promise<Product[]> {
  const all = await getAllProducts();
  return deriveFeaturedDeals(all);
}

/**
 * Tendencias de la Semana basadas en productos reales de SmartVentas
 */
export async function getWeeklyTrends(): Promise<Product[]> {
  const all = await getAllProducts();
  return deriveWeeklyTrends(all);
}

/**
 * Producto Estrella basado en el inventario real de Bodegón
 */
export async function getStarProduct(): Promise<Product | undefined> {
  const all = await getAllProducts();
  return deriveStarProduct(all);
}
