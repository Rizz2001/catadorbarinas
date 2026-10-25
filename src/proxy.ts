import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto archivos estáticos, imágenes y favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
