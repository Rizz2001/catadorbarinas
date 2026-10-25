import { BcvRateInfo } from '@/types';
import { DEFAULT_BCV_RATE } from '@/lib/currency';

interface DolarApiResponseItem {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

const DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares';

/**
 * Consulta la tasa oficial del BCV desde DolarApi (https://ve.dolarapi.com/v1/dolares).
 * Filtra el registro con fuente === 'oficial' correspondiente a la tasa oficial del Banco Central de Venezuela.
 */
export async function fetchBcvRateFromDolarApi(): Promise<BcvRateInfo> {
  try {
    const res = await fetch(DOLAR_API_URL, {
      next: { revalidate: 1800 }, // Revalida cada 30 minutos en Next.js
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`DolarApi respondió con HTTP ${res.status}`);
    }

    const data: DolarApiResponseItem[] = await res.json();
    const oficial = Array.isArray(data) ? data.find((item) => item.fuente === 'oficial') : null;

    if (!oficial || typeof oficial.promedio !== 'number' || oficial.promedio <= 0) {
      throw new Error('No se encontró el registro oficial en la respuesta de DolarApi');
    }

    return {
      rate: Number(oficial.promedio.toFixed(4)),
      lastUpdated: oficial.fechaActualizacion || new Date().toISOString(),
      source: 'BCV',
    };
  } catch (error) {
    console.error('Error al consultar DolarApi para tasa oficial BCV:', error);
    return {
      rate: DEFAULT_BCV_RATE,
      lastUpdated: new Date().toISOString(),
      source: 'BCV',
    };
  }
}
