import { NextResponse } from 'next/server';
import { removeAuthCookieOnResponse } from '@/lib/auth';

export async function POST() {
  try {
    console.log('[Logout API] Processing logout request');

    const response = NextResponse.json({ success: true });
    removeAuthCookieOnResponse(response);
    console.log('[Logout API] Cookie removed successfully');
    return response;
  } catch (error) {
    console.error('[Logout API] Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
