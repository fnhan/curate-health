/**
 * Every class runs 50 minutes. Frank, 2026-10-26.
 *
 *   node scripts/set-class-duration.js
 *   node scripts/set-class-duration.js --apply
 *
 * The schedule had Outdoor Yoga Therapy and Tai Chi at 60 and Outdoor Pilates
 * at 50, read off Jane under CH-107. He has settled all three at 50 and is
 * changing Jane to match, so the site and the booking system agree again.
 *
 * **Jane is not in this repository.** Until he changes it there, Jane still
 * sells Yoga and Tai Chi as 60 minute sessions while the site says 50. That is
 * the CH-104 class of problem: a visitor reads one number here and books
 * another there.
 *
 * TWO LINES OF COPY GO WITH THE NUMBERS
 *
 * A duration is not only a field. The Tai Chi page says "an hour" twice, in
 * its opening paragraph and in the call to action heading, and leaving those
 * would have the page contradict the schedule two screens below it. Both are
 * rewritten here.
 *
 * **The Curate Lifestyle Program's "8 weekly group education sessions (60
 * minutes)" is deliberately untouched.** That is a programme session, not a
 * Recovery Sanctuary class, and nothing Frank said reaches it.
 *
 * Every replacement states the text it expects and the run is refused whole if
 * one no longer matches, per the dash sweep convention.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const MINUTES = 50;

/** Exact text, so a reworded field fails the run rather than being clobbered. */
const COPY = [
  {
    id: "treatment-tai-chi",
    path: "cta.ctaTitle",
    from: "Begin With a Single Hour",
    to: "Begin With a Single Class",
    why: "the heading cannot promise an hour when the class is fifty minutes",
  },
  {
    id: "treatment-tai-chi",
    path: "intro.introParagraph",
    find: "are worth an hour of your week",
    to: "are worth fifty minutes of your week",
    why: "same sentence, same claim",
  },
];

(async () => {
  const problems = [];

  const schedule = await query(
    `*[_type == "classSchedule"][0]{
      _id, _rev,
      "classes": classes[]{_key, name, "t": treatment->title, durationMinutes}
    }`
  );
  if (!schedule) throw new Error("no class schedule document");

  console.log();
  console.log("  Class length");
  const durationSet = {};
  schedule.classes.forEach((c, index) => {
    const label = c.name || c.t || c._key;
    if (c.durationMinutes === MINUTES) {
      console.log(`    ${label.padEnd(24)} ${MINUTES}, already`);
      return;
    }
    console.log(`    ${label.padEnd(24)} ${c.durationMinutes} -> ${MINUTES}`);
    durationSet[`classes[${index}].durationMinutes`] = MINUTES;
  });

  console.log();
  console.log("  Copy that says an hour");
  const copyPatches = [];
  for (const item of COPY) {
    const doc = await query(`*[_id == $id][0]{_id, _rev, "v": ${item.path}}`, {
      id: item.id,
    });
    if (!doc) {
      problems.push(`${item.id} is missing`);
      continue;
    }

    if (item.from !== undefined) {
      if (doc.v !== item.from) {
        problems.push(
          `${item.id} ${item.path} reads ${JSON.stringify(doc.v)}, expected ${JSON.stringify(item.from)}`
        );
        continue;
      }
      console.log(`    ${item.path}`);
      console.log(`      "${item.from}"  ->  "${item.to}"`);
      copyPatches.push({
        patch: {
          id: doc._id,
          ifRevisionID: doc._rev,
          set: { [item.path]: item.to },
        },
      });
      continue;
    }

    if (typeof doc.v !== "string" || !doc.v.includes(item.find)) {
      problems.push(`${item.id} ${item.path} no longer contains "${item.find}"`);
      continue;
    }
    const next = doc.v.replace(item.find, item.to);
    console.log(`    ${item.path}`);
    console.log(`      "${item.find}"  ->  "${item.to}"`);
    copyPatches.push({
      patch: {
        id: doc._id,
        ifRevisionID: doc._rev,
        set: { [item.path]: next },
      },
    });
  }

  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  const patches = [
    ...(Object.keys(durationSet).length
      ? [
          {
            patch: {
              id: schedule._id,
              ifRevisionID: schedule._rev,
              set: durationSet,
            },
          },
        ]
      : []),
    ...copyPatches,
  ];

  if (patches.length === 0) {
    console.log("  Everything already says fifty minutes. Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `{
      "classes": *[_type == "classSchedule"][0].classes[]{name, "t": treatment->title, durationMinutes},
      "cta": *[_id == "treatment-tai-chi"][0].cta.ctaTitle
    }`
  );
  after.classes.forEach((c) =>
    console.log(`  Reading back: ${(c.name || c.t).padEnd(24)} ${c.durationMinutes} min`)
  );
  console.log(`  Reading back: Tai Chi CTA "${after.cta}"`);
  console.log();
  console.log("  Jane still sells Yoga and Tai Chi as 60 minutes. That is Frank's to change.");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
