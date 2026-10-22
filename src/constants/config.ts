/**
 * Constantes globales de configuración para Gran Catador / Bodegón del Catador.
 * Prohibido hardcodear estos valores en componentes.
 */

export const APP_CONFIG = {
  name: 'Gran Catador',
  legalName: 'Distribuidora Bodegón del Catador C.A.',
  city: 'Barinas',
  country: 'Venezuela',
  address: 'Av. Alberto Arvelo Torrealba, Barinas, Edo. Barinas',
  phone: '+58 414-0000000',
  whatsappNumber: '584140000000', // Formato internacional para wa.me sin signos
  whatsappDefaultMessage: '¡Hola Gran Catador! Me gustaría confirmar el siguiente pedido:',
  freeShippingThresholdUsd: 30.0,
  flatShippingRateUsd: 2.0,
  defaultBcvRate: 43.62,
} as const;

export const IMAGE_FALLBACKS = {
  product: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
  category: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80',
  banner: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=80',
  logoText: 'Gran Catador',
} as const;

export const DEPARTMENTS = [
  { id: '1', name: 'Licores & Vinos', slug: 'licores-vinos', icon: 'Wine' },
  { id: '2', name: 'Víveres & Despensa', slug: 'viveres', icon: 'ShoppingBasket' },
  { id: '3', name: 'Charcutería & Quesos', slug: 'charcuteria-quesos', icon: 'Sandwich' },
  { id: '4', name: 'Carnicería & Aves', slug: 'carniceria', icon: 'Beef' },
  { id: '5', name: 'Snacks & Dulcería', slug: 'snacks-dulces', icon: 'Cookie' },
  { id: '6', name: 'Bebidas & Refrescos', slug: 'bebidas-refrescos', icon: 'CupSoda' },
  { id: '7', name: 'Cuidado Personal', slug: 'cuidado-personal', icon: 'Sparkles' },
  { id: '8', name: 'Hogar & Limpieza', slug: 'hogar-limpieza', icon: 'Home' },
] as const;
