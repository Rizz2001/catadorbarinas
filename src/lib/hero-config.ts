import { Banner, BannerObjectPosition } from '@/types';

export const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=85';

export interface ResolvedBannerImageVisual {
  overlayOpacity: number;
  overlayAlpha: number;
  objectPosition: BannerObjectPosition;
}

/**
 * Normaliza la opacidad del overlay (0-100) y el punto focal vertical del fondo.
 */
export function resolveBannerImageVisual(
  banner?: Partial<Banner> | null,
  defaultOpacity = 85
): ResolvedBannerImageVisual {
  const rawOpacity = banner?.overlay_opacity;
  const parsed = typeof rawOpacity === 'number' && Number.isFinite(rawOpacity) ? rawOpacity : defaultOpacity;
  const overlayOpacity = Math.min(100, Math.max(0, Math.round(parsed)));
  const overlayAlpha = Number((overlayOpacity / 100).toFixed(2));
  const rawPos = banner?.object_position;
  const objectPosition: BannerObjectPosition =
    rawPos === 'top' || rawPos === 'bottom' || rawPos === 'center' ? rawPos : 'center';

  return { overlayOpacity, overlayAlpha, objectPosition };
}

/**
 * Convierte un color hexadecimal #RRGGBB en rgba(...) seguro con alpha configurable.
 */
export function hexToRgba(hexColor: string, alpha: number): string {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hexColor) ? hexColor.slice(1) : '081229';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const safeAlpha = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

/**
 * Construye el gradiente lateral horizontal del Hero respetando 0%-100% de opacidad.
 */
export function buildHeroScrimGradient(hexColor: string, overlayOpacity: number): string {
  const alpha = Math.min(1, Math.max(0, overlayOpacity / 100));
  const midAlpha = overlayOpacity >= 100 ? 1 : Math.max(0, alpha * 0.82);
  return `linear-gradient(90deg, ${hexToRgba(hexColor, alpha)} 0%, ${hexToRgba(hexColor, midAlpha)} 50%, ${hexToRgba(hexColor, alpha)} 100%)`;
}

/**
 * Construye el gradiente vertical inferior->superior para tarjetas promocionales.
 */
export function buildPromoScrimGradient(overlayOpacity: number): string {
  if (overlayOpacity <= 0) {
    return 'linear-gradient(to top, rgba(0, 23, 84, 0) 0%, rgba(0, 23, 84, 0) 100%)';
  }
  const alpha = Math.min(1, Math.max(0, overlayOpacity / 100));
  const bottom = overlayOpacity >= 100 ? 1 : Math.min(0.98, alpha + 0.08);
  const mid = overlayOpacity >= 100 ? 1 : alpha * 0.65;
  const top = overlayOpacity >= 100 ? 1 : alpha * 0.28;
  return `linear-gradient(to top, rgba(0, 23, 84, ${bottom.toFixed(2)}) 0%, rgba(0, 23, 84, ${mid.toFixed(2)}) 60%, rgba(0, 23, 84, ${top.toFixed(2)}) 100%)`;
}

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
  overlayOpacity: number;
  overlayAlpha: number;
  objectPosition: BannerObjectPosition;
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
    (botonUrl === '/catalogo' ? '/catalogo/01?caja=1' : '/catalogo');

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
    ...resolveBannerImageVisual(banner, 85),
    hasPromo,
    promoTitulo: banner?.promo_titulo || '',
    promoPrecio,
    promoAhorro,
  };
}

