import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { middlewareClient } from "./sanity/lib/middleware-client";

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
    const result = await middlewareClient.fetch(
      `*[_type == "siteSettings"][0].isComingSoon`
    );
    comingSoonCache = {
      value: result,
      lastFetched: Date.now(),
    };
    return result;
  } catch (error) {
    console.error("Failed to fetch coming soon status:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isCrawler =
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler");

  // Always allow access to these paths
  const publicPaths = [
    "/login",
    "/api/login",
    "/studio",
    "/coming-soon",
    "sitemap.xml",
  ];

  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    // console.log('Public path detected, allowing access');
    return NextResponse.next();
  }

  const isComingSoon = await getComingSoonStatus();
  const hasAdminAccess = request.cookies.has(process.env.PASSWORD_COOKIE_NAME!);

  // If site is coming soon and user is not admin, show coming soon page
  if (isComingSoon && !hasAdminAccess) {
    if (isCrawler) {
      return new NextResponse(null, {
        status: 503,
        headers: {
          'Retry-After': '86400', // 24 hours
        }
      });
    }

    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
