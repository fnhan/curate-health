/**
 * Complimentary consult buttons, product assessment links, one business name
 * and the /cafe search description. Frank, 2026-11-26.
 *
 *   node scripts/apply-consult-links-and-business-name.js
 *   node scripts/apply-consult-links-and-business-name.js --apply
 *
 * THE CONSULTS
 *
 * The link lives on the practitioner's record, `consultUrl`, because it is
 * that person's offering: switching them off takes it off every page at once.
 * A treatment or product says whose consult it offers with
 * `consultPractitioner`, and offers none where none fits, such as acupuncture.
 * Each address was opened in Jane on 2026-11-26 and read back as the
 * appointment Jane selects, not typed from an id:
 *
 *   staff_member/1/treatment/50    Complimentary 15-Minute Chiropractic Consultation
 *   staff_member/7/treatment/45    Complimentary 15-Minute Discovery Call, Dr. Gabriele
 *   staff_member/17/treatment/123  Complimentary 15-Minute Physiotherapy Consultation
 *   staff_member/3/treatment/18    Complimentary 15-Minute Discovery Call, Safa
 *
 * Safa's is written although she is switched off, so it appears on its own
 * the day she is switched back on. Frank, 2026-11-26: leave her off for now.
 *
 * THE PRODUCTS
 *
 * "assessment links to compression stocking, knee brace, custom orthotics,
 * TENS unit but if you don't see jane links to the specific product, then
 * link it to chiropractic initial assessment as Dr. Nhan is the one to assess
 * and dispense. Otherwise, supplements go to Dr. Gabriele for initial
 * assessment." Jane has a product appointment for compression stockings only:
 *
 *   staff_member/1/treatment/36  Compression Stocking Assessment & Fitting, 60 min
 *   staff_member/1/treatment/1   Chiropractic Initial Assessment, 60 min
 *   staff_member/7/treatment/46  Initial Naturopathic Session (in person), 75 min
 *
 * Jane 68 is the free pick-up for orthotics already made and 35 is recasting
 * for existing patients, so neither is a first booking for orthotics.
 *
 * The labels change with the links. "Schedule Your TENS Therapy Consultation"
 * opening a paid initial assessment, beside a button reading "Book a
 * Complimentary Consult", would describe the wrong appointment.
 *
 * THE NEW FIELDS ARE INVISIBLE UNTIL THE CODE DEPLOYS. Until then the Studio
 * shows "Unknown field" on them. **Do not press Remove field**: it deletes the
 * data. It clears on the deploy.
 *
 * Every change states the value it expects and the run is refused whole if one
 * no longer matches, so a Studio edit since cannot be overwritten.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

const JANE = "https://curatehealth.janeapp.com/#/staff_member";

const NHAN = "practitioner-dr-frank-nhan";
const GABRIELE = "practitioner-dr-david-gabriele";
const ARIEL = "practitioner-ariel-zohar";
const SAFA = "practitioner-safa-karoumi";

const ref = (id) => ({ _type: "reference", _ref: id });

const PRODUCT = {
  stockings: "4a74f4d8-61a4-442e-bedd-f34fd0b8f188",
  orthotics: "685df38a-59ba-4168-b513-bc3bc3b9c7be",
  kneeBraces: "af83b1c0-93c2-4a2b-b7ff-f3cf9df10f0e",
  supplements: "81a65c70-7d47-435b-9715-bc145bbf7bb7",
  tens: "0dd96534-2aee-4bc4-9e5c-fa2b634b352e",
};

const OLD_CONSULT = "https://curatehealth.janeapp.com/#/discipline/1/treatment/50";
const OLD_NAME = "Curate Health - Midtown";

const CAFE_DESCRIPTION =
  "Curate Cafe in Midtown Toronto, where food is medicine: ceremonial matcha and 12-hour cold brew, with organic dishes free of refined sugar and seed oils.";

const FIELDS = [
  /* Whose consult, on the practitioner record. */
  { label: "Dr. Nhan consult", id: NHAN, path: "consultUrl", from: null, to: `${JANE}/1/treatment/50` },
  { label: "Dr. Gabriele consult", id: GABRIELE, path: "consultUrl", from: null, to: `${JANE}/7/treatment/45` },
  { label: "Ariel consult", id: ARIEL, path: "consultUrl", from: null, to: `${JANE}/17/treatment/123` },
  { label: "Safa consult, hidden while she is off", id: SAFA, path: "consultUrl", from: null, to: `${JANE}/3/treatment/18` },

  /* Which service pages offer one. */
  { label: "Chiropractic Care offers Dr. Nhan's", id: "3b50bddd-ebf2-468e-bdca-9a8bd3de58a7", path: "consultPractitioner", from: null, to: ref(NHAN) },
  { label: "Physiotherapy offers Ariel's", id: "e5baf8f3-d95d-4a53-b894-a93a1ee8d6f5", path: "consultPractitioner", from: null, to: ref(ARIEL) },
  { label: "Naturopathy offers Dr. Gabriele's", id: "94938088-a314-4688-a5e7-406f01cde621", path: "consultPractitioner", from: null, to: ref(GABRIELE) },
  { label: "Psychotherapy offers Safa's", id: "2523efb5-4d90-4f3b-becb-c8fd01fa78f2", path: "consultPractitioner", from: null, to: ref(SAFA) },

  /* The products: the assessment as the main button, the consult beside it. */
  { label: "Compression stockings consult", id: PRODUCT.stockings, path: "consultPractitioner", from: null, to: ref(NHAN) },
  { label: "Compression stockings link", id: PRODUCT.stockings, path: "callToAction.ctaLink", from: OLD_CONSULT, to: `${JANE}/1/treatment/36` },
  { label: "Compression stockings label", id: PRODUCT.stockings, path: "callToAction.ctaText", from: "Schedule Your Compression Stockings Consultation", to: "Book an Assessment and Fitting", copy: true },

  { label: "Custom orthotics consult", id: PRODUCT.orthotics, path: "consultPractitioner", from: null, to: ref(NHAN) },
  { label: "Custom orthotics link", id: PRODUCT.orthotics, path: "callToAction.ctaLink", from: OLD_CONSULT, to: `${JANE}/1/treatment/1` },
  { label: "Custom orthotics label", id: PRODUCT.orthotics, path: "callToAction.ctaText", from: "Schedule Your Custom Orthotics Consultation", to: "Book an Initial Assessment", copy: true },

  { label: "Knee braces consult", id: PRODUCT.kneeBraces, path: "consultPractitioner", from: null, to: ref(NHAN) },
  { label: "Knee braces link", id: PRODUCT.kneeBraces, path: "callToAction.ctaLink", from: OLD_CONSULT, to: `${JANE}/1/treatment/1` },
  { label: "Knee braces label", id: PRODUCT.kneeBraces, path: "callToAction.ctaText", from: "Schedule Your Custom Knee Brace Consultation", to: "Book an Initial Assessment", copy: true },

  { label: "TENS consult", id: PRODUCT.tens, path: "consultPractitioner", from: null, to: ref(NHAN) },
  { label: "TENS link", id: PRODUCT.tens, path: "callToAction.ctaLink", from: OLD_CONSULT, to: `${JANE}/1/treatment/1` },
  { label: "TENS label", id: PRODUCT.tens, path: "callToAction.ctaText", from: "Schedule Your TENS Therapy Consultation", to: "Book an Initial Assessment", copy: true },

  { label: "Supplements consult", id: PRODUCT.supplements, path: "consultPractitioner", from: null, to: ref(GABRIELE) },
  { label: "Supplements link", id: PRODUCT.supplements, path: "callToAction.ctaLink", from: OLD_CONSULT, to: `${JANE}/7/treatment/46` },
  { label: "Supplements label", id: PRODUCT.supplements, path: "callToAction.ctaText", from: "Schedule Your Supplement Consultation", to: "Book an Initial Assessment", copy: true },

  /* One business name, as Google and Jane already have it. */
  { label: "Business name", id: "731dc48e-5025-4709-8a00-aaa49f84812c", path: "brandName", from: OLD_NAME, to: "Curate Health", copy: true },
  { label: "Contact page heading", id: "ba90a190-6e64-4230-b483-7134689d667d", path: "branchName", from: OLD_NAME, to: "Curate Health", copy: true },

  /* Frank's pick of the two drafts, B. */
  {
    label: "/cafe search description",
    id: "8a5abd5e-c23c-4023-b8b2-a23574871ab5",
    path: "seo.pageDescription",
    from: "Curate Cafe in Midtown Toronto. An organic, whole-food menu with no industrial seed oils or refined sugar, sweetened only with local maple or honey.",
    to: CAFE_DESCRIPTION,
    copy: true,
  },
];

function at(doc, path) {
  return path.split(".").reduce((v, k) => (v == null ? v : v[k]), doc);
}

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

(async () => {
  const problems = [];
  const patches = new Map();
  const docs = new Map();

  if (CAFE_DESCRIPTION.length > 155) {
    problems.push(`/cafe description is ${CAFE_DESCRIPTION.length} characters, the limit is 155`);
  }

  // Every Jane address must be a booking deep link, never the front page.
  for (const field of FIELDS) {
    if (typeof field.to === "string" && field.to.includes("janeapp.com")) {
      if (!/#\/staff_member\/\d+\/treatment\/\d+$/.test(field.to)) {
        problems.push(`${field.label} is not a Jane treatment link: ${field.to}`);
      }
    }
  }

  // A referenced practitioner must exist, or the button would point nowhere.
  for (const id of [NHAN, GABRIELE, ARIEL, SAFA]) {
    const found = await query(`*[_id == $id][0]._id`, { id });
    if (!found) problems.push(`no practitioner record ${id}`);
  }

  console.log();

  for (const field of FIELDS) {
    if (field.copy) {
      if (/[—–]/.test(field.to)) problems.push(`${field.label} carries a dash`);
      if (/!/.test(field.to)) problems.push(`${field.label} carries an exclamation mark`);
      if (/\p{Cf}/u.test(field.to)) problems.push(`${field.label} carries invisible characters`);
      const banned = findBanned(field.to);
      if (banned.length) problems.push(`${field.label} uses ${JSON.stringify(banned)}`);
      const american = findAmerican(field.to);
      if (american.length) problems.push(`${field.label} spells ${JSON.stringify(american)}`);
    }

    if (!docs.has(field.id)) {
      docs.set(field.id, await query(`*[_id == $id][0]`, { id: field.id }));
    }
    const doc = docs.get(field.id);
    if (!doc) {
      problems.push(`${field.label}: no document ${field.id}`);
      continue;
    }

    const current = at(doc, field.path) ?? null;
    if (same(current, field.to)) {
      console.log(`  ${field.label}  already reads the new value`);
      continue;
    }
    if (!same(current, field.from)) {
      problems.push(
        `${field.label} reads ${JSON.stringify(current)}, expected ${JSON.stringify(field.from)}`
      );
      continue;
    }

    console.log(`  ${field.label}`);
    console.log(`    was  ${JSON.stringify(field.from)}`);
    console.log(`    now  ${JSON.stringify(field.to)}`);
    console.log();

    if (!patches.has(doc._id)) {
      patches.set(doc._id, { id: doc._id, ifRevisionID: doc._rev, set: {} });
    }
    patches.get(doc._id).set[field.path] = field.to;
  }

  // A draft holding the old values would put them back on the next Publish.
  const drafts = await query(`*[_id in $ids]._id`, {
    ids: [...new Set(FIELDS.map((f) => `drafts.${f.id}`))],
  });
  if (drafts.length) {
    problems.push(`drafts exist and would revert this on Publish: ${drafts.join(", ")}`);
  }

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  const mutations = [...patches.values()].map((p) => ({ patch: p }));
  if (!mutations.length) {
    console.log("  Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`  Dry run. ${mutations.length} documents would change. Re-run with --apply.`);
    return;
  }

  const result = await mutate(mutations);
  console.log(`  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
