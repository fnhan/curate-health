/**
 * Acceptance checks for CH-001, CH-002, CH-022 and CH-023.
 *
 * Node rather than curl and python3, per the Windows environment note in
 * CLAUDE.md: PowerShell aliases curl to Invoke-WebRequest, which rejects curl's
 * flags, and python3 is not installed. This runs identically from PowerShell
 * and Git Bash.
 *
 *   node scripts/check-routes.js                        # production
 *   node scripts/check-routes.js http://localhost:3000  # a local next start
 *
 * Exits 1 if any check fails, 0 if all pass.
 */

const DEFAULT_BASE = "https://www.curatehealth.ca";

const FLOWPRESSO_TITLE = "FLOWpresso Therapy Toronto | Curate Health";

/**
 * Every check is {ticket, path, expect}. `expect` is one of:
 *   {status}                    exact status code
 *   {status, location}          exact status code and Location header, path only
 *   {status, titleIs}           exact status and exact <title> text
 *   {notServerError: true}      any response that is not 5xx
 */
const CHECKS = [
  // CH-001. An unknown slug is a 404, not a 500. Repeated 5xx costs crawl rate
  // across the whole domain. Slugs here are ones no redirect claims, so they
  // stay 404 after CH-002 and CH-022 land.
  {
    ticket: "CH-001",
    path: "/services/nonsense-slug",
    expect: { status: 404 },
  },
  {
    ticket: "CH-001",
    path: "/services/not-a-real-service",
    expect: { status: 404 },
  },
  {
    ticket: "CH-001",
    path: "/services/rehab/nonsense-treatment",
    expect: { status: 404 },
  },
  { ticket: "CH-001", path: "/blog/nonsense-slug", expect: { status: 404 } },
  {
    ticket: "CH-001",
    path: "/products/nonsense-slug",
    expect: { status: 404 },
  },
  { ticket: "CH-001", path: "/legal/nonsense-slug", expect: { status: 404 } },

  // CH-002. The four legacy service URLs 301 to their current homes. Before
  // CH-002 these were the 500s in CH-001, which is why the CH-001 check in
  // CLAUDE.md lists them.
  {
    ticket: "CH-002",
    path: "/services/primary-care",
    expect: { status: 301, location: "/services/rehab" },
  },
  {
    ticket: "CH-002",
    path: "/services/physiotherapy",
    expect: { status: 301, location: "/services/rehab/physiotherapy" },
  },
  {
    ticket: "CH-002",
    path: "/services/chiropractic",
    expect: { status: 301, location: "/services/rehab/chiropractic-care" },
  },
  {
    ticket: "CH-002",
    path: "/services/massage-therapy",
    expect: { status: 301, location: "/services/rehab/massage-therapy" },
  },
  // A redirect that lands on a 404 is not a fix, so check the targets resolve.
  { ticket: "CH-002", path: "/services/rehab", expect: { status: 200 } },
  {
    ticket: "CH-002",
    path: "/services/rehab/physiotherapy",
    expect: { status: 200 },
  },
  {
    ticket: "CH-002",
    path: "/services/rehab/chiropractic-care",
    expect: { status: 200 },
  },
  {
    ticket: "CH-002",
    path: "/services/rehab/massage-therapy",
    expect: { status: 200 },
  },

  // CH-022. The correct spelling serves, the typo redirects to it.
  {
    ticket: "CH-022",
    path: "/services/rehab/acupuncture",
    expect: { status: 200 },
  },
  {
    ticket: "CH-022",
    path: "/services/rehab/acupunture",
    expect: { status: 301, location: "/services/rehab/acupuncture" },
  },

  // CH-023. Correct spelling in the title tag, and no wrong spelling anywhere
  // in the rendered page.
  {
    ticket: "CH-023",
    path: "/services/recovery-sanctuary/flowpresso-therapy",
    expect: {
      status: 200,
      titleIs: FLOWPRESSO_TITLE,
      noSpellings: ["Flowpesso", "Flowspresso"],
    },
  },
];

function pathOf(location, base) {
  if (!location) return null;

  try {
    return new URL(location, base).pathname;
  } catch {
    return location;
  }
}

function titleOf(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;

  return match[1]
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function runCheck(base, check) {
  const url = `${base}${check.path}`;
  const failures = [];
  let detail = "";

  let response;
  try {
    response = await fetch(url, { redirect: "manual" });
  } catch (error) {
    return {
      ok: false,
      status: "ERR",
      detail: error.message,
      failures: [error.message],
    };
  }

  const { status } = response;
  const expect = check.expect;

  if (expect.notServerError && status >= 500) {
    failures.push(`server error ${status}`);
  }

  if (expect.status !== undefined && status !== expect.status) {
    failures.push(`want status ${expect.status}, got ${status}`);
  }

  if (expect.location !== undefined) {
    const got = pathOf(response.headers.get("location"), base);
    detail = `-> ${got ?? "(no Location)"}`;
    if (got !== expect.location) {
      failures.push(`want Location ${expect.location}, got ${got ?? "(none)"}`);
    }
  }

  if (expect.titleIs !== undefined || expect.noSpellings !== undefined) {
    const html = await response.text();

    if (expect.titleIs !== undefined) {
      const got = titleOf(html);
      detail = `title=${JSON.stringify(got)}`;
      if (got !== expect.titleIs) {
        failures.push(
          `want title ${JSON.stringify(expect.titleIs)}, got ${JSON.stringify(got)}`
        );
      }
    }

    for (const spelling of expect.noSpellings ?? []) {
      const hits = html.split(spelling).length - 1;
      if (hits > 0) {
        failures.push(`found ${hits}x "${spelling}" in the page`);
      }
    }
  }

  return { ok: failures.length === 0, status, detail, failures };
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, "");
  console.log(`Checking ${base}\n`);

  let failed = 0;
  let ticket = null;

  for (const check of CHECKS) {
    if (check.ticket !== ticket) {
      ticket = check.ticket;
      console.log(`== ${ticket} ==`);
    }

    const result = await runCheck(base, check);
    const mark = result.ok ? "PASS" : "FAIL";
    console.log(
      `  ${mark}  ${String(result.status).padEnd(3)} ${check.path}${result.detail ? "  " + result.detail : ""}`
    );

    for (const failure of result.failures) {
      console.log(`        ${failure}`);
      failed += 1;
    }
  }

  console.log(
    `\n${failed === 0 ? "All checks passed." : `${failed} check(s) failed.`}`
  );
  process.exit(failed === 0 ? 0 : 1);
}

main();
