import { Product } from '../types';
import { adaptFoxDataProducts, RawFoxDataProductDto } from '../adapters/foxdata.adapter';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Obtiene o reutiliza el Bearer Token de autenticación OAuth2 de FoxData
 */
async function getFoxDataToken(): Promise<string> {
  const now = Date.now();
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

  const res = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    next: { revalidate: 3000 },
  });

  if (!res.ok) {
    throw new Error(`Error en autenticación FoxData: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const expiresInMs = (data.expires_in || 3600) * 1000;
  cachedToken = {
    token: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return data.access_token;
}

const API_BASE = process.env.FOXDATA_API_BASE_URL || 'https://n1.apismartventas.foxdata.app';
const DEPOSITO_BODEGON = process.env.FOXDATA_DEPOSITO_BODEGON || '01';

/**
 * Obtiene los grupos de inventario de SmartVentas
 */
export async function fetchGruposInv() {
  const token = await getFoxDataToken();
  const res = await fetch(`${API_BASE}/api/v1/syn/gruposinv`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || json || [];
}

/**
 * Obtiene los subgrupos de un grupo específico
 */
export async function fetchSubgruposInv(codGrupo: string) {
  const token = await getFoxDataToken();
  const res = await fetch(`${API_BASE}/api/v1/syn/gruposinvsub/grupo/${codGrupo}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || json || [];
}

/**
 * Obtiene el mapa de existencias del depósito Bodegón (01)
 */
export async function fetchExistenciasBodegonMap(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const token = await getFoxDataToken();
    const res = await fetch(`${API_BASE}/api/v1/syn/existencias/deposito/${DEPOSITO_BODEGON}`, {
      headers: { Authorization: `Bearer ${token}` },
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
  } catch (err) {
    console.error('Error cargando existencias de Bodegón 01:', err);
  }
  return map;
}

/**
 * Obtiene y adapta los artículos reales de FoxData por grupo y subgrupo opcional
 */
export async function fetchArticulosSmartVentas(
  codGrupo: string = '01',
  codSubgrupo?: string
): Promise<Product[]> {
  try {
    const token = await getFoxDataToken();
    let url = `${API_BASE}/api/v1/syn/articulos/grupo/${codGrupo}`;
    if (codSubgrupo && codSubgrupo !== 'todos') {
      url += `?codSubgrupo=${codSubgrupo}`;
    }

    const [articulosRes, existenciasMap] = await Promise.all([
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
      fetchExistenciasBodegonMap(),
    ]);

    if (!articulosRes.ok) {
      console.warn(`FoxData respondió ${articulosRes.status} al consultar artículos de grupo ${codGrupo}`);
      return [];
    }

    const json = await articulosRes.json();
    const rawList: RawFoxDataProductDto[] = json.data || json || [];

    return adaptFoxDataProducts(rawList, existenciasMap);
  } catch (err) {
    console.error('Error obteniendo artículos de FoxData:', err);
    return [];
  }
}
