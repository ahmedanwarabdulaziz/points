import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Disabled for static export compatibility
// See: https://nextjs.org/docs/advanced-features/static-html-export
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

// Export empty matcher so middleware is effectively no-op during export
export const config = {
  matcher: [],
};
