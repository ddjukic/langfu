import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookieOnResponse } from '@/lib/auth';
import { Language } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        currentLanguage: Language.GERMAN,
      },
    });

    // Create initial progress
    await prisma.progress.create({
      data: {
        userId: user.id,
        language: Language.GERMAN,
      },
    });

    // Create token and set cookie
    const token = await createToken({
      id: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currentLanguage: user.currentLanguage,
      },
    });
    setAuthCookieOnResponse(response, token);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
