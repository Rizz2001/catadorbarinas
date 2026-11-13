import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = APP_CONFIG.siteUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cuenta'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

