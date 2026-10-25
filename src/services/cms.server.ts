import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Banner, StoreConfig } from '@/types';

/**
 * Obtiene los banners activos directamente en Server Components
 * evitando llamadas de cliente y flash de contenido antiguo.
 */
export async function getBannersServer(): Promise<Banner[]> {
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
    return (data || []) as Banner[];
  } catch (err) {
    console.error('Error cargando banners en servidor:', err);
    return [];
  }
}

/**
 * Obtiene la configuración del negocio directamente en el Servidor
 */
export async function getStoreConfigServer(): Promise<StoreConfig | null> {
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
    return data as StoreConfig;
  } catch (err) {
    console.error('Error cargando configuración en servidor:', err);
    return null;
  }
}
