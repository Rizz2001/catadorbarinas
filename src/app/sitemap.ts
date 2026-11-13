import type { MetadataRoute } from 'next';
import { DEFAULT_GROUPS } from '@/constants/fallback-products';
import { APP_CONFIG } from '@/constants/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/catalogo`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/favoritos`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/privacidad`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terminos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const groupRoutes: MetadataRoute.Sitemap = DEFAULT_GROUPS.map((group) => ({
    url: `${baseUrl}/catalogo/${group.CodGrupo}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  return [...staticRoutes, ...groupRoutes];
}

