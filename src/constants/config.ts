/**
 * Constantes globales de configuración para Gran Catador / Bodegón del Catador.
 * Estricta fidelidad con la API de FoxData / SmartVentas.
 */

export const APP_CONFIG = {
  name: 'Gran Catador',
  legalName: 'Distribuidora Bodegón del Catador C.A.',
  city: 'Barinas',
  country: 'Venezuela',
  address: 'Av. Alberto Arvelo Torrealba, Barinas, Edo. Barinas',
  phone: '+58 414-0000000',
  whatsappNumber: '584140000000',
  whatsappDefaultMessage: '¡Hola Gran Catador! Me gustaría confirmar el siguiente pedido:',
  freeShippingThresholdUsd: 30.0,
  flatShippingRateUsd: 2.0,
  defaultBcvRate: 886.23,
} as const;

export const IMAGE_FALLBACKS = {
  product: '/logo-catador.svg',
  category: '/logo-catador.svg',
  banner: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=80',
  logoText: 'Gran Catador',
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
  { id: '03', name: 'Hielos', slug: '03', icon: 'Sparkles' },
  { id: '08', name: 'Agua', slug: '08', icon: 'CupSoda' },
  { id: '14', name: 'Jugos & Lácteas', slug: '14', icon: 'Sandwich' },
  { id: '07', name: 'Carbón', slug: '07', icon: 'Flame' },
  { id: '06', name: 'Vasos & Platos', slug: '06', icon: 'ShoppingBag' },
  { id: '04', name: 'Cigarrillos & Fósforos', slug: '04', icon: 'Tag' },
  { id: '10', name: 'Varios', slug: '10', icon: 'Tag' },
] as const;
