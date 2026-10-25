import { NextResponse } from 'next/server';
import { fetchBcvRateFromDolarApi } from '@/services/bcv.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rateInfo = await fetchBcvRateFromDolarApi();
    return NextResponse.json(rateInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
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
