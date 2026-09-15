/**
 * Fills in who provides what, what each practitioner sees, and the Recovery
 * Sanctuary booking links. CH-104.
 *
 *   node scripts/apply-practitioner-mapping.js            dry run
 *   node scripts/apply-practitioner-mapping.js --apply
 *
 * WHERE EACH VALUE CAME FROM, BECAUSE THEY ARE NOT ALL THE SAME
 *
 * The treatment assignments and the Recovery Sanctuary URLs are Frank's,
 * given on 2026-09-14 against a chart he corrected.
 *
 * Dr. Gabriele's list and Dr. Leong's are theirs, relayed by Frank. Those are
 * the only two that are real.
 *
 * The other four clinical lists are mine, written narrow and ordinary for the
 * profession, at Frank's request, to be replaced when each practitioner
 * sends their own. Nothing in them names a diagnosis the practitioner does
 * not make or promises an outcome. They are placeholders, and the field is
 * built to be emptied again: a practitioner with no list simply has no such
 * section on their page.
 *
 * Rooj's entry is not a clinical list at all. She is a yoga teacher, not a
 * regulated health professional, so her heading is "Class focus" and the
 * items are what her classes are for.
 */

const { mutate, query } = require("./lib/sanity-cli");

const apply = process.argv.includes("--apply");

/** Treatment slug to the practitioners who provide it. */
const PROVIDERS = {
  acupuncture: ["dr-david-gabriele", "dr-frank-nhan", "ariel-zohar"],
  "chiropractic-care": ["dr-frank-nhan"],
  "massage-therapy": ["andrew-huynh"],
  naturopathy: ["dr-david-gabriele"],
  "nutritional-counselling": [
    "dr-david-gabriele",
    "dr-eric-leong",
    "dr-frank-nhan",
  ],
  physiotherapy: ["ariel-zohar"],
  psychotherapy: ["safa-karoumi"],
  "exercise-rehab": ["ariel-zohar", "dr-frank-nhan"],
  "fitness-training": ["dr-frank-nhan"],
  "performance-training": ["dr-frank-nhan"],
  breathwork: ["rooj-hussain"],
  meditation: ["rooj-hussain", "dr-david-gabriele"],
  "outdoor-yoga-therapy": ["rooj-hussain"],
  /*
   * Flowpresso is booked without choosing a practitioner, but the chiros and
   * physios can run the session, so they are listed. That makes it appear
   * under their services, which is true, without implying the booking picks
   * a person.
   */
  "flowpresso-therapy": ["dr-frank-nhan", "ariel-zohar"],
  /*
   * Deliberately nobody. Outdoor Pilates is Claire Kim, left off the site at
   * Frank's direction on 2026-09-14 until she is up and running, then added
   * everywhere at once with CH-030. Cold plunge and sauna are self-directed.
   */
  "outdoor-pilates": [],
  "outdoor-cold-plunge": [],
  "outdoor-sauna": [],
};

/**
 * Jane addresses, read off the live booking site rather than guessed.
 *
 * Jane groups sessions under a discipline, and a discipline URL lands on that
 * service with its own sessions listed, which is what a treatment page wants:
 * the visitor picks the length once they are there. A treatment URL is used
 * only where the service is a single bookable thing.
 *
 *   1 Chiropractic          16 Physiotherapy
 *   10 Massage Therapy      19 Psychotherapy
 *   12 Naturopathic         22 Recovery Sanctuary Classes
 *   13 Personal Training    23 Custom Products
 */
const JANE = "https://curatehealth.janeapp.com/#";

const BOOKING = {
  "chiropractic-care": `${JANE}/discipline/1`,
  "massage-therapy": `${JANE}/discipline/10`,
  naturopathy: `${JANE}/discipline/12`,
  "fitness-training": `${JANE}/discipline/13`,
  "performance-training": `${JANE}/discipline/13`,
  physiotherapy: `${JANE}/discipline/16`,
  psychotherapy: `${JANE}/discipline/19`,
  "outdoor-yoga-therapy": `${JANE}/discipline/22/treatment/80`,
  "outdoor-pilates": `${JANE}/discipline/22/treatment/78`,
  /*
   * Cold plunge and sauna are one bookable service in Jane, "Cold Plunge &
   * Sauna (Individual)". Booking either gets you both, so the two pages share
   * the address rather than one of them falling back to the front page.
   */
  "outdoor-cold-plunge": `${JANE}/discipline/22/treatment/81`,
  "outdoor-sauna": `${JANE}/discipline/22/treatment/81`,
  /*
   * Added 2026-09-14 once both went live in Jane. Flowpresso sits under
   * Recovery Sanctuary Classes as treatment 42, behind that section's "Show
   * more", which is why a first read of the page missed it. Acupuncture has
   * a section of its own with no sessions listed, only "Book by
   * Practitioner", so the link is the section itself, the same #/acupuncture
   * anchor Jane's own navigation uses. Both were opened in a browser and
   * confirmed to land on the right thing.
   *
   * Frank pasted treatment/81 for Flowpresso. That is Cold Plunge & Sauna.
   */
  "flowpresso-therapy": `${JANE}/discipline/22/treatment/42`,
  acupuncture: `${JANE}/acupuncture`,
  /*
   * Still deliberately absent: nutritional counselling, exercise rehab,
   * breathwork and meditation have no section of their own on the public
   * booking site. Their buttons fall back to the site-wide link, which is
   * correct: sending someone to a discipline that does not cover what they
   * read about is worse than sending them to the front page.
   */
};

const TREATS = {
  /* Theirs, relayed by Frank. */
  "dr-david-gabriele": [
    "Weight management",
    "Fatigue",
    "Prediabetes and diabetes",
    "Blood pressure",
    "Cholesterol",
    "Bloating",
    "IBS",
    "Reflux",
    "Food sensitivities",
    "Constipation",
    "Hormonal imbalances",
    "Infertility",
    "PMS",
    "Menopause symptoms",
    "Insomnia",
    "Stress",
    "Anxiety",
    "Mood",
    "Sciatica",
    "Chronic pain",
    "Headache",
    "Migraine",
    "Nutrition",
    "Lifestyle counselling",
  ],
  /*
   * The three he named, followed by the seven drafted for him. He said
   * "include", meaning alongside the drafted list rather than instead of it,
   * which a first pass read the other way round and left at three.
   */
  "dr-eric-leong": [
    "Type 2 diabetes",
    "Liver cirrhosis",
    "Ulcer disease",
    "Digestive and gastrointestinal concerns",
    "Liver health",
    "Metabolic health",
    "Lifestyle change for long-term conditions",
    "Nutrition as part of medical care",
    "Preventive health",
    "Ongoing symptom management",
  ],

  /* Mine, to be replaced. */
  "dr-frank-nhan": [
    "Low back pain",
    "Neck pain",
    "Headaches",
    "Shoulder pain",
    "Sports injuries",
    "Postural strain from desk work",
    "Joint stiffness and mobility",
  ],
  "andrew-huynh": [
    "Muscle tension",
    "Low back and hip pain",
    "Neck and shoulder pain",
    "Recovery after training",
    "Tension headaches",
    "Restricted range of motion",
    "Stress held in the body",
  ],
  "ariel-zohar": [
    "Rehabilitation after surgery",
    "Sprains and strains",
    "Knee and hip pain",
    "Shoulder injury",
    "Returning to sport after injury",
    "Balance and mobility",
    "Repetitive strain",
  ],
  "safa-karoumi": [
    "Anxiety",
    "Low mood",
    "Stress and burnout",
    "Life transitions",
    "Relationship difficulty",
    "Self-esteem",
    "Grief and loss",
  ],
  /* Not a clinical list. See the note at the top. */
  "rooj-hussain": [
    "Relaxation",
    "Yin",
    "Mobility",
    "Stretching",
    "Strengthening",
  ],
};

const LABELS = { "rooj-hussain": "Class focus" };

/** Rooj teaches a class rather than seeing patients, so her booking is the
 *  class address rather than a staff member page. */
const PRACTITIONER_BOOKING = {
  "rooj-hussain": BOOKING["outdoor-yoga-therapy"],
};

async function main() {
  const people = await query(
    `*[_type == "practitioner" && !(_id in path("drafts.**"))]{_id, name, "slug": slug.current}`
  );
  const bySlug = new Map(people.map((p) => [p.slug, p]));

  const treatments = await query(
    `*[_type == "treatments" && !(_id in path("drafts.**"))]{_id, title, "slug": treatmentSlug.current}`
  );
  const treatmentBySlug = new Map(treatments.map((t) => [t.slug, t]));

  const unknownPeople = [...new Set(Object.values(PROVIDERS).flat())].filter(
    (slug) => !bySlug.has(slug)
  );
  const unknownTreatments = Object.keys(PROVIDERS).filter(
    (slug) => !treatmentBySlug.has(slug)
  );

  if (unknownPeople.length || unknownTreatments.length) {
    throw new Error(
      `Refusing to write. Unknown practitioner slugs: ` +
        `${unknownPeople.join(", ") || "none"}. Unknown treatment slugs: ` +
        `${unknownTreatments.join(", ") || "none"}.`
    );
  }

  const patches = [];
  const report = [];

  for (const [slug, providers] of Object.entries(PROVIDERS)) {
    const treatment = treatmentBySlug.get(slug);
    const refs = providers.map((p) => ({
      _type: "reference",
      _ref: bySlug.get(p)._id,
      _key: bySlug.get(p)._id,
    }));

    const set = { practitioners: refs };
    if (BOOKING[slug]) set.janeBookingUrl = BOOKING[slug];

    patches.push({ patch: { id: treatment._id, set } });
    report.push(
      `  ${String(treatment.title).trim().padEnd(24)} ` +
        `${providers.length ? providers.join(", ") : "(nobody)"}` +
        `${BOOKING[slug] ? "   + booking link" : ""}`
    );
  }

  const peopleReport = [];
  for (const [slug, items] of Object.entries(TREATS)) {
    const person = bySlug.get(slug);
    if (!person) throw new Error(`No practitioner with slug ${slug}`);

    const set = { commonlyTreats: items };
    if (LABELS[slug]) set.commonlyTreatsLabel = LABELS[slug];
    if (PRACTITIONER_BOOKING[slug]) {
      set.janeBookingUrl = PRACTITIONER_BOOKING[slug];
    }

    patches.push({ patch: { id: person._id, set } });
    peopleReport.push(
      `  ${String(person.name).padEnd(20)} ${items.length} items` +
        `${LABELS[slug] ? `, heading "${LABELS[slug]}"` : ""}` +
        `${PRACTITIONER_BOOKING[slug] ? ", booking link" : ""}`
    );
  }

  console.log(`${apply ? "APPLY" : "DRY RUN"}  ${patches.length} patches\n`);
  console.log("Treatments:\n" + report.join("\n"));
  console.log("\nPractitioners:\n" + peopleReport.join("\n"));

  if (!apply) {
    console.log("\nNothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`\nWrote in transaction ${result.transactionId}`);

  const back = await query(
    `*[_type == "practitioner" && isActive == true]|order(name asc){
      name, "treats": count(commonlyTreats), commonlyTreatsLabel,
      "provides": count(*[_type == "treatments" && isActive == true && references(^._id)])
    }`
  );
  console.log();
  for (const p of back) {
    console.log(
      `  ${String(p.name).padEnd(20)} ${String(p.treats ?? 0).padStart(2)} listed, ` +
        `provides ${p.provides}${p.commonlyTreatsLabel ? `, "${p.commonlyTreatsLabel}"` : ""}`
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
