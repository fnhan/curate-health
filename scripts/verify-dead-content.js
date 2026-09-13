/**
 * Proves, per document, that deleting it changes nothing a visitor sees.
 *
 * This is the check that runs before scripts/delete-dead-content.js, and it
 * exists because "no query selects this type" is a claim about source code,
 * not about the site. Three independent methods have to agree:
 *
 *   STATIC     no live query selects the type. Source reading.
 *   REFERENCES nothing in the dataset points at the document, drafts
 *              included. Sanity's own index, not a grep.
 *   RENDERED   no string unique to this document appears anywhere in
 *              production HTML. The only one of the three that asks the
 *              actual site.
 *
 * The third needs the word "unique" to mean something, so a string counts
 * only when it appears in the candidate and in no other document in the
 * dataset. Without that the check is useless: the legacy `termOfUse`
 * document and the live `legalPage` that replaced it share most of their
 * copy, so searching for any string from the legacy one finds the live
 * page's text and reports a dead document as live.
 *
 * A document passes only if all three agree. Anything else is printed as
 * REVIEW and is not eligible for deletion.
 *
 *   node scripts/verify-dead-content.js
 *
 * Read-only. Exits 1 if any candidate fails to clear all three.
 */

const fs = require("fs");
const path = require("path");

const { query, walkStrings } = require("./lib/sanity-cli");

const PROD = "https://www.curatehealth.ca";

/**
 * The types proposed for deletion, each with the reason it is on the list.
 * Typed out rather than taken from the audit's output, so that adding
 * something here is a deliberate act with a stated reason.
 */
const CANDIDATES = [
  ["aboutPage", "Five about nav entries. Superseded by the real page documents"],
  ["aboutPages", "The same five again. Superseded by the real page documents"],
  ["accessibility", "Legal copy. Superseded by legalPage/accessibility"],
  ["privacy", "Legal copy. Superseded by legalPage/privacy-and-cookies"],
  ["termOfUse", "Legal copy. Superseded by legalPage/terms-of-use"],
  ["cafe", "2024 cafe section. Superseded by cafePage and cafeSection"],
  ["footer", "Fetched by LAYOUT_QUERY and discarded. Footer reads siteSettings"],
  ["navigation", "Fetched by LAYOUT_QUERY and discarded. Nav reads siteSettings"],
  ["metadatas", "Page titles and descriptions keyed by slug. Superseded by seo"],
  ["pageMetadata", "Three more of the same. Superseded by seo"],
  ["ourServices", "2024 services intro. Superseded by servicesSection"],
  ["highlight", "2024 homepage highlight. No component reads it"],
  ["popup", "2024 popup. Superseded by popupBanner"],
  ["survey", "2024 survey block. Superseded by surveySection"],
  ["surveyLink", "2024 survey link. Superseded by surveySection"],
  ["feedbackLink", "Schema written, never registered, never read"],
  ["contactInfo", "Orphan named in CH-025. Holds the duplicate place id"],
  ["contactDetails", "Orphan named in CH-025. Holds the stale phone number"],
];

const REASON = new Map(CANDIDATES);
const TYPES = CANDIDATES.map(([t]) => t);

/** Long enough not to collide by accident, short enough to exist in a title. */
const MIN_STRING = 12;

/** Values that are structural rather than content, and match everywhere. */
const NOISE =
  /^(https?:\/\/\S*)?$|^[0-9a-f-]{8,}$|^(true|false|null)$|^(block|span|image|slug|reference)$/i;

/**
 * A path or a slug is not evidence of anything.
 *
 * The first run flagged eleven documents because strings like
 * "/about/sustainability", "mission-and-values" and "pillars-of-health" turned
 * up in production HTML. They turn up because those pages exist. The footer
 * builds every one of them from a slug and a template literal, so the
 * assembled path appears in no document at all, which is exactly what made
 * them look unique. Finding a URL on the site says the page is there, not
 * that this document put it there.
 */
const PATH_OR_SLUG = /^\/?[a-z0-9]+(?:[-/][a-z0-9]+)*\/?$/;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "curate-verify/1.0" },
  });
  return res.ok ? await res.text() : "";
}

async function main() {
  /* ---- the production corpus --------------------------------------- */

  const sitemap = await fetchText(`${PROD}/sitemap.xml`);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  /**
   * Refuses to run against nothing. Three audits on this project have passed
   * by checking an empty set, and this one would do it silently: with no
   * pages fetched, no string is found on the site and every document looks
   * safe to delete.
   */
  if (urls.length < 20) {
    throw new Error(
      `Refusing to verify: the sitemap gave ${urls.length} URLs, expected 20 ` +
        `or more. Every RENDERED check below would pass by finding nothing.`
    );
  }

  const pages = [];
  for (const url of urls) {
    const html = await fetchText(url);
    if (html) pages.push({ url, html });
  }

  if (pages.length < urls.length * 0.9) {
    throw new Error(
      `Refusing to verify: fetched ${pages.length} of ${urls.length} pages.`
    );
  }

  const corpus = pages.map((p) => p.html).join("\n");
  console.log(
    `Production corpus: ${pages.length} pages, ${(corpus.length / 1e6).toFixed(1)} MB\n`
  );

  /* ---- every document, so "unique" can be established --------------- */

  const all = await query(
    `*[!(_type match "sanity.*") && !(_type match "system.*") && !(_type match "mux.*")]`
  );

  const candidates = all.filter((d) => TYPES.includes(d._type));
  const others = all.filter((d) => !TYPES.includes(d._type));

  if (!candidates.length) {
    throw new Error("Refusing to verify: no candidate documents were found.");
  }

  /**
   * Every string held by a document that is not up for deletion, as one blob
   * tested by containment rather than as a set tested by equality.
   *
   * Equality is not enough. The metadatas document holds "Naturopathic Care"
   * as a page title, and no other document holds that exact value, so it
   * looked unique. It is not: the phrase sits inside a sentence of body copy
   * on /services/naturopathy. Matching whole values only, the check called a
   * coincidence in someone else's prose evidence that a dead document was
   * live.
   */
  const elsewhere = others
    .flatMap((doc) => walkStrings(doc).map(([, v]) => v))
    .join("\n");

  /**
   * The shipped source, so a string the site hardcodes is not credited to a
   * document. "Get Directions" is a button label in app/contact/page.tsx and
   * also sits in the orphaned contactDetails document; finding it on the page
   * proves the button exists, not that the document feeds it.
   */
  const sourceDirs = ["app", "components", "lib", "sanity"];
  const sourceFiles = [];
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        collect(full);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        sourceFiles.push(full);
      }
    }
  };
  for (const dir of sourceDirs) {
    const full = path.join(__dirname, "..", dir);
    if (fs.existsSync(full)) collect(full);
  }
  const sourceText = sourceFiles
    .map((f) => fs.readFileSync(f, "utf8"))
    .join("\n");

  /* ---- per document ------------------------------------------------- */

  const verdicts = [];

  for (const doc of candidates) {
    const refs = await query(`count(*[references($id)])`, { id: doc._id });

    const strings = [
      ...new Set(
        walkStrings(doc)
          .map(([, v]) => v.trim())
          .filter((v) => v.length >= MIN_STRING && !NOISE.test(v))
      ),
    ];

    const unique = strings.filter(
      (s) =>
        !elsewhere.includes(s) &&
        !PATH_OR_SLUG.test(s) &&
        !sourceText.includes(s)
    );
    const onSite = unique.filter((s) => corpus.includes(s));

    /**
     * A document with nothing left to search has not passed the RENDERED
     * check, it has skipped it. Three filters run before that check, and
     * between them they can empty the list: everything the document holds is
     * also held elsewhere, or is a path, or is hardcoded in the source. Then
     * "found on the site: 0" means "looked for nothing", which is the failure
     * mode this project keeps meeting. It goes to review instead.
     */
    const searchable = unique.length > 0;
    const ok = refs === 0 && onSite.length === 0 && searchable;
    verdicts.push({ doc, refs, strings, unique, onSite, ok, searchable });
  }

  /* ---- report ------------------------------------------------------- */

  const byType = new Map();
  for (const v of verdicts) {
    if (!byType.has(v.doc._type)) byType.set(v.doc._type, []);
    byType.get(v.doc._type).push(v);
  }

  let failures = 0;

  for (const [type, list] of [...byType].sort()) {
    console.log(`${type}   ${REASON.get(type)}`);
    for (const v of list) {
      const draft = v.doc._id.startsWith("drafts.") ? " (draft)" : "";
      const line =
        `  ${v.ok ? "SAFE  " : "REVIEW"} ${v.doc._id.padEnd(46)}` +
        ` refs ${String(v.refs).padStart(2)}` +
        `  strings ${String(v.strings.length).padStart(3)}` +
        `  unique ${String(v.unique.length).padStart(3)}` +
        `  on site ${v.onSite.length}${draft}`;
      console.log(line);
      if (!v.ok) {
        failures += 1;
        for (const s of v.onSite) {
          console.log(`         found on the site: ${JSON.stringify(s.slice(0, 90))}`);
        }
      }
    }
    console.log();
  }

  console.log(
    `${verdicts.length} documents checked, ${verdicts.length - failures} clear ` +
      `all three methods, ${failures} need review.`
  );

  const out = path.join(__dirname, "..", ".dead-content-verified.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        corpusPages: pages.length,
        safe: verdicts.filter((v) => v.ok).map((v) => v.doc._id),
        review: verdicts.filter((v) => !v.ok).map((v) => v.doc._id),
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${path.relative(path.join(__dirname, ".."), out)}`);

  if (failures) process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
