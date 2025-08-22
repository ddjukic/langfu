import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'langfu-development-secret-key-2024'
);

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'langfu-auth';

export interface UserPayload {
  id: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Type guard to ensure payload has required properties
    if (payload && typeof payload === 'object' && 'id' in payload && 'email' in payload) {
      return payload as unknown as UserPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    console.log('[Auth] Cookie set successfully');
  } catch (error) {
    console.error('[Auth] Failed to set cookie:', error);
    throw error;
  }
}

export function setAuthCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (cookie?.value) {
      console.log('[Auth] Cookie retrieved successfully');
    } else {
      console.log('[Auth] No auth cookie found');
    }
    return cookie?.value;
  } catch (error) {
    console.error('[Auth] Failed to get cookie:', error);
    return undefined;
  }
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function removeAuthCookieOnResponse(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();

    if (!token) {
      console.log('[Auth] No token found in getCurrentUser');
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload) {
      console.log('[Auth] Token verification failed in getCurrentUser');
      return null;
    }

    let user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        currentLanguage: true,
        dailyGoal: true,
      },
    });

    if (user) {
      console.log('[Auth] User found:', user.email);
    } else {
      console.log('[Auth] User not found in database');
      // Attempt recovery by email (database reset with stale token scenario)
      if (payload.email) {
        const recovered = await prisma.user.findUnique({
          where: { email: payload.email },
          select: {
            id: true,
            email: true,
            name: true,
            currentLanguage: true,
            dailyGoal: true,
          },
        });
        if (recovered) {
          console.log('[Auth] Recovered user by email, rotating token');
          const newToken = await createToken({ id: recovered.id, email: recovered.email });
          await setAuthCookie(newToken);
          user = recovered;
        }
      }
    }

    return user;
  } catch (error) {
    console.error('[Auth] Error in getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
