import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { client } from './sanity/lib/server-client';

let comingSoonCache: {
  value: boolean;
  lastFetched: number;
} = {
  value: false,
  lastFetched: 0,
};

const isCacheValid = () => {
  return Date.now() - comingSoonCache.lastFetched < 60000; // 1 minute
};

async function getComingSoonStatus() {
  if (isCacheValid()) {
    return comingSoonCache.value;
  }

  try {
    const result = await client.fetch(
      `*[_type == "siteSettings"][0].isComingSoon`
    );
    comingSoonCache = {
      value: result,
      lastFetched: Date.now(),
    };
    return result;
  } catch (error) {
    console.error('Failed to fetch coming soon status:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Debug current path
  // console.log('Current path:', request.nextUrl.pathname);

  // Always allow access to these paths
  const publicPaths = ['/login', '/api/login', '/studio', '/coming-soon'];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    // console.log('Public path detected, allowing access');
    return NextResponse.next();
  }

  const isComingSoon = await getComingSoonStatus();
  // console.log('Coming soon status:', isComingSoon);

  const hasAdminAccess = request.cookies.has(process.env.PASSWORD_COOKIE_NAME!);
  // console.log('Has admin access:', hasAdminAccess);
  // console.log('Cookie name being checked:', process.env.PASSWORD_COOKIE_NAME);

  // If site is coming soon and user is not admin, show coming soon page
  if (isComingSoon && !hasAdminAccess) {
    // console.log('Redirecting to login');
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  console.log('Allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
