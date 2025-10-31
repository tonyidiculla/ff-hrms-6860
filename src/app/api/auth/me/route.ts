import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Proxy endpoint to HMS auth service
 * Maintains architecture where HMS handles authentication
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[HRMS Auth Proxy] Forwarding auth request to HMS...');
    
    // Get all cookies to forward to HMS
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Forward request to HMS auth service
    const hmsResponse = await fetch('http://localhost:6900/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!hmsResponse.ok) {
      console.error('[HRMS Auth Proxy] HMS auth failed:', hmsResponse.status);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: hmsResponse.status }
      );
    }

    const userData = await hmsResponse.json();
    console.log('[HRMS Auth Proxy] Received user data from HMS:', {
      email: userData.email,
      employee_entity_id: userData.employee_entity_id,
      entity_platform_id: userData.entity_platform_id
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('[HRMS Auth Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
