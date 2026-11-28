import type { MetadataRoute } from 'next';
import { APP_CONFIG, OFFICIAL_LOGO_PATH } from '@/constants/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} — Bodegón & Licorería`,
    short_name: 'El Catador',
    description:
      'Tienda online oficial y consola operativa de EL CATADOR. en Barinas.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0F172A',
    theme_color: '#001754',
    lang: 'es-VE',
    icons: [
      {
        src: OFFICIAL_LOGO_PATH,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: OFFICIAL_LOGO_PATH,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
