import { supabase } from '@/lib/supabase/client';
import { Banner, StoreConfig, ProductImageMapping, QuickCategory } from '@/types';

// ============================================================================
// BANNERS
// ============================================================================
export async function getBanners(onlyActive = false): Promise<Banner[]> {
  try {
    let query = supabase.from('banners').select('*').order('orden', { ascending: true });
    if (onlyActive) {
      query = query.eq('activo', true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Banner[];
  } catch (err) {
    console.error('Error obteniendo banners:', err);
    return [];
  }
}

export async function upsertBanner(banner: Partial<Banner>): Promise<Banner> {
  let bannerId = banner.id;
  if (!bannerId && banner.tipo) {
    const { data: existing } = await supabase
      .from('banners')
      .select('id')
      .eq('tipo', banner.tipo)
      .limit(1)
      .maybeSingle();
    if (existing?.id) {
      bannerId = existing.id;
    }
  }

  const payload: Record<string, unknown> = {
    ...banner,
    updated_at: new Date().toISOString(),
  };
  if (bannerId) {
    payload.id = bannerId;
  }

  const { data, error } = await supabase
    .from('banners')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// CATEGORÍAS RÁPIDAS (ACCESOS DIRECTOS DEL HERO)
// ============================================================================
export async function getQuickCategories(onlyActive = true): Promise<QuickCategory[]> {
  try {
    let query = supabase.from('categorias_rapidas').select('*').order('orden', { ascending: true });
    if (onlyActive) {
      query = query.eq('activo', true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as QuickCategory[];
  } catch (err) {
    console.error('Error cargando categorías rápidas:', err);
    return [];
  }
}

export async function upsertQuickCategory(item: Partial<QuickCategory>): Promise<QuickCategory> {
  const payload: Record<string, unknown> = {
    ...item,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('categorias_rapidas')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as QuickCategory;
}

export async function deleteQuickCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categorias_rapidas').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// CONFIGURACIÓN DE LA TIENDA
// ============================================================================
export async function getStoreConfig(): Promise<StoreConfig | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion_tienda')
      .select('*')
      .eq('id', 'general')
      .single();

    if (error) throw error;
    return data as StoreConfig;
  } catch (err) {
    console.error('Error cargando configuración:', err);
    return null;
  }
}

export async function updateStoreConfig(config: Partial<StoreConfig>): Promise<StoreConfig> {
  const { data, error } = await supabase
    .from('configuracion_tienda')
    .upsert({
      id: 'general',
      ...config,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as StoreConfig;
}

// ============================================================================
// FOTOS DE PRODUCTOS (CÓDIGO DE BARRAS / WEBP)
// ============================================================================
let cachedImagesMap: { map: Map<string, string>; expiry: number } | null = null;

export async function getProductImages(): Promise<ProductImageMapping[]> {
  try {
    const { data, error } = await supabase
      .from('producto_imagenes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ProductImageMapping[];
  } catch (err) {
    console.error('Error cargando imágenes de productos:', err);
    return [];
  }
}

export async function getProductImagesMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedImagesMap && cachedImagesMap.expiry > now) {
    return cachedImagesMap.map;
  }
  try {
    const list = await getProductImages();
    const map = new Map<string, string>();
    list.forEach((item) => {
      if (item.codigo_articulo && item.imagen_url) {
        const clean = item.codigo_articulo.trim();
        map.set(clean, item.imagen_url);
        map.set(clean.toLowerCase(), item.imagen_url);
      }
    });
    cachedImagesMap = { map, expiry: now + 30000 };
    return map;
  } catch (err) {
    console.error('Error creando mapa de fotos de productos:', err);
    return new Map();
  }
}

export async function uploadProductWebpImage(
  file: File,
  codigoArticulo: string,
  nombreArticulo?: string
): Promise<ProductImageMapping> {
  cachedImagesMap = null; // invalidar cache
  // Limpiar código de barras/SKU (sin espacios ni caracteres inválidos)
  const cleanCode = codigoArticulo.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `${cleanCode}.webp`;
  const filePath = `${fileName}`;

  // 1. Subir al bucket 'products'
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);

  // 3. Registrar o actualizar en la tabla producto_imagenes
  const { data, error: dbError } = await supabase
    .from('producto_imagenes')
    .upsert({
      codigo_articulo: cleanCode,
      nombre_articulo: nombreArticulo || cleanCode,
      imagen_url: publicUrl,
      nombre_archivo: fileName,
      formato: 'webp',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return data as ProductImageMapping;
}

export async function deleteProductWebpImage(codigoArticulo: string): Promise<void> {
  cachedImagesMap = null; // invalidar cache
  const fileName = `${codigoArticulo}.webp`;

  // 1. Eliminar del storage
  await supabase.storage.from('products').remove([fileName]);

  // 2. Eliminar de la base de datos
  const { error } = await supabase
    .from('producto_imagenes')
    .delete()
    .eq('codigo_articulo', codigoArticulo);

  if (error) throw error;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'webp';
  const fileName = `banner_${Date.now()}.${ext}`;
  const filePath = `banners/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      contentType: file.type || 'image/webp',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
  return publicUrl;
}

export async function uploadStoreLogo(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `logo_${Date.now()}.${ext}`;
  const filePath = `branding/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      contentType: file.type || 'image/png',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
  return publicUrl;
}
