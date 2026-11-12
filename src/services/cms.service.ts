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

  if (!error) return data as Banner;

  const isMissingVisualColumn =
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    error.message?.includes('overlay_opacity') ||
    error.message?.includes('object_position');

  if (!isMissingVisualColumn) throw error;

  // Fallback seguro si la migración SQL de overlay_opacity / object_position aún no se ejecuta
  const legacyPayload = { ...payload };
  delete legacyPayload.overlay_opacity;
  delete legacyPayload.object_position;

  const retry = await supabase
    .from('banners')
    .upsert(legacyPayload)
    .select()
    .single();

  if (retry.error) throw retry.error;
  return {
    ...(retry.data as Banner),
    overlay_opacity: banner.overlay_opacity ?? 85,
    object_position: banner.object_position ?? 'center',
  };
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
    return ((data || []) as QuickCategory[]).map((cat) => ({
      ...cat,
      icon_name: cat.icon_name || cat.icono || 'Wine',
      image_url: cat.image_url ?? null,
      is_featured: Boolean(cat.is_featured),
      show_on_homepage: cat.show_on_homepage ?? cat.activo ?? true,
    }));
  } catch (err) {
    console.error('Error cargando categorías rápidas:', err);
    return [];
  }
}

export async function upsertQuickCategory(item: Partial<QuickCategory>): Promise<QuickCategory> {
  const resolvedIcon = (item.icon_name ?? item.icono ?? 'Wine').trim() || 'Wine';
  const resolvedActive = item.activo ?? true;
  const resolvedVisible = item.show_on_homepage ?? resolvedActive;
  const resolvedImageUrl = item.image_url?.trim() || null;
  const resolvedFeatured = Boolean(item.is_featured);
  const now = new Date().toISOString();

  const fullPayload: Record<string, unknown> = {
    ...item,
    icono: resolvedIcon,
    icon_name: resolvedIcon,
    image_url: resolvedImageUrl,
    is_featured: resolvedFeatured,
    activo: resolvedActive,
    show_on_homepage: resolvedVisible,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('categorias_rapidas')
    .upsert(fullPayload)
    .select()
    .single();

  if (!error) return data as QuickCategory;

  const isMissingSchemaColumn =
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    error.message?.includes('icon_name') ||
    error.message?.includes('show_on_homepage') ||
    error.message?.includes('image_url') ||
    error.message?.includes('is_featured');

  if (!isMissingSchemaColumn) throw error;

  // Fallback seguro si alguna columna aún no existe en Supabase
  const legacyPayload: Record<string, unknown> = {
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion ?? '',
    url: item.url ?? '/catalogo',
    icono: resolvedIcon,
    orden: item.orden ?? 1,
    activo: resolvedActive,
    updated_at: now,
  };

  const retry = await supabase
    .from('categorias_rapidas')
    .upsert(legacyPayload)
    .select()
    .single();

  if (retry.error) throw retry.error;
  return {
    ...(retry.data as QuickCategory),
    icon_name: resolvedIcon,
    image_url: resolvedImageUrl,
    is_featured: resolvedFeatured,
    show_on_homepage: resolvedVisible,
  };
}

export async function deleteQuickCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categorias_rapidas').delete().eq('id', id);
  if (error) throw error;
}

export async function revalidateStorefrontCache(): Promise<void> {
  try {
    await fetch('/api/admin/revalidate', { method: 'POST' });
  } catch {
    // Revalidación silenciosa en background
  }
}

// ============================================================================
// CONFIGURACIÓN DE LA TIENDA
// ============================================================================
let cachedStoreConfig: { data: StoreConfig | null; expiry: number } | null = null;

export function invalidateClientCmsCaches(): void {
  cachedStoreConfig = null;
  cachedImagesMap = null;
}

export async function getStoreConfig(): Promise<StoreConfig | null> {
  const now = Date.now();
  if (cachedStoreConfig && cachedStoreConfig.expiry > now) {
    return cachedStoreConfig.data;
  }
  try {
    const { data, error } = await supabase
      .from('configuracion_tienda')
      .select('*')
      .eq('id', 'general')
      .single();

    if (error) throw error;
    const result = data as StoreConfig;
    cachedStoreConfig = { data: result, expiry: now + 20000 };
    return result;
  } catch (err) {
    console.error('Error cargando configuración:', err);
    return null;
  }
}

export async function updateStoreConfig(config: Partial<StoreConfig>): Promise<StoreConfig> {
  cachedStoreConfig = null;
  const { data, error } = await supabase
    .from('configuracion_tienda')
    .upsert({
      id: 'general',
      ...config,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42703') {
      throw new Error(
        `Falta aplicar la migración SQL en Supabase (supabase/migrations/20261112000001_home_appearance_cms.sql): ${error.message}`
      );
    }
    throw error;
  }
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

export async function uploadCategoryImage(file: File, categoryId?: string): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const ext = rawExt.replace(/[^a-z0-9]/g, '') || 'webp';
  const cleanPrefix = (categoryId || 'cat')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const filePath = `${cleanPrefix}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('category-images')
    .upload(filePath, file, {
      contentType: file.type || 'image/webp',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('category-images').getPublicUrl(filePath);
  return publicUrl;
}

export * from './cms-catalog.service';

