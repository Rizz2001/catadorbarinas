import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminUser } from '@/lib/supabase/api-auth';
import { invalidateServerCmsCache } from '@/services/cms.server';
import {
  invalidateClientCmsCaches,
  invalidateProductCmsConfigCache,
} from '@/services/cms.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  try {
    invalidateServerCmsCache();
    invalidateClientCmsCaches();
    invalidateProductCmsConfigCache();
    revalidateTag('foxdata-catalog', 'max');
    revalidateTag('cms', 'max');
    revalidatePath('/');
    revalidatePath('/catalogo');
    revalidatePath('/catalogo/[...slug]', 'page');
    revalidatePath('/producto/[id]', 'page');
    revalidatePath('/preguntas-frecuentes');
    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error al revalidar caché';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
