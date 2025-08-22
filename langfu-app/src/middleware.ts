import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'langfu-development-secret-key-2024'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.includes('.') // Files with extensions (favicon.ico, etc.)
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing path: ${path}`);

  // Public routes that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';

  // Get auth token
  const cookieName = process.env.AUTH_COOKIE_NAME || 'langfu-auth';
  const token = request.cookies.get(cookieName);

  console.log(`[Middleware] Cookie name: ${cookieName}, Token exists: ${!!token}`);

  // Verify token validity
  let isValidToken = false;
  if (token) {
    try {
      const result = await jwtVerify(token.value, JWT_SECRET);
      isValidToken = true;
      console.log('[Middleware] Token verified successfully');
    } catch (error) {
      // Token is invalid
      isValidToken = false;
      console.error('[Middleware] Token verification failed:', error);
    }
  } else {
    console.log('[Middleware] No token found');
  }

  // Routing logic
  if (!isValidToken && !isPublicPath) {
    // No valid token and trying to access protected route -> redirect to login
    console.log('[Middleware] Redirecting to login (no valid token)');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // If token exists, still allow access to login/register so stale tokens can be replaced

  // For all other cases, continue
  console.log('[Middleware] Allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
