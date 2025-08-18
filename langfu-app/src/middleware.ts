import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];
  const isPublicPath = publicPaths.some(p => path.startsWith(p));
  
  // Check for auth cookie
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME || 'langfu-auth');
  
  // Redirect logic
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
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