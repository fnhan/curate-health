/**
 * Three things Frank asked for on 2026-10-24.
 *
 *   node scripts/apply-group-cap-and-tai-chi-photo.js
 *   node scripts/apply-group-cap-and-tai-chi-photo.js --apply
 *
 * c16, THE GROUP LEARNING LINE
 *
 * The last of the September decisions. It is one numbered item inside the
 * "How does the program work?" answer rather than a field of its own, which
 * is why it waited: the answer is five blocks and only the fourth changes.
 * Its neighbour, the Holistic Care Model line, is already his wording.
 *
 * THE GROUP IS 6 TO 12, NOT 6 TO 15
 *
 * "Please seek out everywhere on the website that says between 6 and 15 and
 * change it to 6 to 12." Three places carried it: the Curate Lifestyle
 * benefit, the Group Learning line above, and one hardcoded list item in
 * service-lifestyle.tsx, which is changed in the same commit.
 *
 * The sweep was a script over every string in every document rather than a
 * grep, for the reason audit-booking-links.js is: these sit in a benefit
 * description, inside portable text in an FAQ answer, and in a component,
 * and a list of field names written from memory misses one.
 *
 * THE TAI CHI PHOTOGRAPH ON /classes
 *
 * The fourth frame of the four he sent, which nothing used. It goes on the
 * schedule entry rather than on the treatment page, so /classes shows a
 * different frame from the one at the top of the Tai Chi page. Uploaded
 * whole with a hotspot, so he can reframe it in the Studio.
 */
const fs = require("fs");
const path = require("path");

const { query, mutate, uploadImage } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const PHOTOS = process.env.TAI_CHI_PHOTOS;
if (!PHOTOS) {
  console.error("Set TAI_CHI_PHOTOS to the folder holding the frames.");
  process.exit(1);
}

/** His approved wording, with the cap at 12. */
const GROUP_LEARNING =
  "Group Learning: Weekly small-group sessions of 6 to 12 people, with a short talk followed by questions and practical demos.";

const BENEFIT =
  "Engage in small group sessions of 6 to 12 people for real-time answers, guidance, and shared motivation.";

/**
 * His face sits a little left of centre and about a third down in the fourth
 * frame, so the hotspot puts the 4:3 card on him rather than on the fence.
 */
const TAI_CHI_HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: 0.44,
  y: 0.33,
  width: 0.55,
  height: 0.6,
};

const TAI_CHI_ALT =
  "Dr. David Gabriele with both hands raised and open, mid Tai Chi movement, in the Recovery Sanctuary.";

/** Replaces a one-span block's text, keeping its key, style and list level. */
const retext = (block, text) => ({
  ...block,
  children: (block.children ?? []).map((c, i) =>
    i === 0 ? { ...c, text } : c
  ),
});

const textOf = (blocks) =>
  (blocks ?? [])
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n");

(async () => {
  const problems = [];
  const changes = [];

  const sl = await query(
    `*[_type == "serviceLifestyle" && !(_id in path("drafts.**"))][0]{_id, _rev, benefits, faq}`
  );
  if (!sl) throw new Error("no serviceLifestyle document");

  /* ------------------------------------------- c16 and the Group Learning */

  const faqIndex = (sl.faq ?? []).findIndex(
    (f) => f.title === "How does the program work?"
  );
  if (faqIndex === -1) problems.push("no How does the program work answer");

  let faq = sl.faq;
  if (faqIndex !== -1) {
    const blocks = sl.faq[faqIndex].description ?? [];
    const i = blocks.findIndex((b) =>
      (b.children ?? [])
        .map((c) => c.text ?? "")
        .join("")
        .startsWith("Group Learning:")
    );
    if (i === -1) problems.push("c16: no Group Learning line in that answer");
    else {
      const now = (blocks[i].children ?? []).map((c) => c.text).join("");
      if (now !== GROUP_LEARNING) {
        changes.push({ what: "c16  Group Learning", from: now, to: GROUP_LEARNING });
        const next = blocks.map((b, j) => (j === i ? retext(b, GROUP_LEARNING) : b));
        faq = sl.faq.map((f, j) =>
          j === faqIndex ? { ...f, description: next } : f
        );
      }
    }
  }

  /* -------------------------------------------- the benefit, 6 to 12 */

  const bIndex = (sl.benefits ?? []).findIndex(
    (b) => b.title === "Connect & Learn in Real Time"
  );
  if (bIndex === -1) problems.push("no Connect & Learn in Real Time benefit");

  let benefits = sl.benefits;
  if (bIndex !== -1) {
    const now = textOf(sl.benefits[bIndex].description);
    if (now !== BENEFIT) {
      changes.push({ what: "the benefit, 6 to 12", from: now, to: BENEFIT });
      benefits = sl.benefits.map((b, j) =>
        j === bIndex
          ? {
              ...b,
              description: (b.description ?? []).map((blk, k) =>
                k === 0 ? retext(blk, BENEFIT) : blk
              ),
            }
          : b
      );
    }
  }

  /* ------------------------------------------- the Tai Chi photograph */

  const frame = path.join(PHOTOS, "photo2.jpg");
  if (!fs.existsSync(frame)) problems.push(`missing ${frame}`);

  const schedule = await query(
    `*[_type == "classSchedule"][0]{_id, _rev, classes}`
  );
  if (!schedule) problems.push("no classSchedule document");

  const cIndex = (schedule?.classes ?? []).findIndex((c) => c._key === "tai-chi");
  if (schedule && cIndex === -1) problems.push("no tai-chi entry on the schedule");

  const alreadyHasPhoto =
    cIndex !== -1 && Boolean(schedule.classes[cIndex].image?.asset);

  /* ------------------------------------------------------------- print */

  console.log();
  for (const c of changes) {
    console.log(`  ${c.what}`);
    console.log(`    WAS: ${c.from}`);
    console.log(`    NOW: ${c.to}`);
    console.log();
  }
  console.log(
    `  Tai Chi on /classes: ${alreadyHasPhoto ? "already has its own photograph" : "the fourth frame, uploaded whole with a hotspot"}`
  );
  console.log(
    "  The hardcoded (6-15 people) in service-lifestyle.tsx is in the same commit."
  );
  console.log();

  if (problems.length) {
    console.log("  REFUSING TO WRITE:");
    for (const p of problems) console.log(`    ${p}`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const mutations = [];

  if (changes.length) {
    mutations.push({
      patch: {
        id: sl._id,
        ifRevisionID: sl._rev,
        set: { faq, benefits },
      },
    });
  }

  if (!alreadyHasPhoto) {
    const asset = await uploadImage(
      fs.readFileSync(frame),
      "tai-chi-hands-raised.jpg",
      "image/jpeg"
    );
    console.log(`  uploaded ${asset._id}`);

    const classes = schedule.classes.map((c, j) =>
      j === cIndex
        ? {
            ...c,
            image: {
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
              hotspot: TAI_CHI_HOTSPOT,
              alt: TAI_CHI_ALT,
            },
          }
        : c
    );

    mutations.push({
      patch: {
        id: schedule._id,
        ifRevisionID: schedule._rev,
        set: { classes },
      },
    });
  }

  const result = await mutate(mutations);
  console.log(`\n  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
