/**
 * The class schedule document, CH-107.
 *
 *   node scripts/apply-class-schedule.js           # dry run, prints everything
 *   node scripts/apply-class-schedule.js --apply
 *
 * WHERE THE DAYS AND TIMES CAME FROM
 *
 * Jane, read on 2026-10-20 through its own openings API under discipline 22,
 * Recovery Sanctuary, rather than guessed or taken from a note:
 *
 *   /api/v2/openings/for_discipline?location_id=1&discipline_id=22
 *     &num_days=7&treatment_id={id}&date=YYYY-MM-DD
 *
 *   treatment 80   Outdoor Yoga Therapy    Tue 18:00, 3600s   $30
 *   treatment 78   Outdoor Pilates         Wed 09:00, 3000s   $30
 *   treatment 112  Tai Chi                 Sun 09:00, 3600s   $30
 *
 * `num_days` is capped at 7, so this was read a week at a time. **Jane only
 * holds about a fortnight open**: sixteen weeks ahead gave one Pilates opening
 * and two Yoga ones. That is why the recurrence is stored here rather than the
 * page reading dates out of Jane, and it is why moving a class in Jane means
 * moving it here too.
 *
 * WHAT IS FRANK'S AND WHAT IS MINE
 *
 * His, from CLAUDE.md and the Outdoor Pilates work on 2026-10-13: 50 minutes,
 * up to 12 people, the pergola that closes, the move indoors to the gym, and
 * mats provided with your own welcome.
 *
 * Mine, drafted and needing his read: the intro, the standing note and Tai
 * Chi's one-line summary. The summary is deliberately a description of what
 * the class is and not of what it is for, because anything clinical is Dr.
 * Gabriele's to sign off.
 *
 * TAI CHI HAS NO PAGE, ON PURPOSE
 *
 * It appears in the schedule as a name rather than a link. A page for it needs
 * a page's worth of copy with a practitioner's sign-off, which is a separate
 * job; a line saying Sunday at 9:00 AM with Dr. Gabriele is a fact, not a
 * health claim, so there is no reason to withhold it in the meantime.
 */
const { query, mutate } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/** Put every class back on, rather than keeping what the Studio holds. */
const RESET_SWITCHES = process.argv.includes("--reset-switches");

const DOC_ID = "classSchedule";

/** A single newline, which the note field uses to separate its lines. */
const LINE_BREAK = String.fromCharCode(10);
const PARAGRAPH_BREAK = LINE_BREAK + LINE_BREAK;

/* ------------------------------------------------------------------- copy */

const TITLE = "Class Schedule";

const INTRO = [
  "Three classes run every week in the Recovery Sanctuary, the outdoor space at Curate Health in Midtown Toronto.",
  "Each one is booked as a single place rather than a term, so you can come to one class or to all of them. Booking opens a couple of weeks ahead.",
].join(PARAGRAPH_BREAK);

const NOTE = [
  "Mats are provided, and you are welcome to bring your own.",
  "Wear workout clothes and bring layers for the weather.",
].join(LINE_BREAK);

/** The entry in the main menu. "Classes", not "Class Schedule": a menu
 *  label is the thing, not the page about it. */
const NAV_LINK = { _type: "navLink", title: "Classes", href: "/classes" };

const SEO_TITLE = "Class Schedule Toronto";
const SEO_DESCRIPTION =
  "Weekly yoga, Pilates and Tai Chi classes in the Recovery Sanctuary at Curate Health, Midtown Toronto. When each one runs, who teaches it, and how to book.";

/**
 * The three classes, in the order the week runs them.
 *
 * `treatmentTitle` is looked up rather than hardcoded as an id, so a wrong
 * title fails the run instead of writing a reference to the wrong document.
 */
const CLASSES = [
  {
    treatmentTitle: "Outdoor Yoga Therapy",
    instructorName: "Rooj Hussain",
    dayOfWeek: "Tuesday",
    startTime: "18:00",
    durationMinutes: 60,
    price: 30,
    // Jane says nothing about how many people a yoga class takes and nobody
    // has, so this is left empty rather than guessed from the Pilates number.
    capacity: null,
    note: null,
  },
  {
    treatmentTitle: "Outdoor Pilates",
    instructorName: "Claire Kim",
    dayOfWeek: "Wednesday",
    startTime: "09:00",
    durationMinutes: 50,
    price: 30,
    // Frank's number, 2026-10-13, and already on the Outdoor Pilates page.
    capacity: 12,
    // Nothing to add: the one-on-one sessions are already the second half of
    // this page's own meta description, which is what the summary shows.
    note: null,
  },
  {
    // No treatment page yet, so this one carries its own name and summary.
    treatmentTitle: null,
    name: "Tai Chi",
    summary:
      "A slow sequence of standing movements and shifts of weight, practised outdoors in the Recovery Sanctuary.",
    instructorName: "Dr. David Gabriele",
    dayOfWeek: "Sunday",
    startTime: "09:00",
    durationMinutes: 60,
    price: 30,
    capacity: null,
    note: null,
    // Read off the live booking site rather than assembled from the id, per
    // the CH-104 note: the one pasted Jane id that went in unchecked turned
    // out to be Cold Plunge & Sauna.
    bookingUrl: "https://curatehealth.janeapp.com/#/discipline/22/treatment/112",
  },
];

/* ------------------------------------------------------------- rule checks */

const DASHES = /[–—]/;

/**
 * Zero-width and bidi characters, CH-020.
 *
 * Checked here and not only by `audit-unicode.js`, because the audit runs
 * after the write and this is the exact path the original contamination took:
 * copy pasted out of a rich text source into a field. Frank's menu copy on
 * 2026-10-18 arrived carrying them, so it is not hypothetical.
 *
 * Cf only, the Format category, so it does not catch U+0000 and the other C0
 * controls, which are Cc. Same limit the audit has.
 */
const CF = /\p{Cf}/u;

function ruleBreaks(label, text) {
  const out = [];
  if (!text) return out;
  if (CF.test(text)) {
    const n = [...text].filter((c) => CF.test(c)).length;
    out.push(`${label}: ${n} zero-width or bidi characters, retype it`);
  }
  if (DASHES.test(text)) out.push(`${label}: em or en dash`);
  if (text.includes("!")) out.push(`${label}: exclamation mark`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  /*
   * The few American spellings this copy could realistically carry. Kept
   * short on purpose, per the content rules: "program", "organize" and
   * "analyze" are correct Canadian and are not flagged, and "practice"
   * against "practise" splits noun from verb in a way no regex can judge.
   */
  for (const [us, ca] of [
    ["color", "colour"],
    ["center", "centre"],
    ["meter", "metre"],
    ["neighborhood", "neighbourhood"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  return out;
}

/**
 * The audits' own limits, so a failure shows up before the mutation rather
 * than after the build. `| Curate Health` costs 15 of the 60 Google shows.
 */
const TITLE_BUDGET = 60 - " | Curate Health".length;
const DESCRIPTION_MAX = 155;
const DESCRIPTION_MIN = 70;

/* ------------------------------------------------------------------ shape */

/** 18:00 to 6:00 PM, the same conversion the page makes. */
function timeLabel(startTime) {
  const [h, m] = startTime.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * Keys are derived from the class, not random, so re-running the dry run
 * prints the same document and a second apply is a no-op rather than a churn
 * of new keys. Sanity only needs them unique within the array.
 */
const key = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

(async () => {
  /* ---------------------------------------------------------- the lookups */

  const treatments = await query(
    `*[_type == "treatments" && !(_id in path("drafts.**"))]{_id, title, isActive, janeBookingUrl, "slug": treatmentSlug.current, "serviceSlug": service->slug.current}`
  );
  const settings = await query(
    `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{_id, _rev, navLinks}`
  );
  const practitioners = await query(
    `*[_type == "practitioner" && !(_id in path("drafts.**"))]{_id, name, isActive, "slug": slug.current}`
  );

  /*
   * What is live now, so a re-run does not undo an editor's switches.
   *
   * This writes the whole document with createOrReplace, so without this a
   * second run would turn a class Frank had switched off for a holiday
   * straight back on, and report success. Anything stored here wins over the
   * `isActive: true` in CLASSES above, keyed by the same derived _key.
   *
   * `--reset-switches` puts every class back on deliberately.
   */
  const live = await query(
    `*[_id == $id][0]{"switches": classes[]{_key, isActive}}`,
    { id: DOC_ID }
  );
  const storedSwitch = new Map(
    (live?.switches ?? []).map((c) => [c._key, c.isActive])
  );

  const problems = [];

  const entries = CLASSES.map((entry) => {
    let treatment = null;

    if (entry.treatmentTitle) {
      treatment = treatments.find((t) => t.title === entry.treatmentTitle);
      if (!treatment) {
        problems.push(`no treatment titled "${entry.treatmentTitle}"`);
      } else if (!treatment.isActive) {
        problems.push(`treatment "${entry.treatmentTitle}" is switched off`);
      }
    }

    const instructor = practitioners.find((p) => p.name === entry.instructorName);
    if (!instructor) {
      problems.push(`no practitioner named "${entry.instructorName}"`);
    } else if (!instructor.isActive) {
      // Not a failure. A switched-off practitioner is filtered out by the
      // query at read time, so the schedule simply does not name them.
      console.log(
        `  note: ${entry.instructorName} is switched off, so the schedule will`
      );
      console.log("        not name them until that switch goes back on.");
    }

    const name = entry.treatmentTitle || entry.name;

    return {
      _type: "scheduledClass",
      _key: key(name),
      // On unless the Studio already says otherwise, per storedSwitch above.
      isActive: RESET_SWITCHES
        ? true
        : (storedSwitch.get(key(name)) ?? true) !== false,
      ...(treatment
        ? {
            treatment: { _type: "reference", _ref: treatment._id },
          }
        : { name: entry.name, summary: entry.summary }),
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      durationMinutes: entry.durationMinutes,
      ...(instructor
        ? { instructor: { _type: "reference", _ref: instructor._id } }
        : {}),
      ...(typeof entry.capacity === "number"
        ? { capacity: entry.capacity }
        : {}),
      ...(typeof entry.price === "number" ? { price: entry.price } : {}),
      ...(entry.bookingUrl ? { bookingUrl: entry.bookingUrl } : {}),
      ...(entry.note ? { note: entry.note } : {}),
      // Printed below, not written: the fallback the query will resolve.
      _inheritedBooking: treatment?.janeBookingUrl ?? null,
      _treatmentPath:
        treatment && treatment.serviceSlug
          ? `/services/${treatment.serviceSlug}/${treatment.slug}`
          : null,
    };
  });

  /* ------------------------------------------------------------ the checks */

  for (const [label, text] of [
    ["title", TITLE],
    ["intro", INTRO],
    ["note", NOTE],
    ["seo.pageTitle", SEO_TITLE],
    ["seo.pageDescription", SEO_DESCRIPTION],
    ...entries.flatMap((e) => [
      [`${e._key}.name`, e.name ?? ""],
      [`${e._key}.summary`, e.summary ?? ""],
      [`${e._key}.note`, e.note ?? ""],
    ]),
  ]) {
    problems.push(...ruleBreaks(label, text));
  }

  const fullTitle = `${SEO_TITLE} | Curate Health`;
  if (SEO_TITLE.length > TITLE_BUDGET) {
    problems.push(
      `seo.pageTitle is ${SEO_TITLE.length} of ${TITLE_BUDGET}, "${fullTitle}" is ${fullTitle.length} of 60`
    );
  }
  if (SEO_DESCRIPTION.length > DESCRIPTION_MAX) {
    problems.push(
      `seo.pageDescription is ${SEO_DESCRIPTION.length}, over ${DESCRIPTION_MAX}`
    );
  }
  if (SEO_DESCRIPTION.length < DESCRIPTION_MIN) {
    problems.push(
      `seo.pageDescription is ${SEO_DESCRIPTION.length}, under ${DESCRIPTION_MIN} and audit-metadata.js warns`
    );
  }

  /*
   * The page title has to agree with the h1, which is what audit-metadata.js
   * checks: every significant word of the heading must appear in the title.
   */
  const significant = (s) =>
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
  for (const word of significant(TITLE)) {
    if (!significant(SEO_TITLE).includes(word)) {
      problems.push(`seo.pageTitle is missing "${word}" from the h1 "${TITLE}"`);
    }
  }

  /* ------------------------------------------------------------- the print */

  console.log();
  console.log(`  ${TITLE}`);
  console.log(`  ${fullTitle}  (${fullTitle.length} of 60)`);
  console.log(`  ${SEO_DESCRIPTION}  (${SEO_DESCRIPTION.length} of 155)`);
  console.log();
  for (const paragraph of INTRO.split(PARAGRAPH_BREAK)) {
    console.log(`  ${paragraph}`);
    console.log();
  }
  for (const line of NOTE.split(LINE_BREAK)) console.log(`  ${line}`);
  console.log();
  console.log("  ----------------------------------------------------------");

  for (const e of entries) {
    const who = practitioners.find(
      (p) => p._id === e.instructor?._ref
    );
    const name =
      e.name ?? treatments.find((t) => t._id === e.treatment?._ref)?.title;
    console.log();
    console.log(`  ${name}`);
    console.log(
      `    when      ${e.dayOfWeek}, ${timeLabel(e.startTime)}, ${e.durationMinutes} minutes`
    );
    console.log(
      `    taught by ${who ? who.name : "nobody named"}${who && !who.isActive ? "  (switched off)" : ""}`
    );
    if (e.capacity) console.log(`    spaces    up to ${e.capacity}`);
    if (e.price) console.log(`    drop-in   $${e.price}`);
    console.log(
      `    page      ${e._treatmentPath ?? "none, shows as a name rather than a link"}`
    );
    console.log(
      `    booking   ${e.bookingUrl ?? e._inheritedBooking ?? "none"}${e.bookingUrl ? "  (set here)" : e._inheritedBooking ? "  (from the treatment)" : ""}`
    );
    if (e.note) console.log(`    note      ${e.note}`);
    if (e.isActive === false) {
      console.log("    showing   NO, switched off in the Studio and kept that way");
    }
  }

  console.log();

  if (problems.length) {
    console.log("  REFUSING TO WRITE:");
    for (const problem of problems) console.log(`    ${problem}`);
    process.exit(1);
  }

  const doc = {
    _id: DOC_ID,
    _type: "classSchedule",
    title: TITLE,
    intro: INTRO,
    note: NOTE,
    classes: entries.map((e) => {
      // The printed-only fields come off before the write.
      const { _inheritedBooking, _treatmentPath, ...rest } = e;
      return rest;
    }),
    seo: {
      _type: "seo",
      pageTitle: SEO_TITLE,
      pageDescription: SEO_DESCRIPTION,
    },
  };

  if (!APPLY) {
    const inMenu = (settings?.navLinks ?? []).some(
      (link) => link.href === NAV_LINK.href
    );
    console.log(
      inMenu
        ? "  The Classes entry is already in the menu."
        : "  WOULD ADD \"Classes\" to the main menu, first in navLinks."
    );
    console.log();
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    console.log();
    console.log("  The hero photograph is deliberately not set: the page falls");
    console.log("  back to the Recovery Sanctuary's own, so there is always one.");
    return;
  }

  /*
   * createOrReplace rather than a patch, because this document has a fixed id
   * and the script is the source for all of it. A patch would leave an old
   * class behind if one were ever taken out of CLASSES above.
   */
  const mutations = [{ createOrReplace: doc }];

  /*
   * The Classes entry in the main menu, added at Frank's request on
   * 2026-10-24. Before this the only way in was the band at the foot of
   * /services/recovery-sanctuary, which put the page three clicks from the
   * homepage; this makes it one.
   *
   * It goes first in navLinks, which renders after Services, Programmes and
   * About: a class is something Curate offers rather than a resource, so it
   * belongs beside those rather than beside Blog and Contact.
   *
   * SITE_SETTINGS_QUERY drops this entry while no class is switched on, by
   * the same condition the route 404s on, so the menu can never point at a
   * page that is not there.
   *
   * The whole array is written rather than an indexed append, per the CH-028
   * note, and the patch carries ifRevisionID so a Studio edit in flight
   * fails the mutation instead of being overwritten.
   */
  if (settings) {
    const navLinks = settings.navLinks ?? [];
    const already = navLinks.some((link) => link.href === NAV_LINK.href);

    if (already) {
      console.log("  The Classes entry is already in the menu, left alone.");
    } else {
      mutations.push({
        patch: {
          id: settings._id,
          ifRevisionID: settings._rev,
          set: { navLinks: [{ ...NAV_LINK, _key: "classes" }, ...navLinks] },
        },
      });
    }
  }

  const result = await mutate(mutations);

  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_id == $id][0]{title, "classes": count(classes), "names": classes[].dayOfWeek}`,
    { id: DOC_ID }
  );
  console.log(
    `  ${after.title}, ${after.classes} classes: ${(after.names || []).join(", ")}`
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
