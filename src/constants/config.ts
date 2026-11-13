/**
 * Constantes globales de configuración para Gran Catador / Bodegón del Catador.
 * Estricta fidelidad con la API de FoxData / SmartVentas.
 */

export const OFFICIAL_LOGO_PATH = '/icon-catador.png';
export const OFFICIAL_LOGO_VERSIONED = '/icon-catador.png?v=2';
export const OFFICIAL_LOGO_ALT = 'Distribuidora Gran Catador - Bodegón & Licorería';

export function resolveOfficialLogo(rawLogo?: string | null): string {
  if (!rawLogo || rawLogo === '/logo-catador.svg') return OFFICIAL_LOGO_PATH;
  return rawLogo;
}

export const OFFICIAL_OG_IMAGE = {
  url: OFFICIAL_LOGO_VERSIONED,
  width: 1200,
  height: 630,
  alt: OFFICIAL_LOGO_ALT,
  type: 'image/png',
} as const;

export const APP_CONFIG = {
  name: 'EL CATADOR.',
  legalName: 'Gran Catador Supermercado y Bodegon',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://elcatadorbarinas.vercel.app',
  logoAlt: OFFICIAL_LOGO_ALT,
  city: 'Barinas',
  country: 'Venezuela',
  address: 'Av. San Silvestre Detras de la Ciudad Deportiva, C.C Ciudad Catador Local N1',
  phone: '+58 424-5496366',
  whatsappNumber: '584245496366',
  whatsappDefaultMessage: '¡Hola EL CATADOR.! Me gustaría confirmar el siguiente pedido:',
  freeShippingThresholdUsd: 30.0,
  flatShippingRateUsd: 2.0,
  defaultBcvRate: 886.23,
} as const;

export const IMAGE_FALLBACKS = {
  product: OFFICIAL_LOGO_PATH,
  category: OFFICIAL_LOGO_PATH,
  banner: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=80',
  logoText: 'EL CATADOR.',
} as const;

/**
 * Grupos comerciales oficiales sincronizados 100% con SmartVentas (FoxData)
 */
export const DEPARTMENTS = [
  { id: '01', name: 'Licores', slug: '01', icon: 'Wine' },
  { id: '09', name: 'Cervezas', slug: '09', icon: 'CupSoda' },
  { id: '02', name: 'Refrescos', slug: '02', icon: 'CupSoda' },
  { id: '11', name: 'Alimentos & Despensa', slug: '11', icon: 'ShoppingBasket' },
  { id: '05', name: 'Confitería & Snacks', slug: '05', icon: 'Cookie' },
  { id: '03', name: 'Hielos', slug: '03', icon: 'CupSoda' },
  { id: '08', name: 'Agua', slug: '08', icon: 'CupSoda' },
  { id: '14', name: 'Jugos & Lácteas', slug: '14', icon: 'Sandwich' },
  { id: '07', name: 'Carbón', slug: '07', icon: 'Flame' },
  { id: '06', name: 'Vasos & Platos', slug: '06', icon: 'ShoppingBag' },
  { id: '04', name: 'Cigarrillos & Fósforos', slug: '04', icon: 'Tag' },
  { id: '10', name: 'Varios', slug: '10', icon: 'Tag' },
] as const;
