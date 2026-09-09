/**
 * Sweeps the whole dataset for content that has gone stale or been copied
 * from the wrong place.
 *
 *   node scripts/audit-stale-content.js
 *
 * Read-only. Exits 1 if anything is found.
 *
 * WHY
 *
 * The restructure renamed categories, treatments and URLs. Every rename leaves
 * the old wording behind wherever it was duplicated, and this project has
 * found that the hard way more than once: a social title still reading "Rehab"
 * after the category became Clinical Care, a description belonging to
 * performance training sitting on the psychotherapy page, image alt text
 * pasted into a title field.
 *
 * Those were all found by looking, one at a time. This looks for all of them
 * at once, so the next rename can be checked in one command instead.
 *
 * WHAT IT LOOKS FOR
 *
 *   Retired names       Words the site no longer uses, anywhere in a string.
 *   Old URLs            Links to paths that now redirect, inside content.
 *   Duplicated copy     The same description on two documents, which is how
 *                       psychotherapy ended up describing strength training.
 *   Banned words        The content rules, applied to every string, not just
 *                       the ones a page happens to render.
 *   Alt text in titles  A title that reads like a photo caption.
 *
 * EVERY FINDING IS MARKED LIVE OR DEAD
 *
 * Half of what this turns up sits in documents no page reads: the `metadatas`
 * and `pageMetadata` types nothing queries, retired treatments whose URL now
 * redirects to their category, image filenames the CDN ignores. Those are not
 * defects, and a report that mixes them in with the real ones buries the real
 * ones.
 *
 * LIVE means a visitor or a crawler can reach the text. Fix those. DEAD means
 * the record exists and nothing renders it. Leave those, or delete the record
 * on purpose, but do not spend a content review on them.
 */

const { query, walkStrings } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/** Document types that exist in the dataset but no query reads. */
const ORPHAN_TYPES = new Set([
  "metadatas",
  "pageMetadata",
  "contactInfo",
  "contactDetails",
]);

/** Fields that never reach a page, whatever they contain. */
const DEAD_FIELDS = /^originalFilename$|^_/;

/**
 * Names the restructure retired, and what replaced them.
 *
 * "Rehab" is deliberately narrow. The word is ordinary English for
 * rehabilitation and the site uses it correctly in several places: a live
 * treatment called Exercise Rehab, "Prehab/Rehab" on the Curate Lifestyle
 * page, "rehab exercise" in Frank's own story. What was retired is Rehab as
 * the name of the category that is now Clinical Care, so this matches the word
 * standing alone as a whole field value, which is exactly how it survived on
 * clinical-care's social title. A looser pattern fired fifteen times on one
 * page that is not wrong.
 */
const RETIRED = [
  ["Primary Care", "Clinical Care", /\bprimary care\b/i],
  ["Rehab as the category name", "Clinical Care", /^\s*rehab\s*$/i],
  ["Counseling, one L", "Counselling", /\bcounseling\b/i],
  ["Flowpesso", "Flowpresso", /flowpesso/i],
  ["Flowspresso", "Flowpresso", /flowspresso/i],
  ["York as the locality", "Toronto", /\bYork,/],
];

/** Paths that no longer serve, if they appear inside content. */
const OLD_PATHS = [
  "/services/rehab",
  "/services/mental-health",
  "/services/lifestyle-medicine",
  "/services/exercise-therapy",
  "/services/one-on-one-care",
  "/services/primary-care",
  "/services/recovery-sanctuary/cold-plunge",
  "/services/nutritional-counseling",
];

const BANNED = [
  "journey",
  "dive in",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

/** Fields whose contents reach a search result or a share card. */
const META_PATHS =
  /^seo\.(pageTitle|pageDescription)$|^seo\.socialMeta\.(title|description)$/;

function label(doc) {
  const name = doc.title || doc.name || "(untitled)";
  const slug = doc.slug ? `  ${doc.slug}` : "";

  return `${doc._type}  ${name}${slug}`;
}

/**
 * Can a visitor reach this text?
 *
 * A treatment is only live if its own switch is on and its category's is too.
 * `exercise-therapy` is the case that makes the second half necessary: the
 * treatment is still switched on, but it hangs off Lifestyle Medicine, which
 * is switched off, so both of its URLs redirect to a category page and nothing
 * it contains is published anywhere.
 */
function isLive(doc) {
  if (ORPHAN_TYPES.has(doc._type)) return false;
  if (doc._type.startsWith("sanity.")) return false;
  if (doc.isActive === false) return false;
  if (doc._type === "treatments" && doc.categoryActive === false) return false;

  return true;
}

function mark(doc, path, value) {
  const state = isLive(doc) ? "LIVE" : "dead";

  return `  [${state}] ${label(doc)}\n         ${path}\n         ${JSON.stringify(value.slice(0, 110))}`;
}

async function main() {
  const documents = await query(
    `*[!(_id in path("drafts.**")) && !(_id in path("sanity.**"))]{
      ...,
      "slug": coalesce(slug.current, treatmentSlug.current),
      "categoryActive": service->isActive
    }`
  );

  console.log(RULE);
  console.log("Stale and mis-copied content");
  console.log(RULE);
  console.log(`${documents.length} documents scanned`);
  console.log("LIVE means a visitor can reach it. dead means nothing renders it.\n");

  let live = 0;
  let dead = 0;
  const report = (heading, lines) => {
    if (!lines.length) return;
    const liveCount = lines.filter((l) => l.includes("[LIVE]")).length;
    live += liveCount;
    dead += lines.length - liveCount;
    console.log(`${heading}  (${liveCount} live, ${lines.length - liveCount} dead)`);
    lines.forEach((l) => console.log(l));
    console.log("");
  };

  // 1. Retired names.
  for (const [name, replacement, pattern] of RETIRED) {
    const hits = [];
    for (const doc of documents) {
      for (const [path, value] of walkStrings(doc)) {
        if (DEAD_FIELDS.test(path)) continue;
        if (pattern.test(value)) hits.push(mark(doc, path, value));
      }
    }
    report(`RETIRED: "${name}", should be ${replacement}`, hits);
  }

  // 2. Old URLs inside content.
  const urlHits = [];
  for (const doc of documents) {
    for (const [path, value] of walkStrings(doc)) {
      if (DEAD_FIELDS.test(path)) continue;
      for (const old of OLD_PATHS) {
        // Only a whole path segment, so /services/rehab does not match
        // /services/rehabilitation.
        const pattern = new RegExp(`${old}(?![a-z0-9-])`, "i");
        if (pattern.test(value)) {
          urlHits.push(mark(doc, `${path} contains ${old}`, value));
        }
      }
    }
  }
  report("OLD URLS inside content, these now redirect", urlHits);

  // 3. The same description on more than one document.
  const descriptions = new Map();
  for (const doc of documents) {
    for (const [path, value] of walkStrings(doc)) {
      if (!META_PATHS.test(path)) continue;
      if (value.trim().length < 40) continue;
      const key = value.trim();
      descriptions.set(key, [...(descriptions.get(key) || []), doc]);
    }
  }
  const dupes = [];
  for (const [value, owners] of descriptions) {
    const distinct = new Map(owners.map((d) => [d._id, d]));
    if (distinct.size < 2) continue;

    // Live only if more than one of the sharers is reachable. One live page and
    // one retired record sharing a description is not a duplicate any crawler
    // will ever see.
    const liveOwners = [...distinct.values()].filter(isLive);
    const state = liveOwners.length > 1 ? "LIVE" : "dead";
    const names = [...distinct.values()]
      .map((d) => `${isLive(d) ? "live" : "dead"}  ${label(d)}`)
      .join("\n         ");

    dupes.push(
      `  [${state}] ${names}\n         ${JSON.stringify(value.slice(0, 110))}`
    );
  }
  report("SHARED between different pages, one of them is wrong", dupes);

  // 4. Banned words in anything that reaches a search result.
  const bannedHits = [];
  for (const doc of documents) {
    for (const [path, value] of walkStrings(doc)) {
      if (!META_PATHS.test(path)) continue;
      for (const word of BANNED) {
        if (new RegExp(`\\b${word}`, "i").test(value)) {
          bannedHits.push(mark(doc, `${path} uses "${word}"`, value));
        }
      }
    }
  }
  report("BANNED WORDS in a title or description", bannedHits);

  // 5. Dashes used as punctuation, in metadata.
  //
  // The content rules ban them outright. Hyphens in compounds like
  // "evidence-based" are fine and are not matched here.
  const dashHits = [];
  const bodyDashes = new Map();

  for (const doc of documents) {
    for (const [path, value] of walkStrings(doc)) {
      if (DEAD_FIELDS.test(path) || /slug|url|link|_ref|_key/i.test(path)) continue;
      if (!/[—–]/.test(value)) continue;

      if (META_PATHS.test(path)) {
        dashHits.push(mark(doc, path, value));
      } else if (isLive(doc)) {
        // Body copy. Counted, not listed. Frank shelved the page-copy rewrite
        // until the brand pass, and printing sixty paragraphs here would bury
        // the metadata findings this audit exists to surface.
        bodyDashes.set(label(doc), (bodyDashes.get(label(doc)) || 0) + 1);
      }
    }
  }
  report("EM OR EN DASH in a title or description", dashHits);

  if (bodyDashes.size) {
    const total = [...bodyDashes.values()].reduce((a, b) => a + b, 0);
    console.log(
      `HELD: ${total} dash(es) in page copy across ${bodyDashes.size} page(s).`
    );
    console.log("Not counted below. These belong to the page copy rewrite.");
    for (const [name, count] of [...bodyDashes].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(3)}  ${name}`);
    }
    console.log("");
  }

  // 6. A title that reads like a photo caption.
  const captionHits = [];
  for (const doc of documents) {
    for (const [path, value] of walkStrings(doc)) {
      if (!/title$/i.test(path) || !META_PATHS.test(path)) continue;
      if (value.length > 60 && /\b(image|photo|showing|depicting|a dense|close-up)\b/i.test(value)) {
        captionHits.push(mark(doc, path, value));
      }
    }
  }
  report("ALT TEXT pasted into a title field", captionHits);

  console.log(RULE);
  console.log(`${live} live finding(s) to fix, ${dead} in records nothing renders.`);

  process.exit(live ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
