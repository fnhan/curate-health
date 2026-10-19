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

/*
 * `proxy`, not `middleware`. Next 16 deprecated the middleware convention in
 * favour of this one, and the rename is not only a name: **proxy runs on the
 * nodejs runtime and that is not configurable**, where middleware ran on the
 * edge.
 *
 * What that costs here: a cold start is slower than an edge isolate, on the
 * one thing every request passes through. What it buys: ordinary Node, so the
 * Sanity client and the cache below behave the way they read, and the module
 * scope persists across requests on a warm instance rather than being thrown
 * away per isolate, which means fewer fetches for the same 60 second window.
 *
 * Done on its own, after the framework upgrade rather than inside it, because
 * this gates every request on the site: if it is wrong, nothing is reachable.
 */
export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isCrawler =
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler");

  // Always allow access to these paths
  const publicPaths = [
    "/login",
    "/api/login",
    // The Sanity revalidation webhook. Without this the matcher below catches
    // it, and when coming soon mode is on the POST is redirected to
    // /coming-soon and the purge never runs. The endpoint authenticates itself
    // by signature, so it does not need the coming soon gate. See CH-026.
    "/api/revalidate",
    "/studio",
    "/coming-soon",
    /*
     * With the leading slash. It was "sitemap.xml" for as long as this file
     * has existed, and `"/sitemap.xml".startsWith("sitemap.xml")` is false, so
     * the entry never matched and the sitemap was never actually allowlisted.
     * Invisible until somebody turns coming soon mode on, at which point a
     * crawler asking for the sitemap is sent to /coming-soon instead.
     *
     * Fixed here because these are the lines being rewritten anyway. It
     * changes nothing while coming soon mode is off, which it is.
     *
     * Note robots.txt, llms.txt and rss.xml are still not on this list. That
     * looks like the same oversight and is not: what a hidden site should
     * still serve is Frank's call, not a typo.
     */
    "/sitemap.xml",
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
          "Retry-After": "86400", // 24 hours
        },
      });
    }

    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
