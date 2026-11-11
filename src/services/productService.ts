import { Product } from '@/types';

/**
 * Deriva el Producto Estrella en memoria a partir del inventario curado
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
