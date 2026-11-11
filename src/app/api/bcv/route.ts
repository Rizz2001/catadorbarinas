import { NextResponse } from 'next/server';
import { fetchBcvRateFromDolarApi } from '@/services/bcv.service';
import { getStoreConfigServer } from '@/services/cms.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const storeConfig = await getStoreConfigServer();
    if (
      storeConfig?.bcv_usar_manual &&
      typeof storeConfig.bcv_tasa_manual === 'number' &&
      storeConfig.bcv_tasa_manual > 0
    ) {
      return NextResponse.json(
        {
          rate: Number(storeConfig.bcv_tasa_manual.toFixed(4)),
          lastUpdated: storeConfig.updated_at || new Date().toISOString(),
          source: 'Oficial' as const,
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const rateInfo = await fetchBcvRateFromDolarApi();
    return NextResponse.json(rateInfo, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error en /api/bcv:', error);
    return NextResponse.json(
      { error: 'Error al obtener la tasa oficial BCV' },
      { status: 500 }
    );
  }
}
