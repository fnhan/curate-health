/**
 * Tai Chi's own Jane link, and the Pilates break. Frank, 2026-10-30.
 *
 *   node scripts/apply-class-corrections.js
 *   node scripts/apply-class-corrections.js --apply
 *
 * WHY THIS EXISTS
 *
 * `/classes` published two facts that were not true. CH-107 read the days and
 * times off Jane in October and nothing has re-read them since, so the page
 * carried on asserting a weekly rhythm neither class was keeping.
 *
 * **Tai Chi moved in Jane.** It was treatment 112 under the Recovery
 * Sanctuary discipline; it is now on Dr. Gabriele's own profile, which is why
 * the discipline link stopped resolving. Confirmed in a browser on
 * 2026-10-30: "Tai Chi with Dr. Gabriele", 50 minutes, $30.00, under Recovery
 * Sanctuary on his profile, which agrees with what this site already says.
 *
 * **Pilates is on a break until December**, Frank's own word. Jane's first
 * open week for it is 29 November to 5 December, so the first class back is
 * Wednesday 2 December. The site was saying Wednesdays and the markup was
 * publishing 4 November.
 *
 * WHY THE DATE STORED IS THE FIRST OF DECEMBER AND NOT THE SECOND
 *
 * `resumesOn` means "not before this date", and what Frank said was December.
 * `nextOccurrence` then searches forward for the class's own weekday, which
 * lands on Wednesday 2 December by itself. Storing the 2nd would be storing a
 * date this script worked out rather than the fact it was given, and it would
 * be wrong the moment the day of the week changed.
 *
 * NOTHING HERE IS GUESSED FROM A NOTE
 *
 * Both values were read off the live booking site. The CH-104 lesson is that
 * the one time a pasted Jane id went in unchecked it turned out to be Cold
 * Plunge & Sauna.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/** Read off Dr. Gabriele's profile in a browser on 2026-10-30. */
const TAI_CHI_BOOKING =
  "https://curatehealth.janeapp.com/#/staff_member/7/treatment/112";

/** Frank: "Pilates paused until dec". */
const PILATES_RESUMES = "2026-12-01";

const CHANGES = [
  {
    match: /tai chi/i,
    field: "bookingUrl",
    value: TAI_CHI_BOOKING,
    why: "its Jane link, now on Dr. Gabriele's profile rather than the discipline",
  },
  {
    match: /pilates/i,
    field: "resumesOn",
    value: PILATES_RESUMES,
    why: "the break, so the page names the first class back instead of a Wednesday it is not running",
  },
];

(async () => {
  const doc = await query(
    `*[_type == "classSchedule"][0]{
      _id, _rev,
      classes[]{ _key, "name": coalesce(treatment->title, name), dayOfWeek, startTime, bookingUrl, resumesOn }
    }`
  );

  if (!doc) {
    console.error("FAILED: no classSchedule document");
    process.exitCode = 1;
    return;
  }

  const problems = [];
  const set = {};

  console.log();
  console.log(`  ${doc.classes?.length ?? 0} classes on the schedule`);
  console.log();

  for (const change of CHANGES) {
    const hits = (doc.classes ?? []).filter((c) => change.match.test(c.name || ""));

    /*
     * One match, never "the first match". A rename in the Studio that made
     * two entries match, or none, is a reason to stop rather than to write to
     * whichever happened to come first.
     */
    if (hits.length !== 1) {
      problems.push(
        `${change.match} matches ${hits.length} classes, expected exactly 1`
      );
      continue;
    }

    const entry = hits[0];
    const current = entry[change.field];

    if (current === change.value) {
      console.log(`  ${entry.name}  ${change.field} already reads the new value`);
      continue;
    }

    console.log(`  ${entry.name}  ${change.why}`);
    console.log(`    ${change.field} was  ${JSON.stringify(current ?? null)}`);
    console.log(`    ${change.field} now  ${JSON.stringify(change.value)}`);
    console.log();

    /*
     * Patched by _key, not by index. An indexed path would write to whatever
     * sits at that position today, and the CH-028 note records an array whose
     * indexed patches were silently overwritten.
     */
    set[`classes[_key=="${entry._key}"].${change.field}`] = change.value;
  }

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (!Object.keys(set).length) {
    console.log("  Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([
    { patch: { id: doc._id, ifRevisionID: doc._rev, set } },
  ]);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type == "classSchedule"][0].classes[]{
      "name": coalesce(treatment->title, name), bookingUrl, resumesOn
    }`
  );
  console.log();
  for (const entry of after) {
    console.log(
      `  ${entry.name}  booking ${entry.bookingUrl || "(treatment page's)"}  resumes ${entry.resumesOn || "(running)"}`
    );
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
