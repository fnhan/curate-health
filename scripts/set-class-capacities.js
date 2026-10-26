/**
 * The capacity on the two classes that had none. Frank, 2026-10-26.
 *
 *   node scripts/set-class-capacities.js
 *   node scripts/set-class-capacities.js --apply
 *
 * CH-107 left Outdoor Yoga Therapy and Tai Chi empty rather than guessing
 * them from Outdoor Pilates, which has said 12 since 2026-10-13. Asked which
 * they take, Frank answered "the capacity is 12 for the outdoor classes",
 * which is all three: every one of them runs in the Recovery Sanctuary.
 *
 * An empty capacity is a legitimate state and the page simply omits the line,
 * so this writes the two that are missing and leaves anything already set
 * alone. Re-running it does nothing.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const CAPACITY = 12;

(async () => {
  const doc = await query(
    `*[_type == "classSchedule"][0]{
      _id, _rev,
      "classes": classes[]{_key, name, "t": treatment->title, capacity}
    }`
  );
  if (!doc) throw new Error("no class schedule document");

  const missing = doc.classes
    .map((c, index) => ({ ...c, index, label: c.name || c.t || c._key }))
    .filter((c) => typeof c.capacity !== "number");

  console.log();
  console.log("  Class capacity");
  doc.classes.forEach((c) =>
    console.log(
      `    ${(c.name || c.t || c._key).padEnd(24)} ${
        typeof c.capacity === "number" ? `${c.capacity}, left alone` : `empty -> ${CAPACITY}`
      }`
    )
  );
  console.log();

  if (missing.length === 0) {
    console.log("  Every class already has one. Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  /*
   * Indexed patches, and no array write in the same transaction, so the
   * CH-028 hazard does not apply: that one is about indexed patches being
   * overwritten by a whole-array write sent alongside them.
   */
  const set = {};
  missing.forEach((c) => {
    set[`classes[${c.index}].capacity`] = CAPACITY;
  });

  const result = await mutate([
    { patch: { id: doc._id, ifRevisionID: doc._rev, set } },
  ]);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type == "classSchedule"][0].classes[]{name, "t": treatment->title, capacity}`
  );
  after.forEach((c) =>
    console.log(`  Reading back: ${(c.name || c.t).padEnd(24)} ${c.capacity}`)
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
