import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This proxy restricts direct access to the HRMS module
// It will only allow requests that come with a valid auth_token or are from the HMS Gateway

export function proxy(request: NextRequest) {
  const { headers } = request;
  const referer = headers.get('referer') || '';
  const authToken = request.cookies.get('furfield_token')?.value || 
                    request.nextUrl.searchParams.get('auth_token');
  
  // Allow requests from HMS Gateway
  if (referer.includes('localhost:6900')) {
    return NextResponse.next();
  }
  
  // Allow requests with auth token
  if (authToken) {
    // Store the token in a cookie if it came from a URL parameter
    if (request.nextUrl.searchParams.has('auth_token')) {
      const response = NextResponse.next();
      response.cookies.set('furfield_token', authToken, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
      });
      
      // Remove the token from the URL for security
      const url = new URL(request.url);
      url.searchParams.delete('auth_token');
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  }
  
  // If API request, return 401
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
  
  // Otherwise redirect to HMS Gateway
  return NextResponse.redirect(new URL('http://localhost:6900/'));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};