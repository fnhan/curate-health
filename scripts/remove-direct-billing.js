/**
 * Take the direct billing claim off /our-programs.
 *
 *   node scripts/remove-direct-billing.js            # dry run
 *   node scripts/remove-direct-billing.js --apply
 *
 * "Our team is happy to assist in determining your eligibility and, when
 * possible, can submit claims on your behalf, so you can stay focused on your
 * health, not the paperwork." Frank confirmed on 2026-10-12 that Curate does no
 * insurance submissions and no direct billing, so that sentence is not true.
 * Direct billing content is also out of scope on this project, per CLAUDE.md.
 *
 * ONLY THE FALSE SENTENCE GOES
 *
 * The two sentences before it say what a visitor's own plan might cover and
 * tell them to confirm with their insurer. That is a statement about their
 * coverage, not an offer to bill anyone, and it is the same framing as the
 * OHIP line in the content rules. It stays.
 *
 * Nothing is drafted to replace it. A line about issuing receipts would be an
 * operational claim nobody has confirmed, so it is for Frank to add if he
 * wants it.
 *
 * The span is matched on its full text and the patch carries ifRevisionID, so
 * an edit in the Studio since this was read fails the mutation rather than
 * overwriting it.
 */

const { query, mutate } = require("./lib/sanity-cli");

const TARGET =
  "Some services may be eligible for coverage under your extended health benefits, depending on your provider. Because coverage varies by provider and plan, we encourage you to confirm the details with your insurer. Our team is happy to assist in determining your eligibility and, when possible, can submit claims on your behalf, so you can stay focused on your health, not the paperwork.";

const REPLACEMENT =
  "Some services may be eligible for coverage under your extended health benefits, depending on your provider. Because coverage varies by provider and plan, we encourage you to confirm the details with your insurer.";

async function main() {
  const apply = process.argv.includes("--apply");

  const docs = await query(
    `*[_type == "ourPrograms"]{_id, _rev, faq}`
  );

  const mutations = [];
  for (const d of docs) {
    const i = (d.faq || []).findIndex((q) =>
      (q.description || []).some((b) =>
        (b.children || []).some((c) => c.text === TARGET)
      )
    );
    if (i < 0) {
      console.log(`${d._id}: nothing to change`);
      continue;
    }
    const q = d.faq[i];
    const bi = q.description.findIndex((b) =>
      (b.children || []).some((c) => c.text === TARGET)
    );
    const ci = q.description[bi].children.findIndex((c) => c.text === TARGET);
    const path = `faq[${i}].description[${bi}].children[${ci}].text`;

    console.log(`${d._id}${d._id.startsWith("drafts.") ? "  [DRAFT]" : ""}`);
    console.log(`  ${path}   "${q.title}"`);
    console.log(`  removing: "...${TARGET.slice(REPLACEMENT.length).trim()}"`);
    mutations.push({
      patch: { id: d._id, ifRevisionID: d._rev, set: { [path]: REPLACEMENT } },
    });
  }

  if (!mutations.length) {
    console.log("\nNothing to write.");
    return;
  }
  if (!apply) {
    console.log(`\n${mutations.length} patches. Dry run, nothing written.`);
    return;
  }
  const r = await mutate(mutations);
  console.log(`\nApplied. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
