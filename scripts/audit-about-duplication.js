/**
 * Survey: five about pages, ten documents, two types. Which is authoritative,
 * have they drifted, and what reads each one?
 *
 *   node scripts/audit-about-duplication.js
 *
 * Read-only. Writes nothing and deletes nothing.
 *
 * WHAT IS ACTUALLY IN THERE
 *
 * The dataset holds two parallel sets of the same five pages, created three
 * days apart in July 2024 and untouched since:
 *
 *   aboutPage   five documents, 2024-07-19
 *   aboutPages  five documents, 2024-07-22
 *
 * Both are live. Different parts of the site read different ones, which is the
 * problem: an editor correcting a title in the Studio changes one of the two
 * and the other keeps the old value, exactly as the address did before CH-025.
 *
 * This does not touch aboutIndexPage, which is the /about hub itself and is a
 * different thing from either: a singleton with the page's own copy, not a
 * list entry for one of the five.
 */

const { assertChecked } = require("./lib/assert-checked");
const { query } = require("./lib/sanity-cli");

const DOCS = `*[_type in ["aboutPage", "aboutPages"]] | order(slug.current asc){
  _id, _type, _createdAt, _updatedAt,
  title,
  "slug": slug.current,
  isActive
}`;

/** Where each type is read. Kept here so the survey names consequences. */
const READERS = {
  aboutPage: ["ABOUT_PAGES_QUERY in sanity/lib/queries.ts"],
  aboutPages: [
    "SITE_SETTINGS_QUERY, which the footer and the mobile accordion render",
    "INDEX_DOCS_QUERY in app/api/search/route.ts, which is site search",
  ],
};

const show = (v) =>
  v === undefined || v === null ? "(absent)" : JSON.stringify(v);

async function main() {
  const docs = await query(DOCS);

  assertChecked({
    label: "about documents",
    count: docs.length,
    atLeast: 2,
    hint: "Both types should return five documents each.",
  });

  const bySlug = new Map();
  for (const d of docs) {
    const key = d.slug ?? "(no slug)";
    if (!bySlug.has(key)) bySlug.set(key, {});
    bySlug.get(key)[d._type] = d;
  }

  console.log(`${docs.length} documents across ${bySlug.size} slugs\n`);

  console.log("Who reads what:");
  for (const [type, readers] of Object.entries(READERS)) {
    console.log(`  ${type}`);
    readers.forEach((r) => console.log(`     ${r}`));
  }

  console.log("\nSide by side:\n");

  const drifted = [];
  const onlyOne = [];

  for (const [slug, pair] of bySlug) {
    const a = pair.aboutPage;
    const b = pair.aboutPages;

    console.log(`  ${slug}`);

    if (!a || !b) {
      const present = a ? "aboutPage" : "aboutPages";
      console.log(`     only ${present} exists`);
      onlyOne.push(slug);
      console.log("");
      continue;
    }

    const rows = [
      ["title", a.title, b.title],
      ["isActive", a.isActive, b.isActive],
    ];

    let differs = false;
    for (const [field, av, bv] of rows) {
      const same = (av ?? null) === (bv ?? null);
      if (!same) differs = true;
      console.log(
        `     ${field.padEnd(9)} aboutPage=${show(av).padEnd(24)} aboutPages=${show(bv)}${same ? "" : "   <-- DIFFERS"}`
      );
    }

    console.log(
      `     updated   aboutPage=${a._updatedAt.slice(0, 10)}         aboutPages=${b._updatedAt.slice(0, 10)}`
    );

    if (differs) drifted.push(slug);
    console.log("");
  }

  console.log("Summary");
  console.log(
    `  slugs present in both types : ${bySlug.size - onlyOne.length}`
  );
  console.log(
    `  slugs in only one type      : ${onlyOne.length}${onlyOne.length ? " (" + onlyOne.join(", ") + ")" : ""}`
  );
  console.log(
    `  slugs whose values disagree : ${drifted.length}${drifted.length ? " (" + drifted.join(", ") + ")" : ""}`
  );

  if (drifted.length) {
    console.log(
      "\nThey have already drifted, which is the argument for consolidating\n" +
        "rather than leaving both. Decide which value is right per field before\n" +
        "either set is removed."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "\nThe two sets still agree on every compared field. That is the easy case:\n" +
      "one can be retired without choosing between conflicting values. It will\n" +
      "not stay the easy case, because nothing stops the next edit hitting one."
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
