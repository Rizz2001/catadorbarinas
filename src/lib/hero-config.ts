import { Banner } from '@/types';

export const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=85';

export interface ResolvedHeroDisplay {
  badgeTexto: string;
  primaryTitle: string;
  highlightedTitle: string;
  subtitulo: string;
  botonTexto: string;
  botonUrl: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  heroBgColor: string;
  bgImageUrl: string;
  hasPromo: boolean;
  promoTitulo: string;
  promoPrecio: number | null;
  promoAhorro: string;
}

/**
 * Resuelve la configuración visual y editorial del Hero a partir del registro del CMS.
 */
export function resolveHeroDisplay(banner?: Partial<Banner> | null): ResolvedHeroDisplay {
  const hasCustomTitle = Boolean(banner?.titulo && banner.titulo.trim() !== '');
  const primaryTitle = hasCustomTitle
    ? banner?.titulo?.trim() || ''
    : 'CAVAS, LICORES & BODEGÓN ·';
  const highlightedTitle =
    banner?.titulo_destacado !== undefined && banner?.titulo_destacado !== null
      ? banner.titulo_destacado.trim()
      : hasCustomTitle
      ? ''
      : 'ENTREGA INMEDIATA EN BARINAS';

  const botonUrl = banner?.boton_url || '/#ofertas';
  const rawSecondaryText =
    banner?.boton_secundario_texto !== undefined && banner?.boton_secundario_texto !== null
      ? banner.boton_secundario_texto.trim()
      : botonUrl === '/catalogo'
      ? 'Compra por Caja'
      : 'Explorar Catálogo';
  const secondaryBtnUrl =
    banner?.boton_secundario_url?.trim() ||
    (botonUrl === '/catalogo' ? '/catalogo?caja=1' : '/catalogo');

  const rawBgColor = banner?.color_fondo?.trim() || '#081229';
  const heroBgColor = /^#[0-9A-Fa-f]{6}$/.test(rawBgColor) ? rawBgColor : '#081229';

  const hasPromo = Boolean(
    banner?.promo_titulo && banner.promo_titulo.trim() !== '' && banner.promo_titulo.trim() !== '0'
  );
  const promoPrecio =
    banner?.promo_precio !== undefined && banner?.promo_precio !== null
      ? Number(banner.promo_precio)
      : null;
  const promoAhorro =
    banner?.promo_ahorro && banner.promo_ahorro.trim() !== '' && banner.promo_ahorro.trim() !== '0'
      ? banner.promo_ahorro.trim()
      : '';

  return {
    badgeTexto: banner?.badge_texto?.trim()
      ? banner.badge_texto.replace(/^[★✨\s]+/, '')
      : 'Bodegón Moderno · C.C. Ciudad Catador Local N1',
    primaryTitle,
    highlightedTitle,
    subtitulo:
      banner?.subtitulo ||
      'Compra por unidad o caja cerrada con inventario real en nuestra sede (C.C. Ciudad Catador Local N1) y precios bimonetarios en $ USD y Bs. BCV.',
    botonTexto: banner?.boton_texto || 'Ver Ofertas del Día',
    botonUrl,
    secondaryBtnText: rawSecondaryText,
    secondaryBtnUrl,
    heroBgColor,
    bgImageUrl: banner?.imagen_url || DEFAULT_HERO_BG,
    hasPromo,
    promoTitulo: banner?.promo_titulo || '',
    promoPrecio,
    promoAhorro,
  };
}

