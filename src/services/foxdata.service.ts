import { Product } from '../types';
import { adaptFoxDataProducts, RawFoxDataProductDto } from '../adapters/foxdata.adapter';
import { getProductImagesMap, getProductCmsConfigsMap, getStoreConfig } from './cms.service';
import {
  DEFAULT_GROUPS,
  DEFAULT_SUBGROUPS,
} from '@/constants/fallback-products';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;
let inflightTokenPromise: Promise<string> | null = null;

const FOXDATA_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  Connection: 'close',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GranCatador/1.0',
};

/**
 * Helper resiliente con reintentos automáticos ante cierres de socket (UND_ERR_SOCKET)
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } },
  retries = 2,
  timeoutMs = 7000
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 180 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Obtiene o reutiliza el Bearer Token OAuth2 de FoxData con deduplicación de promesas en vuelo
 */
async function getFoxDataToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  if (inflightTokenPromise) {
    return inflightTokenPromise;
  }

  const authUrl = process.env.FOXDATA_AUTH_URL || 'https://auth.foxdata.app/connect/token';
  const clientId = process.env.FOXDATA_CLIENT_ID || 'smvt-apiweb-C0006';
  const clientSecret = process.env.FOXDATA_CLIENT_SECRET || 'i84so7BEzsUo';
  const scope =
    process.env.FOXDATA_SCOPE ||
    'smartventas-api smartventas.service.read smartventas.service.write smartventas.common.read';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', scope);

  inflightTokenPromise = (async () => {
    try {
      const res = await fetchWithRetry(
        authUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...FOXDATA_HEADERS,
          },
          body: params.toString(),
          next: { revalidate: 3000 },
        },
        2,
        6000
      );

      if (!res.ok) {
        throw new Error(`Error en autenticación FoxData: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const expiresInMs = (data.expires_in || 3600) * 1000;
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + expiresInMs,
      };

      return data.access_token as string;
    } finally {
      inflightTokenPromise = null;
    }
  })();

  return inflightTokenPromise;
}

const API_BASE = process.env.FOXDATA_API_BASE_URL || 'https://n1.apismartventas.foxdata.app';
const DEPOSITO_BODEGON = process.env.FOXDATA_DEPOSITO_BODEGON || '01';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

const memoryRawGroupCache = new Map<string, CacheItem<RawFoxDataProductDto[]>>();
const inflightRawGroupPromises = new Map<string, Promise<RawFoxDataProductDto[]>>();
let memoryExistenciasCache: CacheItem<Map<string, number>> | null = null;
let inflightExistenciasPromise: Promise<Map<string, number>> | null = null;
let memoryGroupsCache: CacheItem<{ CodGrupo: string; Nombre: string; SmartVentas?: number }[]> | null = null;
const memorySubgroupsCache = new Map<
  string,
  CacheItem<{ CodGrupo: string; CodSubgrupo: string; Nombre: string }[]>
>();

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
    const res = await fetchWithRetry(
      `${API_BASE}/api/v1/syn/gruposinv`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FOXDATA_HEADERS,
        },
        next: { revalidate: 300 },
      },
      2,
      5000
    );
    if (!res.ok) return DEFAULT_GROUPS;
    const json = await res.json();
    const list = json.data || json || [];
    const activeList = Array.isArray(list)
      ? list.filter((g: { SmartVentas?: number }) => g.SmartVentas === 1 || g.SmartVentas === undefined)
      : [];
    const result = activeList.length > 0 ? activeList : DEFAULT_GROUPS;
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
    const res = await fetchWithRetry(
      `${API_BASE}/api/v1/syn/gruposinvsub/grupo/${codGrupo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FOXDATA_HEADERS,
        },
        next: { revalidate: 300 },
      },
      2,
      5000
    );
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
 * Obtiene el mapa de existencias del depósito Bodegón (01) (Cache 2 min con deduplicación)
 */
export async function fetchExistenciasBodegonMap(): Promise<Map<string, number>> {
  const now = Date.now();
  if (memoryExistenciasCache && memoryExistenciasCache.expiresAt > now) {
    return memoryExistenciasCache.data;
  }

  if (inflightExistenciasPromise) {
    return inflightExistenciasPromise;
  }

  inflightExistenciasPromise = (async () => {
    const map = new Map<string, number>();
    try {
      const token = await getFoxDataToken();
      const res = await fetchWithRetry(
        `${API_BASE}/api/v1/syn/existencias/deposito/${DEPOSITO_BODEGON}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...FOXDATA_HEADERS,
          },
          next: { revalidate: 120 },
        },
        2,
        7000
      );
      if (!res.ok) return map;
      const json = await res.json();
      const list = json.data || json || [];
      list.forEach((item: { codArticulo?: string; existencia?: number }) => {
        if (item.codArticulo) {
          map.set(item.codArticulo, Number(item.existencia ?? 0));
        }
      });
      if (map.size > 0) {
        memoryExistenciasCache = { data: map, expiresAt: Date.now() + 120000 };
      }
    } catch {
      // Si la conexión no responde, continúa con existencias del producto
    } finally {
      inflightExistenciasPromise = null;
    }
    return map;
  })();

  return inflightExistenciasPromise;
}

/**
 * Descarga y cachea los DTOs crudos de un grupo en FoxData (Cache 3 min).
 */
async function fetchRawGroupArticulos(codGrupo: string): Promise<RawFoxDataProductDto[]> {
  const now = Date.now();
  const cached = memoryRawGroupCache.get(codGrupo);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const inflight = inflightRawGroupPromises.get(codGrupo);
  if (inflight) {
    return inflight;
  }

  const promise = (async () => {
    try {
      const token = await getFoxDataToken();
      const url = `${API_BASE}/api/v1/syn/articulos/grupo/${codGrupo}`;

      const articulosRes = await fetchWithRetry(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...FOXDATA_HEADERS,
          },
          next: { revalidate: 120 },
        },
        2,
        8000
      );

      if (!articulosRes.ok) {
        return [];
      }

      const json = await articulosRes.json();
      const rawList: RawFoxDataProductDto[] = json.data || json || [];

      if (Array.isArray(rawList) && rawList.length > 0) {
        memoryRawGroupCache.set(codGrupo, {
          data: rawList,
          expiresAt: Date.now() + 180000,
        });
      }
      return Array.isArray(rawList) ? rawList : [];
    } catch {
      return [];
    } finally {
      inflightRawGroupPromises.delete(codGrupo);
    }
  })();

  inflightRawGroupPromises.set(codGrupo, promise);
  return promise;
}

/**
 * Obtiene y adapta TODOS los artículos de un grupo completo en FoxData fusionando
 * en tiempo real fotos CMS, existencias del Depósito 01 y configuraciones del CMS.
 */
async function fetchFullGroupArticulos(
  codGrupo: string,
  includeHidden = false
): Promise<Product[]> {
  const [rawList, existenciasMap, imagesMap, cmsConfigMap, storeConfig] = await Promise.all([
    fetchRawGroupArticulos(codGrupo),
    fetchExistenciasBodegonMap(),
    getProductImagesMap(),
    getProductCmsConfigsMap(),
    getStoreConfig(),
  ]);

  const globalAllowBackorder = Boolean(storeConfig?.permitir_venta_sin_stock_global);

  return adaptFoxDataProducts(
    rawList,
    existenciasMap,
    imagesMap,
    cmsConfigMap,
    globalAllowBackorder,
    includeHidden
  );
}

/**
 * Obtiene y adapta los artículos reales de FoxData por grupo y subgrupo opcional.
 * Al cachear el grupo completo, el filtrado por subgrupo es instantáneo (0ms) y devuelve el 100% del inventario.
 */
export async function fetchArticulosSmartVentas(
  codGrupo: string = '01',
  codSubgrupo?: string,
  includeHidden = false
): Promise<Product[]> {
  const allGroupProducts = await fetchFullGroupArticulos(codGrupo, includeHidden);

  if (!codSubgrupo || codSubgrupo === 'todos') {
    return allGroupProducts;
  }

  const targetSub = String(codSubgrupo).trim();
  const filtered = allGroupProducts.filter(
    (p) => String(p.codSubgrupo || '').trim() === targetSub
  );

  return filtered;
}

const ALL_ACTIVE_GROUPS = ['01', '02', '09', '11', '05', '14', '08', '03', '06', '10', '07', '04'];

/**
 * Busca un producto individual por ID (codArticulo o SKU) en SmartVentas
 */
export async function fetchProductById(
  id: string,
  groupHint?: string
): Promise<Product | null> {
  try {
    if (groupHint) {
      const products = await fetchFullGroupArticulos(groupHint, false);
      const match = products.find((p) => p.id === id || p.sku === id);
      if (match) return match;
    }

    for (const grupo of ALL_ACTIVE_GROUPS) {
      if (grupo === groupHint) continue;
      const products = await fetchFullGroupArticulos(grupo, false);
      const match = products.find((p) => p.id === id || p.sku === id);
      if (match) return match;
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca artículos en SmartVentas por nombre, marca, SKU, categoría o subcategoría exacta
 */
export async function searchProducts(
  query: string,
  codGrupo?: string,
  includeHidden = false
): Promise<Product[]> {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  try {
    const targetGroups =
      codGrupo && codGrupo !== 'all' ? [codGrupo] : ALL_ACTIVE_GROUPS;

    const allProducts: Product[] = [];

    const batchSize = 4;
    for (let i = 0; i < targetGroups.length; i += batchSize) {
      const batch = targetGroups.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((g) => fetchFullGroupArticulos(g, includeHidden))
      );
      allProducts.push(...batchResults.flat());
    }

    const matches = allProducts.filter((p) => {
      const searchable = normalizeSearchText(
        `${p.name} ${p.brand} ${p.category} ${p.sku} ${p.description}`
      );
      return tokens.every((tk) => searchable.includes(tk));
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

/**
 * Obtiene los productos curados desde el CMS para "1. Tendencias" y "2. Ofertas Destacadas",
 * completando automáticamente con inventario real en stock cuando sea necesario.
 */
export async function fetchHomeCuratedSections(): Promise<{
  dealsProducts: Product[];
  trendsProducts: Product[];
}> {
  const primaryGroups = ['01', '09', '02', '11', '05'];
  const groupLists = await Promise.all(primaryGroups.map((g) => fetchFullGroupArticulos(g, false)));
  const pool = groupLists.flat();
  const inStockPool = pool.filter((p) => p.inStock && p.priceUsd > 0);
  const basePool = inStockPool.length >= 6 ? inStockPool : pool;

  const cmsDeals = basePool.filter((p) => p.isDealOfTheDay);
  const cmsTrends = basePool.filter((p) => p.isWeeklyTrend);

  const dealsProducts = [...cmsDeals];
  for (const item of basePool) {
    if (dealsProducts.length >= 8) break;
    if (!dealsProducts.some((d) => d.id === item.id)) {
      dealsProducts.push(item);
    }
  }

  const trendsProducts = [...cmsTrends];
  for (const item of basePool) {
    if (trendsProducts.length >= 12) break;
    if (!trendsProducts.some((t) => t.id === item.id)) {
      trendsProducts.push(item);
    }
  }

  return { dealsProducts, trendsProducts };
}
