import { HomeCmsSectionsPayload } from '@/types';

/**
 * Devuelve el cierre del día actual en hora de Venezuela (-04:00) para el contador CMS.
 */
export function getDefaultDailyCampaignEndIso(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59-04:00`;
}

/**
 * Respuesta simulada / fallback estructurada como JSON proveniente del CMS.
 */
export const MOCK_HOME_CMS_RESPONSE: HomeCmsSectionsPayload = {
  bentoCards: [
    {
      id: 'bento-offers',
      kind: 'offers_countdown',
      title: 'Ofertas',
      titleLineBreak: 'Especiales',
      href: '/#ofertas',
      badgeText: 'HOY',
      icon: 'Flame',
      active: true,
      order: 1,
    },
    {
      id: 'bento-delivery',
      kind: 'delivery_action',
      title: 'Delivery GPS',
      subtitle: 'Barinas',
      href: '/checkout#cotizar-delivery',
      ctaText: 'Cotizar delivery',
      icon: 'MapPin',
      active: true,
      order: 2,
    },
    {
      id: 'bento-wholesale',
      kind: 'link_card',
      title: 'Compra por',
      titleLineBreak: 'Caja Cerrada',
      subtitle: 'Precios al mayor',
      href: '/catalogo?caja=1',
      pillText: 'Mayor',
      icon: 'Package',
      active: true,
      order: 3,
    },
    {
      id: 'bento-featured',
      kind: 'featured_product',
      title: 'Edición Destacada',
      href: '/catalogo',
      active: true,
      order: 4,
    },
  ],
  quickCategories: [
    {
      id: 'cat-whisky',
      nombre: 'Whisky & Ron',
      descripcion: 'Escoceses y reservas',
      icono: 'Wine',
      url: '/catalogo/01',
      orden: 1,
      activo: true,
    },
    {
      id: 'cat-cervezas',
      nombre: 'Cervezas',
      descripcion: 'Polar, Solera y Corona',
      icono: 'CupSoda',
      url: '/catalogo/09',
      orden: 2,
      activo: true,
    },
    {
      id: 'cat-vinos',
      nombre: 'Vinos & Cavas',
      descripcion: 'Tintos, blancos y espumosos',
      icono: 'Wine',
      url: '/catalogo/01/04',
      orden: 3,
      activo: true,
    },
    {
      id: 'cat-refrescos',
      nombre: 'Refrescos & Agua',
      descripcion: 'Bebidas y mezcladores',
      icono: 'CupSoda',
      url: '/catalogo/02',
      orden: 4,
      activo: true,
    },
    {
      id: 'cat-despensa',
      nombre: 'Despensa & Snacks',
      descripcion: 'Víveres y confitería',
      icono: 'ShoppingBasket',
      url: '/catalogo/11',
      orden: 5,
      activo: true,
    },
    {
      id: 'cat-hielo',
      nombre: 'Hielo & Carbón',
      descripcion: 'Listos para tu evento',
      icono: 'Snowflake',
      url: '/catalogo/03',
      orden: 6,
      activo: true,
    },
  ],
  weeklyTrends: {
    active: true,
    title: 'Selección del Catador · Por Unidad o Caja',
    subtitle: 'Artículos con mayor rotación en Barinas y disponibilidad inmediata',
    viewAllLabel: 'Ver todo',
    viewAllHref: '/catalogo',
    tabs: [
      { id: 'mas_vendidos', label: 'Más Vendidos' },
      { id: 'ofertas', label: 'En Oferta' },
      { id: 'nuevos', label: 'Novedades' },
    ],
    maxItems: 4,
  },
  flashSaleCampaign: {
    active: true,
    badgeText: 'Tiempo Limitado · Tasa BCV',
    title: 'Ofertas Destacadas del Día',
    subtitle: 'Precios especiales por tiempo limitado en licores y despensa seleccionada',
    countdownLabel: 'Cierra en:',
    endsAt: '',
    maxItems: 4,
  },
  trustBadges: [
    {
      id: 'trust-delivery',
      figura: '< 45 min',
      titulo: 'Despacho Express en Barinas',
      subtitulo: 'Alto Barinas, Centro, Palma Sola y Varyná en motorizado o carga',
      icon: 'Truck',
    },
    {
      id: 'trust-bcv',
      figura: 'Tasa BCV',
      titulo: 'Cotización Bimonetaria Exacta',
      subtitulo: 'Precios sincronizados al día en Dólares ($ USD) y Bolívares',
      icon: 'RefreshCw',
    },
    {
      id: 'trust-stock',
      figura: 'Stock Garantizado',
      titulo: 'Inventario Real por Unidad o Caja',
      subtitulo: 'Licores con precinto oficial y víveres directo de nuestro almacén',
      icon: 'ShieldCheck',
    },
    {
      id: 'trust-payment',
      figura: 'Bs. / $ USD',
      titulo: 'Pago Móvil, Zelle y Efectivo',
      subtitulo: 'Verificación inmediata y atención directa en nuestro Chat en Vivo',
      icon: 'CreditCard',
    },
  ],
};

export function createHomeCmsFallbackPayload(): HomeCmsSectionsPayload {
  const dailyEnd = getDefaultDailyCampaignEndIso();
  return {
    ...MOCK_HOME_CMS_RESPONSE,
    bentoCards: MOCK_HOME_CMS_RESPONSE.bentoCards.map((card) =>
      card.kind === 'offers_countdown' ? { ...card, endsAt: card.endsAt || dailyEnd } : { ...card }
    ),
    flashSaleCampaign: {
      ...MOCK_HOME_CMS_RESPONSE.flashSaleCampaign,
      endsAt: MOCK_HOME_CMS_RESPONSE.flashSaleCampaign.endsAt || dailyEnd,
    },
  };
}

