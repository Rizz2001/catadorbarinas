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
 * Ofertas Destacadas basadas en productos reales de SmartVentas con stock
 */
export async function getFeaturedDeals(): Promise<Product[]> {
  const all = await getAllProducts();
  const inStock = all.filter((p) => p.inStock);
  const candidates = inStock.length >= 6 ? inStock : all;
  return candidates.slice(0, 6).map((p, idx) => ({
    ...p,
    isDealOfTheDay: true,
    discountPercentage: p.discountPercentage || (idx % 2 === 0 ? 15 : 10),
    originalPriceUsd: p.originalPriceUsd || Number((p.priceUsd * 1.15).toFixed(2)),
  }));
}

/**
 * Tendencias de la Semana basadas en productos reales de SmartVentas
 */
export async function getWeeklyTrends(): Promise<Product[]> {
  const all = await getAllProducts();
  const inStock = all.filter((p) => p.inStock);
  const candidates = inStock.length >= 10 ? inStock.slice(5, 10) : all.slice(0, 5);
  return candidates.map((p) => ({
    ...p,
    isWeeklyTrend: true,
  }));
}

/**
 * Producto Estrella basado en el inventario real de Bodegón
 */
export async function getStarProduct(): Promise<Product | undefined> {
  const all = await getAllProducts();
  const inStock = all.filter((p) => p.inStock && p.priceUsd > 20);
  const star = inStock[0] || all[0];
  if (!star) return undefined;
  return {
    ...star,
    isStarProduct: true,
  };
}
