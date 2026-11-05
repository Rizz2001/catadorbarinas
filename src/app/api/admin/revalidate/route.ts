import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateServerCmsCache } from '@/services/cms.server';

export async function POST() {
  try {
    invalidateServerCmsCache();
    revalidatePath('/');
    revalidatePath('/catalogo');
    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

