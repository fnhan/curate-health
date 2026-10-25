/**
 * The cafe said its closing pitch twice. Cut it from the section.
 *
 * Frank, 2026-10-20: "it makes sense to take out out of where every bite
 * matters, and have it as the cta at the bottom."
 *
 * "Where Every Bite Matters" ended on two sentences the CTA band below
 * repeats almost word for word. Not loosely: the band's HEADLINE is that
 * question verbatim, and the band's BODY is the two sentences that followed
 * it. A reader got the same call to action twice within one screen.
 *
 *   section ended:  ...Ready to experience the benefits of nutritious,
 *                   seasonal food? Visit Curate Cafe and discover how
 *                   delicious healthy eating can be. Check out our in-clinic
 *                   menu for the latest offerings and let us nourish your
 *                   body and soul.
 *   band headline:  Ready to experience the benefits of nutritious, seasonal
 *                   food?
 *   band body:      Visit the Health Cafe at Curate Health and discover how
 *                   delicious healthy eating can be. Check out our in-clinic
 *                   menu for the latest offerings and let us nourish your
 *                   body and soul.
 *
 * Nothing is lost by cutting it from the section: the band carries it, and
 * the band is where a call to action belongs. The section now ends on its own
 * last point, about nutritional benefit, which is a natural close.
 *
 * **The whole section is one block with one span**, so this is a cut inside a
 * string rather than a filter over blocks. The first version of this script
 * filtered blocks, matched nothing and said so, which is why it refuses
 * rather than writing when the text it expects is absent.
 *
 *   node scripts/dedupe-cafe-cta.js           # dry run
 *   node scripts/dedupe-cafe-cta.js --apply
 */
const { createClient } = require("next-sanity");

const APPLY = process.argv.includes("--apply");

/*
 * `perspective: "raw"` is not optional since the Sanity 6 upgrade. Without it
 * a patch built from what `[0]` returns can land on a DRAFT and report
 * success while the published document, and so the live page, never moves.
 * That happened on 2026-10-19 restoring the programme page.
 */
const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  perspective: "raw",
  token: process.env.SANITY_WRITE_TOKEN,
});

const SECTION_KEY = "a0e65e61c684";
const CUT_FROM = "Ready to experience the benefits of nutritious, seasonal food?";

(async () => {
  const doc = await client.fetch(
    `*[_type == "cafePage" && !(_id in path("drafts.**"))][0]{_id, _rev, additionalSections}`
  );
  if (!doc) throw new Error("no published cafePage");

  const sections = doc.additionalSections || [];
  const idx = sections.findIndex((s) => s._key === SECTION_KEY);
  if (idx === -1) throw new Error("no section with _key " + SECTION_KEY);

  const section = sections[idx];
  const blocks = section.sectionParagraph || [];
  const textOf = (b) => (b.children || []).map((c) => c.text || "").join("");
  const full = blocks.map(textOf).join("");
  const at = full.indexOf(CUT_FROM);

  console.log("\n" + section.sectionTitle + "  " + blocks.length + " block(s)\n");
  if (at === -1) {
    console.log("  The sentence to cut is not there. Already cut, or the copy changed.");
    process.exit(1);
  }

  const kept = full.slice(0, at).trimEnd();
  const removed = full.slice(at).trim();

  console.log("  CUTTING:");
  console.log("    " + removed);
  console.log("\n  SECTION WILL NOW END ON:");
  console.log("    ..." + kept.slice(-100));

  if (!APPLY) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN is not set");
  }

  // One block, one span: the kept text replaces that span, keys and marks intact.
  const keptBlocks = blocks.map((b, i) =>
    i === 0
      ? {
          ...b,
          children: (b.children || []).map((ch, j) =>
            j === 0 ? { ...ch, text: kept } : ch
          ),
        }
      : b
  );

  /*
   * The whole array is written rather than an indexed path into it, per the
   * CH-028 note: an indexed patch alongside an array write in one transaction
   * is applied first and then overwritten, and the script reports success.
   */
  const next = sections.map((s, i) =>
    i === idx ? { ...s, sectionParagraph: keptBlocks } : s
  );

  const res = await client
    .patch(doc._id, { ifRevisionID: doc._rev })
    .set({ additionalSections: next })
    .commit();

  console.log("\nApplied to " + res._id + ", revision " + res._rev + ".");

  const after = await client.fetch(
    `*[_id == $id][0].additionalSections[_key == $k][0]{"text": pt::text(sectionParagraph)}`,
    { id: doc._id, k: SECTION_KEY }
  );
  console.log("  published section now ends: ..." + String(after.text).trim().slice(-70));
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
