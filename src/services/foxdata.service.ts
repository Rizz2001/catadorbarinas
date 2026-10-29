import { Product } from '../types';
import { adaptFoxDataProducts, RawFoxDataProductDto } from '../adapters/foxdata.adapter';
import { getProductImagesMap } from './cms.service';
import {
  DEFAULT_GROUPS,
  DEFAULT_SUBGROUPS,
} from '@/constants/fallback-products';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;
let lastAuthFailureTime = 0;
const AUTH_COOLDOWN_MS = 30000;

const FOXDATA_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GranCatador/1.0',
};

/**
 * Obtiene o reutiliza el Bearer Token de autenticación OAuth2 de FoxData con circuit breaker
 */
async function getFoxDataToken(): Promise<string> {
  const now = Date.now();
  if (now - lastAuthFailureTime < AUTH_COOLDOWN_MS) {
    throw new Error('FoxData en periodo de enfriamiento');
  }

  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const authUrl = process.env.FOXDATA_AUTH_URL || 'https://auth.foxdata.app/connect/token';
  const clientId = process.env.FOXDATA_CLIENT_ID || 'smvt-apiweb-C0006';
  const clientSecret = process.env.FOXDATA_CLIENT_SECRET || 'i84so7BEzsUo';
  const scope = process.env.FOXDATA_SCOPE || 'smartventas-api smartventas.service.read smartventas.service.write smartventas.common.read';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', scope);

  try {
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...FOXDATA_HEADERS,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3000 },
    });

    if (!res.ok) {
      lastAuthFailureTime = Date.now();
      throw new Error(`Error en autenticación FoxData: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const expiresInMs = (data.expires_in || 3600) * 1000;
    cachedToken = {
      token: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return data.access_token;
  } catch (err) {
    lastAuthFailureTime = Date.now();
    throw err;
  }
}

const API_BASE = process.env.FOXDATA_API_BASE_URL || 'https://n1.apismartventas.foxdata.app';
const DEPOSITO_BODEGON = process.env.FOXDATA_DEPOSITO_BODEGON || '01';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

const memoryProductsCache = new Map<string, CacheItem<Product[]>>();
let memoryExistenciasCache: CacheItem<Map<string, number>> | null = null;
let memoryGroupsCache: CacheItem<unknown[]> | null = null;
const memorySubgroupsCache = new Map<string, CacheItem<unknown[]>>();

/**
 * Obtiene los grupos de inventario reales de SmartVentas (Cache 5 min)
 */
export async function fetchGruposInv() {
  const now = Date.now();
  if (memoryGroupsCache && memoryGroupsCache.expiresAt > now) {
    return memoryGroupsCache.data;
  }

  try {
    const token = await getFoxDataToken();
    const res = await fetch(`${API_BASE}/api/v1/syn/gruposinv`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FOXDATA_HEADERS,
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_GROUPS;
    const json = await res.json();
    const list = json.data || json || [];
    const result = Array.isArray(list) && list.length > 0 ? list : DEFAULT_GROUPS;
    memoryGroupsCache = { data: result, expiresAt: now + 300000 };
    return result;
  } catch {
    return DEFAULT_GROUPS;
  }
}

/**
 * Obtiene los subgrupos de un grupo específico (Cache 5 min)
 */
export async function fetchSubgruposInv(codGrupo: string) {
  const now = Date.now();
  const cached = memorySubgroupsCache.get(codGrupo);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const token = await getFoxDataToken();
    const res = await fetch(`${API_BASE}/api/v1/syn/gruposinvsub/grupo/${codGrupo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FOXDATA_HEADERS,
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_SUBGROUPS[codGrupo] || [];
    const json = await res.json();
    const list = json.data || json || [];
    const result = Array.isArray(list) && list.length > 0 ? list : DEFAULT_SUBGROUPS[codGrupo] || [];
    memorySubgroupsCache.set(codGrupo, { data: result, expiresAt: now + 300000 });
    return result;
  } catch {
    return DEFAULT_SUBGROUPS[codGrupo] || [];
  }
}

/**
 * Obtiene el mapa de existencias del depósito Bodegón (01) (Cache 60 seg)
 */
export async function fetchExistenciasBodegonMap(): Promise<Map<string, number>> {
  const now = Date.now();
  if (memoryExistenciasCache && memoryExistenciasCache.expiresAt > now) {
    return memoryExistenciasCache.data;
  }

  const map = new Map<string, number>();
  try {
    const token = await getFoxDataToken();
    const res = await fetch(`${API_BASE}/api/v1/syn/existencias/deposito/${DEPOSITO_BODEGON}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FOXDATA_HEADERS,
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    });
    if (!res.ok) return map;
    const json = await res.json();
    const list = json.data || json || [];
    list.forEach((item: { codArticulo?: string; existencia?: number }) => {
      if (item.codArticulo) {
        map.set(item.codArticulo, Number(item.existencia ?? 0));
      }
    });
    memoryExistenciasCache = { data: map, expiresAt: now + 60000 };
  } catch {
    // Si la conexión no responde, continúa con existencias del producto
  }
  return map;
}

const DEFAULT_SUBGROUP_BY_GROUP: Record<string, string> = {
  '01': '01',   // WHISKY IMP.
  '02': '1000', // REFRESCO
  '03': '01',   // HIELOS
  '05': '1000', // CONFITERIA
  '07': '1000', // CARBON
  '08': '01',   // AGUA MINERAL
  '09': '1000', // CVZA NAC
  '10': '01',   // VARIOS
  '11': '01',   // DELICATECES
  '12': '01',   // SERVICIO
  '14': '150',  // JUGOS
};

/**
 * Obtiene y adapta los artículos reales de FoxData por grupo y subgrupo opcional (Cache 60 seg).
 * 100% basado en la API real de FoxData / SmartVentas.
 */
export async function fetchArticulosSmartVentas(
  codGrupo: string = '01',
  codSubgrupo?: string
): Promise<Product[]> {
  const now = Date.now();
  const cacheKey = `${codGrupo}-${codSubgrupo || 'todos'}`;
  const cached = memoryProductsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const token = await getFoxDataToken();

    let targetSub: string | undefined = codSubgrupo && codSubgrupo !== 'todos' ? codSubgrupo : DEFAULT_SUBGROUP_BY_GROUP[codGrupo];
    if (!targetSub) {
      const subs = await fetchSubgruposInv(codGrupo);
      if (subs && subs.length > 0) {
        targetSub = (subs[0] as { CodSubgrupo?: string }).CodSubgrupo;
      }
    }

    let url = `${API_BASE}/api/v1/syn/articulos/grupo/${codGrupo}`;
    if (targetSub) {
      url += `?codSubgrupo=${targetSub}`;
    }

    const [articulosRes, existenciasMap, imagesMap] = await Promise.all([
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FOXDATA_HEADERS,
        },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 60 },
      }),
      fetchExistenciasBodegonMap(),
      getProductImagesMap(),
    ]);

    if (!articulosRes.ok) {
      memoryProductsCache.set(cacheKey, { data: [], expiresAt: now + 30000 });
      return [];
    }

    const json = await articulosRes.json();
    const rawList: RawFoxDataProductDto[] = json.data || json || [];
    const adapted = adaptFoxDataProducts(rawList, existenciasMap, imagesMap);
    memoryProductsCache.set(cacheKey, { data: adapted, expiresAt: now + 60000 });
    return adapted;
  } catch {
    memoryProductsCache.set(cacheKey, { data: [], expiresAt: now + 30000 });
    return [];
  }
}

const memoryProductByIdCache = new Map<string, CacheItem<Product | null>>();

/**
 * Busca un producto individual por ID (codArticulo o SKU) en SmartVentas (Cache 60s)
 */
export async function fetchProductById(
  id: string,
  groupHint?: string
): Promise<Product | null> {
  const now = Date.now();
  const cacheKey = `${id}-${groupHint || 'any'}`;
  const cached = memoryProductByIdCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    if (groupHint) {
      const products = await fetchArticulosSmartVentas(groupHint);
      const match = products.find((p) => p.id === id || p.sku === id);
      if (match) {
        memoryProductByIdCache.set(cacheKey, { data: match, expiresAt: now + 60000 });
        return match;
      }
    }

    const priorityGroups = ['01', '02', '09', '11', '05', '14', '08', '03'];
    for (const grupo of priorityGroups) {
      if (grupo === groupHint) continue;
      const products = await fetchArticulosSmartVentas(grupo);
      const match = products.find((p) => p.id === id || p.sku === id);
      if (match) {
        memoryProductByIdCache.set(cacheKey, { data: match, expiresAt: now + 60000 });
        return match;
      }
    }

    memoryProductByIdCache.set(cacheKey, { data: null, expiresAt: now + 30000 });
    return null;
  } catch {
    return null;
  }
}

/**
 * Busca artículos en SmartVentas coincidentes por nombre, marca o SKU
 */
export async function searchProducts(
  query: string,
  codGrupo?: string
): Promise<Product[]> {
  const term = query.toLowerCase().trim();
  if (!term) return [];

  try {
    const targetGroups = codGrupo && codGrupo !== 'all'
      ? [codGrupo]
      : ['01', '02', '09', '11', '05', '14', '08', '03'];

    const groupPromises = targetGroups.map((g) => fetchArticulosSmartVentas(g));
    const results = await Promise.all(groupPromises);
    const allProducts = results.flat();

    const matches = allProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });

    matches.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    });

    return matches;
  } catch {
    return [];
  }
}
