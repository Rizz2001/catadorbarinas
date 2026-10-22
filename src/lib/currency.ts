import type { DualPriceResult } from '../types';

/**
 * Tasa BCV de respaldo oficial en caso de desconexión o fallo de API
 */
export const DEFAULT_BCV_RATE = 43.62;

/**
 * Formatea un número al estándar monetario estadounidense:
 * - Coma (,) para separador de miles.
 * - Punto (.) para separador de decimales.
 * Ej: 1250.5 -> "$1,250.50"
 */
export function formatUsd(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formatea un número al estándar monetario venezolano (VES):
 * - Punto (.) para separador de miles.
 * - Coma (,) para separador de decimales.
 * - Prefijo "Bs. "
 * Ej: 1250.5 -> "Bs. 1.250,50"
 */
export function formatVes(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return `Bs. ${formatted}`;
}

/**
 * Convierte un precio en USD a Bolívares (VES) usando la tasa BCV proporcionada
 */
export function convertUsdToVes(priceUsd: number, bcvRate: number = DEFAULT_BCV_RATE): number {
  const safeUsd = Number.isFinite(priceUsd) ? priceUsd : 0;
  const safeRate = Number.isFinite(bcvRate) && bcvRate > 0 ? bcvRate : DEFAULT_BCV_RATE;
  return Number((safeUsd * safeRate).toFixed(2));
}

/**
 * HELPER UNIVERSAL OBLIGATORIO: formatPrices
 *
 * Devuelve un objeto completo con el desglose dual en USD y Bs. (VES)
 * garantizando la regla de oro de bimonetarismo de Gran Catador.
 *
 * @param priceUsd Precio en dólares
 * @param bcvRate Tasa oficial del Banco Central de Venezuela
 */
export function formatPrices(
  priceUsd: number,
  bcvRate: number = DEFAULT_BCV_RATE
): DualPriceResult {
  const safeRate = Number.isFinite(bcvRate) && bcvRate > 0 ? bcvRate : DEFAULT_BCV_RATE;
  const priceVes = convertUsdToVes(priceUsd, safeRate);

  return {
    usdFormatted: formatUsd(priceUsd),
    vesFormatted: formatVes(priceVes),
    priceUsd,
    priceVes,
    bcvRate: safeRate,
  };
}

/**
 * Formatea un precio dual con descuento para banners y fichas de producto.
 */
export function formatDiscountedPrices(
  currentPriceUsd: number,
  originalPriceUsd: number,
  bcvRate: number = DEFAULT_BCV_RATE
): DualPriceResult & {
  originalUsdFormatted: string;
  originalVesFormatted: string;
  savingsUsdFormatted: string;
  savingsVesFormatted: string;
  discountPercentage: number;
} {
  const base = formatPrices(currentPriceUsd, bcvRate);
  const original = formatPrices(originalPriceUsd, bcvRate);
  const savingsUsd = Math.max(0, originalPriceUsd - currentPriceUsd);
  const savingsVes = convertUsdToVes(savingsUsd, bcvRate);

  const discountPercentage =
    originalPriceUsd > 0
      ? Math.round(((originalPriceUsd - currentPriceUsd) / originalPriceUsd) * 100)
      : 0;

  return {
    ...base,
    originalUsdFormatted: original.usdFormatted,
    originalVesFormatted: original.vesFormatted,
    savingsUsdFormatted: formatUsd(savingsUsd),
    savingsVesFormatted: formatVes(savingsVes),
    discountPercentage,
  };
}
