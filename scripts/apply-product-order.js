/**
 * The order the products appear in, set by Frank on 2026-10-19.
 *
 *   1. Custom Foot Orthotics
 *   2. Compression Stockings
 *   3. TENS Machines
 *   4. Custom Knee Braces
 *   5. Professional Grade Supplements
 *
 * There was no order before this: no product carried a `displayOrder` and no
 * query sorted them, so Sanity returned them however it liked and the
 * homepage carousel happened to open on TENS Machines.
 *
 * The field is new on the product schema and the three queries that list
 * products now sort by it, so this sets the values and nothing else. The same
 * order applies on the homepage carousel, the Products page and the Products
 * menu, because one list of five products in two different orders is worse
 * than either order.
 *
 *   node scripts/apply-product-order.js           # dry run
 *   node scripts/apply-product-order.js --apply
 */
const { createClient } = require("next-sanity");

const APPLY = process.argv.includes("--apply");

const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

/*
 * Keyed by slug rather than by title, because a title is editorial copy that
 * somebody may reword, while the slug is the address and changing it is a
 * deliberate act with a redirect attached.
 */
const ORDER = [
  ["custom-foot-orthotics", 1],
  ["compression-stockings", 2],
  ["tens-machines", 3],
  ["custom-knee-braces", 4],
  ["professional-grade-supplements", 5],
];

(async () => {
  const docs = await client.fetch(
    `*[_type == "product"]{_id, _rev, title, "slug": slug.current, displayOrder, isActive}`
  );

  const patches = [];
  let missing = 0;

  console.log("");
  for (const [slug, order] of ORDER) {
    const doc = docs.find((d) => d.slug === slug);
    if (!doc) {
      missing++;
      console.log(`  ${order}. MISSING, no product with slug "${slug}"`);
      continue;
    }
    const was = doc.displayOrder === undefined || doc.displayOrder === null
      ? "(unset)"
      : String(doc.displayOrder);
    console.log(
      `  ${order}. ${String(doc.title).padEnd(34)} was ${was}${doc.isActive === false ? "   [switched off]" : ""}`
    );
    if (doc.displayOrder !== order) {
      patches.push({ id: doc._id, rev: doc._rev, order });
    }
  }

  const unlisted = docs.filter((d) => !ORDER.some(([s]) => s === d.slug));
  if (unlisted.length) {
    console.log("\n  Not in the list above, so they sort to the end:");
    for (const d of unlisted) console.log(`     ${d.title}  (${d.slug})`);
  }

  if (missing) {
    console.log(`\n${missing} slug(s) did not match a product. Nothing written.`);
    process.exit(1);
  }
  if (!patches.length) {
    console.log("\nAlready in this order. Nothing to write.");
    return;
  }
  if (!APPLY) {
    console.log(`\nDry run. ${patches.length} to write. Re-run with --apply.`);
    return;
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN is not set");
  }

  let tx = client.transaction();
  for (const p of patches) {
    tx = tx.patch(
      client.patch(p.id, { ifRevisionID: p.rev }).set({ displayOrder: p.order })
    );
  }
  const res = await tx.commit();
  console.log(
    `\nApplied. Transaction ${res.transactionId}, ${res.results.length} documents.`
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
