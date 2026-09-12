/**
 * CH-025: makes siteSettings the only address in the dataset.
 *
 *   node scripts/dedupe-address.js                    # dry run, writes nothing
 *   node scripts/dedupe-address.js --apply --phase=1  # before the code merges
 *   node scripts/dedupe-address.js --apply --phase=2  # after the code merges
 *
 * Two moves, and they are deliberately two deploys apart:
 *
 *   1. Copy the directions URL off contactPage.contactInfo.mapLink onto
 *      siteSettings.contactInfo.directionsLink.
 *   2. Unset contactPage.contactInfo.
 *
 * TWO PHASES, BECAUSE NEITHER SINGLE ORDERING IS SAFE
 *
 * The live contact page reads contactPage.contactInfo today. The new one reads
 * siteSettings. Do the whole mutation before the code merges and the live page
 * loses its address, email and phone until the deploy lands. Merge the code
 * first and the Get Directions button points at an empty directionsLink until
 * the mutation runs. Both are visitor-facing, on the page whose entire job is
 * telling people where the clinic is.
 *
 * Phase 1 is additive and nothing reads the field it writes, so it is safe at
 * any time. Then the code merges and starts reading siteSettings, which by then
 * holds everything it needs. Phase 2 only removes a field that nothing reads
 * any more. There is no moment in that sequence where the page is wrong, which
 * is the same shape as the gap-free slug rename in CLAUDE.md.
 *
 * WHY STEP 1 EXISTS, AND WHY THIS IS NOT A PLAIN DELETE
 *
 * The two contactInfo objects look like a duplicate. Every address field is
 * byte-identical, as is email and phone. mapLink is not:
 *
 *   siteSettings  maps.app.goo.gl/...      the Curate Health listing
 *   contactPage   ...?daddr=989+Eglinton   directions, starts navigation
 *
 * They are two different links that happened to share a field name. The
 * directions one is the URL rescued out of the retired second location by
 * scripts/retire-second-location.js, and it is the only working Get Directions
 * URL on the site. Deleting contactPage.contactInfo without moving it first
 * would take it with it and leave the button opening a bare listing.
 *
 * So the schema now has two named fields, mapLink and directionsLink, and this
 * script is what puts the right value in the new one.
 *
 * SAFETY
 *
 * Every patch carries ifRevisionID, so a concurrent Studio edit fails the
 * mutation rather than overwriting it. The script refuses to run if the two
 * copies disagree on anything other than mapLink, since any other divergence
 * is content that would be destroyed rather than moved. It is re-runnable:
 * with the work already applied it reports that and exits 0.
 *
 * Backup before applying. The restore point is
 * sanity-backup-2026-09-12-full.tar.gz in Frank's Documents folder, verified
 * complete (data.ndjson, assets.json, files, images) on 2026-09-12.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");
const PHASE = (() => {
  const arg = process.argv.find((a) => a.startsWith("--phase="));
  if (!arg) return null;
  const n = Number(arg.slice("--phase=".length));
  if (n !== 1 && n !== 2) {
    console.error("--phase must be 1 or 2.");
    process.exit(2);
  }
  return n;
})();

const SURVEY = `{
  "site": *[_type == "siteSettings"][0]{
    _id, _rev,
    contactInfo{email, phone, mapLink, directionsLink, address}
  },
  "page": *[_type == "contactPage"][0]{
    _id, _rev,
    contactInfo{email, phone, mapLink, address}
  },
  "drafts": *[_id in path("drafts.**") && _type in ["siteSettings", "contactPage"]]{
    _id, _type, _rev,
    "hasContactInfo": defined(contactInfo)
  }
}`;

/** Fields that must match before anything is deleted. */
const MUST_MATCH = ["email", "phone"];
const ADDRESS_FIELDS = [
  "street",
  "city",
  "state",
  "zip",
  "country",
  "locationInfo",
];

const eq = (a, b) => (a ?? null) === (b ?? null);

async function main() {
  const data = await query(SURVEY);
  const site = data.site;
  const page = data.page;

  if (!site) throw new Error("No siteSettings document found.");
  if (!page) throw new Error("No contactPage document found.");

  console.log(`siteSettings ${site._id} rev ${site._rev}`);
  console.log(`contactPage  ${page._id} rev ${page._rev}\n`);

  const alreadyDone = !page.contactInfo && !!site.contactInfo?.directionsLink;
  if (alreadyDone) {
    console.log(
      "Already applied: contactPage.contactInfo is gone and siteSettings\n" +
        "carries directionsLink. Nothing to do."
    );
    return;
  }

  // ---- refuse on any divergence that is not the known mapLink difference ----
  const blocking = [];

  for (const f of MUST_MATCH) {
    if (!eq(site.contactInfo?.[f], page.contactInfo?.[f])) {
      blocking.push(
        `contactInfo.${f}: site=${JSON.stringify(site.contactInfo?.[f] ?? null)} page=${JSON.stringify(page.contactInfo?.[f] ?? null)}`
      );
    }
  }

  for (const f of ADDRESS_FIELDS) {
    if (!eq(site.contactInfo?.address?.[f], page.contactInfo?.address?.[f])) {
      blocking.push(
        `contactInfo.address.${f}: site=${JSON.stringify(site.contactInfo?.address?.[f] ?? null)} page=${JSON.stringify(page.contactInfo?.address?.[f] ?? null)}`
      );
    }
  }

  if (blocking.length) {
    console.error(
      "The two copies disagree on fields this script will not resolve for you.\n" +
        "Deleting the contactPage copy would destroy these values, so nothing\n" +
        "has been written. Decide which is correct, set it on siteSettings by\n" +
        "hand, then re-run.\n"
    );
    blocking.forEach((b) => console.error("  " + b));
    process.exitCode = 1;
    return;
  }

  // ---- the directions URL ----
  const directions = page.contactInfo?.mapLink ?? null;
  const existing = site.contactInfo?.directionsLink ?? null;

  if (!directions) {
    console.error(
      "contactPage.contactInfo.mapLink is empty, so there is no directions URL\n" +
        "to move. That is not expected: retire-second-location.js wrote one\n" +
        "there on 2026-08-18. Refusing to delete blind."
    );
    process.exitCode = 2;
    return;
  }

  if (!directions.includes("daddr=")) {
    console.error(
      "contactPage.contactInfo.mapLink carries no daddr, so it is not a\n" +
        "directions URL and moving it would put the wrong thing in\n" +
        `directionsLink. Refusing.\n\n  ${directions}`
    );
    process.exitCode = 2;
    return;
  }

  console.log("Will set siteSettings.contactInfo.directionsLink to:");
  console.log(`  ${directions}\n`);
  if (existing && existing !== directions) {
    console.log(`  (replacing: ${existing})\n`);
  }

  console.log("Will unset contactPage.contactInfo, which holds:");
  console.log(`  email   ${page.contactInfo?.email ?? "(absent)"}`);
  console.log(`  phone   ${page.contactInfo?.phone ?? "(absent)"}`);
  console.log(
    `  address ${ADDRESS_FIELDS.map((f) => page.contactInfo?.address?.[f])
      .filter(Boolean)
      .join(", ")}`
  );
  console.log("  every one of which siteSettings already carries.\n");

  const wantPhase1 = PHASE === null || PHASE === 1;
  const wantPhase2 = PHASE === null || PHASE === 2;

  const mutations = [];

  if (wantPhase1) {
    mutations.push({
      patch: {
        id: site._id,
        ifRevisionID: site._rev,
        set: { "contactInfo.directionsLink": directions },
      },
    });
  }

  if (wantPhase2) {
    mutations.push({
      patch: {
        id: page._id,
        ifRevisionID: page._rev,
        unset: ["contactInfo"],
      },
    });
  }

  // Drafts autosave in the Studio and hold their own copy of these fields. A
  // draft left carrying contactInfo would put it back the moment somebody
  // publishes, which is how a "fixed" field quietly un-fixes itself.
  for (const draft of data.drafts ?? []) {
    if (wantPhase2 && draft._type === "contactPage" && draft.hasContactInfo) {
      console.log(`Will also unset contactInfo on draft ${draft._id}`);
      mutations.push({
        patch: {
          id: draft._id,
          ifRevisionID: draft._rev,
          unset: ["contactInfo"],
        },
      });
    }
    if (wantPhase1 && draft._type === "siteSettings") {
      console.log(`Will also set directionsLink on draft ${draft._id}`);
      mutations.push({
        patch: {
          id: draft._id,
          ifRevisionID: draft._rev,
          set: { "contactInfo.directionsLink": directions },
        },
      });
    }
  }

  if (!mutations.length) {
    console.log("\nNothing to do for this phase.");
    return;
  }

  if (!APPLY) {
    console.log(
      `\nDry run, phase ${PHASE ?? "1 and 2"}. ${mutations.length} mutation(s) would be sent.`
    );
    console.log("Re-run with --apply --phase=1 to write the additive half.");
    return;
  }

  if (PHASE === null) {
    console.error(
      "\nRefusing to apply both phases at once. Phase 2 removes a field the\n" +
        "deployed contact page still reads, so running them together takes the\n" +
        "address off the live page until the new code deploys. Pass --phase=1\n" +
        "now, merge the code, then --phase=2."
    );
    process.exitCode = 2;
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
  console.log("Verify with: node scripts/audit-address-duplication.js");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
