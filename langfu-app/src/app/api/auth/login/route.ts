import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookieOnResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('[Login API] Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[Login API] User not found:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      console.log('[Login API] Invalid password for:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create token
    const token = await createToken({
      id: user.id,
      email: user.email,
    });
    console.log('[Login API] Token created successfully');

    // Build response and set cookie on it
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currentLanguage: user.currentLanguage,
      },
    });
    setAuthCookieOnResponse(response, token);
    console.log('[Login API] Cookie set on response');

    // Update or create progress for current language
    await prisma.progress.upsert({
      where: {
        userId_language: {
          userId: user.id,
          language: user.currentLanguage,
        },
      },
      update: {
        lastPractice: new Date(),
      },
      create: {
        userId: user.id,
        language: user.currentLanguage,
      },
    });

    console.log('[Login API] Login successful for:', email);
    return response;
  } catch (error) {
    console.error('[Login API] Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
