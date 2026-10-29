import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Banner, StoreConfig, QuickCategory } from '@/types';

interface ServerCacheItem<T> {
  data: T;
  expiresAt: number;
}

let cachedBanners: ServerCacheItem<Banner[]> | null = null;
let cachedQuickCats: ServerCacheItem<QuickCategory[]> | null = null;
let cachedConfig: ServerCacheItem<StoreConfig | null> | null = null;

export function invalidateServerCmsCache() {
  cachedBanners = null;
  cachedQuickCats = null;
  cachedConfig = null;
}

/**
 * Obtiene los banners activos directamente en Server Components (Cache 60s)
 */
export async function getBannersServer(): Promise<Banner[]> {
  const now = Date.now();
  if (cachedBanners && cachedBanners.expiresAt > now) {
    return cachedBanners.data;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error en getBannersServer:', error);
      return [];
    }
    const banners = (data || []) as Banner[];
    cachedBanners = { data: banners, expiresAt: now + 60000 };
    return banners;
  } catch (err) {
    console.error('Error cargando banners en servidor:', err);
    return [];
  }
}

/**
 * Obtiene las categorías rápidas activas directamente en Servidor (Cache 60s)
 */
export async function getQuickCategoriesServer(): Promise<QuickCategory[]> {
  const now = Date.now();
  if (cachedQuickCats && cachedQuickCats.expiresAt > now) {
    return cachedQuickCats.data;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('categorias_rapidas')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error en getQuickCategoriesServer:', error);
      return [];
    }
    const cats = (data || []) as QuickCategory[];
    cachedQuickCats = { data: cats, expiresAt: now + 60000 };
    return cats;
  } catch (err) {
    console.error('Error cargando categorias rapidas en servidor:', err);
    return [];
  }
}

/**
 * Obtiene la configuración del negocio directamente en el Servidor (Cache 60s)
 */
export async function getStoreConfigServer(): Promise<StoreConfig | null> {
  const now = Date.now();
  if (cachedConfig && cachedConfig.expiresAt > now) {
    return cachedConfig.data;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('configuracion_tienda')
      .select('*')
      .eq('id', 'general')
      .single();

    if (error) {
      console.error('Error en getStoreConfigServer:', error);
      return null;
    }
    const cfg = data as StoreConfig;
    cachedConfig = { data: cfg, expiresAt: now + 60000 };
    return cfg;
  } catch (err) {
    console.error('Error cargando configuración en servidor:', err);
    return null;
  }
}
