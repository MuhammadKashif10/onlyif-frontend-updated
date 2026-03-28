import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Legacy `/browse` → `/buy` (query string preserved). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/browse' || pathname === '/browse/' || pathname.startsWith('/browse/')) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === '/browse' || pathname === '/browse/'
        ? '/buy'
        : pathname.replace(/^\/browse/, '/buy');
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/browse', '/browse/:path*'],
};
