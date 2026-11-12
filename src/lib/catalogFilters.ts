import { Product } from '@/types';
import {
  BrandFilterOption,
  PriceRangeFilter,
  SortOption,
} from '@/components/catalog/catalogFilterTypes';

export interface CatalogFilterCriteria {
  onlyInStock: boolean;
  onlyDeals: boolean;
  onlyBoxes: boolean;
  selectedBrand: string;
  priceRange: PriceRangeFilter;
  sortBy: SortOption;
}

export function extractAvailableBrands(products: Product[]): BrandFilterOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const brand = product.brand?.trim();
    if (!brand || brand.toLowerCase() === 'sin marca') continue;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function filterAndSortCatalogProducts(
  products: Product[],
  { onlyInStock, onlyDeals, onlyBoxes, selectedBrand, priceRange, sortBy }: CatalogFilterCriteria
): Product[] {
  let result = [...products];
  if (onlyInStock) result = result.filter((p) => p.inStock);
  if (onlyDeals) {
    result = result.filter(
      (p) => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPriceUsd && p.originalPriceUsd > p.priceUsd)
    );
  }
  if (onlyBoxes) result = result.filter((p) => p.saleMode !== 'solo_unidad' && (p.unitsPerBox || 1) > 1);
  if (selectedBrand !== 'all') result = result.filter((p) => p.brand?.trim() === selectedBrand);

  if (priceRange === 'under_5') result = result.filter((p) => p.priceUsd < 5);
  else if (priceRange === '5_to_15') result = result.filter((p) => p.priceUsd >= 5 && p.priceUsd <= 15);
  else if (priceRange === '15_to_40') result = result.filter((p) => p.priceUsd > 15 && p.priceUsd <= 40);
  else if (priceRange === 'over_40') result = result.filter((p) => p.priceUsd > 40);

  if (sortBy === 'price_asc') result.sort((a, b) => a.priceUsd - b.priceUsd);
  else if (sortBy === 'price_desc') result.sort((a, b) => b.priceUsd - a.priceUsd);
  else if (sortBy === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

export function countActiveCatalogFilters(c: CatalogFilterCriteria): number {
  return (
    Number(c.onlyInStock) +
    Number(c.onlyDeals) +
    Number(c.onlyBoxes) +
    Number(c.priceRange !== 'all') +
    Number(c.selectedBrand !== 'all') +
    Number(c.sortBy !== 'default')
  );
}
