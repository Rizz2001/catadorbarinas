import { supabase } from '@/lib/supabase/client';
import {
  ProductCmsConfig,
  AlliedBrand,
  SearchLogEntry,
  FaqItem,
} from '@/types';

let cachedProductConfigMap: {
  map: Map<string, ProductCmsConfig>;
  expiry: number;
} | null = null;

// ============================================================================
// CONFIGURACIÓN COMERCIAL DE PRODUCTOS (CMS)
// ============================================================================
export async function getProductCmsConfigs(): Promise<ProductCmsConfig[]> {
  try {
    const { data, error } = await supabase
      .from('productos_config_cms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ProductCmsConfig[];
  } catch {
    return [];
  }
}

export async function getProductCmsConfigsMap(): Promise<Map<string, ProductCmsConfig>> {
  const now = Date.now();
  if (cachedProductConfigMap && cachedProductConfigMap.expiry > now) {
    return cachedProductConfigMap.map;
  }

  try {
    const list = await getProductCmsConfigs();
    const map = new Map<string, ProductCmsConfig>();
    list.forEach((item) => {
      if (item.cod_articulo) {
        const clean = item.cod_articulo.trim();
        map.set(clean, item);
        map.set(clean.toLowerCase(), item);
      }
    });
    cachedProductConfigMap = { map, expiry: now + 20000 };
    return map;
  } catch {
    return new Map();
  }
}

export function invalidateProductCmsConfigCache(): void {
  cachedProductConfigMap = null;
}

export async function upsertProductCmsConfig(
  config: Partial<ProductCmsConfig> & { cod_articulo: string }
): Promise<ProductCmsConfig> {
  cachedProductConfigMap = null;
  const payload: Record<string, unknown> = {
    ...config,
    cod_articulo: config.cod_articulo.trim(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('productos_config_cms')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as ProductCmsConfig;
}

export async function deleteProductCmsConfig(codArticulo: string): Promise<void> {
  cachedProductConfigMap = null;
  const { error } = await supabase
    .from('productos_config_cms')
    .delete()
    .eq('cod_articulo', codArticulo.trim());

  if (error) throw error;
}

// ============================================================================
// MARCAS Y EMPRESAS ALIADAS COMERCIALES
// ============================================================================
export async function getAlliedBrands(onlyActive = true): Promise<AlliedBrand[]> {
  try {
    let query = supabase
      .from('marcas_aliadas')
      .select('*')
      .order('orden', { ascending: true });

    if (onlyActive) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AlliedBrand[];
  } catch {
    return [];
  }
}

export async function upsertAlliedBrand(brand: Partial<AlliedBrand>): Promise<AlliedBrand> {
  const payload: Record<string, unknown> = {
    ...brand,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('marcas_aliadas')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as AlliedBrand;
}

export async function deleteAlliedBrand(id: string): Promise<void> {
  const { error } = await supabase.from('marcas_aliadas').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// INTELIGENCIA Y REGISTRO DE BÚSQUEDAS DE USUARIOS
// ============================================================================
export async function recordUserSearch(params: {
  termino: string;
  resultadosCount: number;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  usuarioEmail?: string | null;
  departamentoFiltro?: string | null;
}): Promise<void> {
  const cleanTerm = params.termino.trim();
  if (cleanTerm.length < 2) return;

  const normalized = cleanTerm
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  try {
    await supabase.from('historial_busquedas').insert({
      termino: cleanTerm,
      termino_normalizado: normalized,
      resultados_count: params.resultadosCount,
      usuario_id: params.usuarioId || null,
      usuario_nombre: params.usuarioNombre || null,
      usuario_email: params.usuarioEmail || null,
      departamento_filtro: params.departamentoFiltro || null,
    });
  } catch {
    // Registro silencioso para no bloquear la experiencia del cliente
  }
}

export async function getSearchLogs(limit = 250): Promise<SearchLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('historial_busquedas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as SearchLogEntry[];
  } catch {
    return [];
  }
}

export async function clearSearchLogs(): Promise<void> {
  const { error } = await supabase
    .from('historial_busquedas')
    .delete()
    .neq('termino', '__never__');

  if (error) throw error;
}

// ============================================================================
// PREGUNTAS FRECUENTES (FAQ)
// ============================================================================
export async function getFaqItems(onlyActive = true): Promise<FaqItem[]> {
  try {
    let query = supabase
      .from('preguntas_frecuentes')
      .select('*')
      .order('orden', { ascending: true });

    if (onlyActive) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as FaqItem[];
  } catch {
    return [];
  }
}

export async function upsertFaqItem(item: Partial<FaqItem>): Promise<FaqItem> {
  const { data, error } = await supabase
    .from('preguntas_frecuentes')
    .upsert(item)
    .select()
    .single();

  if (error) throw error;
  return data as FaqItem;
}

export async function deleteFaqItem(id: string): Promise<void> {
  const { error } = await supabase.from('preguntas_frecuentes').delete().eq('id', id);
  if (error) throw error;
}

