/**
 * Point the product consult buttons at Jane instead of Embodia.
 *
 * Frank, 2026-10-18: the product pages still send people to an Embodia
 * patient portal. Curate moved to Jane, so those buttons lead somewhere the
 * clinic no longer uses. They go to Dr. Frank Nhan's complimentary 15 minute
 * consultation, which is the address he gave.
 *
 * Verified on the live booking site rather than trusted from the id, per the
 * CH-104 note: #/discipline/1/treatment/50 is "Complimentary 15-Minute
 * Chiropractic Consultation", offered by Dr. Frank Nhan, 15 minutes, $0.00.
 * The one time this was not checked, a pasted treatment id turned out to be
 * Cold Plunge & Sauna.
 *
 * `scripts/audit-booking-links.js` is the sweep that found these, and it is
 * what to re-run after any change that touches a booking URL. It walks every
 * string in every document rather than reading a list of field names.
 */
const { createClient } = require("next-sanity");

const APPLY = process.argv.includes("--apply");
const OLD = /embodia/i;
const NEW = "https://curatehealth.janeapp.com/#/discipline/1/treatment/50";

const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

(async () => {
  /*
   * Drafts included. A draft still holding the Embodia link would put it back
   * the moment somebody pressed Publish, which is the standing hazard the
   * audit-drafts.js note describes. There are none today; this is here so the
   * script stays correct if one appears.
   */
  const docs = await client.fetch(
    `*[_type == "product"]{_id, _rev, title, "slug": slug.current, callToAction}`
  );

  const targets = docs.filter((d) => OLD.test(d.callToAction?.ctaLink || ""));

  console.log(`${docs.length} product documents, ${targets.length} pointing at Embodia\n`);
  for (const d of targets) {
    console.log(`  ${d.title}  (/products/${d.slug})${d._id.startsWith("drafts.") ? "  [DRAFT]" : ""}`);
    console.log(`    button: ${JSON.stringify(d.callToAction?.ctaText)}`);
    console.log(`    from:   ${d.callToAction.ctaLink}`);
    console.log(`    to:     ${NEW}\n`);
  }

  if (!targets.length) {
    console.log("Nothing to do.");
    return;
  }
  if (!APPLY) {
    console.log("Dry run. Nothing written. Re-run with --apply.");
    return;
  }
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN is not set");

  /*
   * One transaction, and ifRevisionID on each patch, so an edit somebody has
   * open in the Studio fails the whole thing rather than being overwritten.
   */
  let tx = client.transaction();
  for (const d of targets) {
    tx = tx.patch(
      client.patch(d._id, { ifRevisionID: d._rev }).set({ "callToAction.ctaLink": NEW })
    );
  }
  const res = await tx.commit();
  console.log(`Applied. Transaction ${res.transactionId}, ${res.results.length} documents.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
