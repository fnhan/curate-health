/**
 * CH-012 acceptance check: every response carries the security headers, and
 * carries exactly one Content-Security-Policy.
 *
 *   node scripts/audit-security-headers.js                       # localhost:3000
 *   node scripts/audit-security-headers.js http://localhost:3111
 *   node scripts/audit-security-headers.js https://www.curatehealth.ca
 *   node scripts/audit-security-headers.js http://localhost:3111 --dev
 *
 * Pass --dev against a `next dev` server. next dev compiles and hot-reloads
 * with eval, so lib/security-headers.mjs adds 'unsafe-eval' to the site policy
 * in development on purpose. Without the flag this check fails on that, which
 * is correct: a production response carrying 'unsafe-eval' IS a defect, and the
 * check should not quietly accept one because it happened to be pointed at a
 * dev server.
 *
 * Exits 0 when every checked path passes, 1 otherwise.
 *
 * WHY IT COUNTS THE CSP HEADER RATHER THAN JUST READING IT
 *
 * Next applies every headers() entry whose source matches. A second
 * Content-Security-Policy does not replace the first, it is sent alongside it,
 * and the browser enforces the intersection of the two. Two policies that each
 * look right individually can therefore combine into one that blocks the
 * Studio, and nothing in the config or the build says so. Counting is the only
 * way to see it from outside.
 *
 * WHY IT CHECKS THE STUDIO SEPARATELY
 *
 * /studio needs 'unsafe-eval' and the site must not have it. If the two ever
 * collapse into one policy, the failure is either a broken Studio or an
 * unnecessarily loose site, and this is the check that tells you which.
 */

const DEFAULT_BASE = "http://localhost:3000";

/** One per headers() rule, plus the shapes most likely to slip past a rule. */
const PATHS = [
  { path: "/", policy: "site" },
  { path: "/contact", policy: "site" },
  { path: "/services", policy: "site" },
  { path: "/services/psychotherapy", policy: "site" },
  { path: "/blog", policy: "site" },
  // A path whose name merely starts with the excluded segment. The negative
  // lookahead is written against the segment, so this must get the site policy
  // rather than the Studio's.
  { path: "/studios-that-do-not-exist", policy: "site", allow404: true },
  { path: "/studio", policy: "studio" },
  { path: "/studio/structure", policy: "studio" },
];

const REQUIRED = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/** Directives that must be present on the public site, with what they stop. */
const SITE_MUST_HAVE = [
  ["base-uri", "injected markup retargeting every relative URL"],
  ["object-src 'none'", "plugin and object embedding"],
  ["frame-ancestors", "the site being framed"],
  ["form-action", "a form being repointed at another host"],
  ["upgrade-insecure-requests", "http subresources"],
];

async function head(url) {
  const res = await fetch(url, { method: "GET", redirect: "manual" });

  const location = res.headers.get("location") || "";
  if (location.includes("sso-api") || location.includes("vercel.com/login")) {
    throw new Error(
      `${url} is behind Vercel Deployment Protection. Verify on a local dev server instead.`
    );
  }

  // getSetCookie is the only header API that exposes repeats. For everything
  // else Node joins duplicates with ", ", so a doubled CSP arrives as one
  // string containing two policies. Splitting on the directive that always
  // starts a policy here is what makes a duplicate visible.
  const csp = res.headers.get("content-security-policy") || "";
  const cspCount = csp
    ? csp.split(/(?=default-src )/).filter(Boolean).length
    : 0;

  return { status: res.status, headers: res.headers, csp, cspCount };
}

async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes("--dev");
  const base = (args.find((a) => !a.startsWith("--")) || DEFAULT_BASE).replace(
    /\/$/,
    ""
  );
  const failures = [];

  for (const { path, policy, allow404 } of PATHS) {
    const r = await head(base + path);
    const problems = [];

    if (r.status >= 500) problems.push(`status ${r.status}`);
    if (r.status === 404 && !allow404) problems.push("404");

    for (const [key, want] of Object.entries(REQUIRED)) {
      const got = r.headers.get(key);
      if (got !== want) problems.push(`${key}=${got ?? "MISSING"}`);
    }

    if (!r.headers.get("permissions-policy")) {
      problems.push("permissions-policy=MISSING");
    }

    // Leaks the framework on every response. Removed by poweredByHeader.
    if (r.headers.get("x-powered-by")) {
      problems.push(`x-powered-by=${r.headers.get("x-powered-by")}`);
    }

    if (r.cspCount === 0) {
      problems.push("no Content-Security-Policy");
    } else if (r.cspCount > 1) {
      problems.push(
        `${r.cspCount} Content-Security-Policy headers, browser enforces the intersection`
      );
    }

    const hasEval = r.csp.includes("'unsafe-eval'");

    if (policy === "site") {
      // The Studio needs eval. The public site must not have it, and this is
      // the check that catches the two policies collapsing into one.
      if (hasEval && !isDev) {
        problems.push("'unsafe-eval' on a public page");
      }
      for (const [directive, stops] of SITE_MUST_HAVE) {
        if (!r.csp.includes(directive)) {
          problems.push(`missing ${directive}, which stops ${stops}`);
        }
      }
    }

    if (policy === "studio" && r.cspCount === 1 && !hasEval) {
      problems.push(
        "Studio policy without 'unsafe-eval', the Studio will not load"
      );
    }

    const label = `${String(r.status).padStart(3)} ${path.padEnd(28)} ${policy.padEnd(6)}`;
    if (problems.length) {
      failures.push({ path, problems });
      console.log(`${label} FAIL`);
      problems.forEach((p) => console.log(`      ${p}`));
    } else {
      console.log(`${label} ok`);
    }
  }

  if (failures.length) {
    console.log(`\n${failures.length} of ${PATHS.length} paths failed.`);
    process.exit(1);
  }

  console.log(
    `\nAll ${PATHS.length} paths carry the headers, one policy each.` +
      (isDev ? " (--dev: 'unsafe-eval' allowed on site pages)" : "")
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
