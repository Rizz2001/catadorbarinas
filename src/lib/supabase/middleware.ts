import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Manejador oficial de sesión en Middleware con @supabase/ssr.
 * Refresca cookies expiradas y protege rutas de /cuenta y /admin.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
        );
      },
    },
  });

  // Validar sesión contra el servidor Auth de Supabase (NUNCA usar getSession en middleware)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Helper para preservar cookies de sesión refrescadas en cualquier redirección
  const createRedirectWithCookies = (url: URL | string) => {
    const redirectResponse = NextResponse.redirect(typeof url === 'string' ? new URL(url, request.url) : url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    });
    return redirectResponse;
  };

  const pathname = request.nextUrl.pathname;

  // 1. Protección de rutas administrativas (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createRedirectWithCookies(loginUrl);
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!perfil || (perfil as { rol: string }).rol !== 'admin') {
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return createRedirectWithCookies(homeUrl);
    }
  }

  // 2. Protección de rutas de cuenta de cliente (/cuenta/*)
  if (pathname.startsWith('/cuenta')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createRedirectWithCookies(loginUrl);
    }
  }

  // 3. Si el usuario ya está autenticado e intenta acceder a /login o /registro
  if (pathname === '/login' || pathname === '/registro') {
    if (user) {
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/')) {
        return createRedirectWithCookies(redirectParam);
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (perfil && (perfil as { rol: string }).rol === 'admin') {
        return createRedirectWithCookies('/admin/pedidos');
      }

      return createRedirectWithCookies('/cuenta');
    }
  }

  return supabaseResponse;
}
