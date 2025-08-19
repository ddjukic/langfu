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

  // Public routes that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';

  // Get auth token
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME || 'langfu-auth');

  // Verify token validity
  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token.value, JWT_SECRET);
      isValidToken = true;
    } catch (error) {
      // Token is invalid
      isValidToken = false;
    }
  }

  // Routing logic
  if (!isValidToken && !isPublicPath) {
    // No valid token and trying to access protected route -> redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isValidToken && isPublicPath) {
    // Has valid token and on login/register page -> redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other cases, continue
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
