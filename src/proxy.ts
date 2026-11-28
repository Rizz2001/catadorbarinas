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
     * Coincide con todas las rutas excepto archivos estáticos, imágenes, favicon, SW y manifest PWA
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
