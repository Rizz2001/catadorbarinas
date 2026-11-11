import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateServerCmsCache } from '@/services/cms.server';
import {
  invalidateClientCmsCaches,
  invalidateProductCmsConfigCache,
} from '@/services/cms.service';

export async function POST() {
  try {
    invalidateServerCmsCache();
    invalidateClientCmsCaches();
    invalidateProductCmsConfigCache();
    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/catalogo/[[...slug]]', 'page');
    revalidatePath('/producto/[id]', 'page');
    revalidatePath('/preguntas-frecuentes');
    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

