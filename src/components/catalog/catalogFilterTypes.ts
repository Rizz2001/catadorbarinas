export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';
export type PriceRangeFilter = 'all' | 'under_5' | '5_to_15' | '15_to_40' | 'over_40';

export interface BrandFilterOption {
  name: string;
  count: number;
}

export const PRICE_RANGE_OPTIONS: { value: PriceRangeFilter; label: string }[] = [
  { value: 'all', label: 'Todos los precios' },
  { value: 'under_5', label: 'Menos de $5' },
  { value: '5_to_15', label: '$5 a $15' },
  { value: '15_to_40', label: '$15 a $40' },
  { value: 'over_40', label: 'Más de $40' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Más relevantes' },
  { value: 'price_asc', label: 'Menor precio ($)' },
  { value: 'price_desc', label: 'Mayor precio ($)' },
  { value: 'name_asc', label: 'Nombre A – Z' },
];

