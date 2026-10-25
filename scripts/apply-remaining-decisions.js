/**
 * The last seven copy decisions, and a correction to how they are written.
 *
 *   node scripts/apply-remaining-decisions.js
 *   node scripts/apply-remaining-decisions.js --apply
 *
 * TWO OF THESE WERE REPORTED APPLIED ON 2026-10-24 AND WERE NOT
 *
 * c08 and c09 both edit an entry of `benefits` on the Curate Lifestyle
 * document, and so does c10. apply-decision-backlog.js built each one's new
 * array from the value it had READ, then set them one after another onto the
 * same patch under the same key. Each overwrote the last, so only c10 landed
 * and the script printed all three as changes.
 *
 * It is the CH-028 trap in a new shape. There the loss was an indexed patch
 * beside an array write in one transaction; here it is two whole-array writes
 * to one path in one patch. **Anything that edits the same array twice has to
 * fold both edits into one value**, which is what applyAll below does: it
 * threads the document through every edit in turn and patches once at the
 * end.
 *
 * The lesson for the next script: printing a change is not evidence it was
 * written. Read the field back.
 */
const { query, mutate } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/* ------------------------------------------------------------------ rules */

const DASHES = /[–—]/;
const CF = /\p{Cf}/u;

function ruleBreaks(label, text) {
  const out = [];
  if (!text) return out;
  if (CF.test(text)) out.push(`${label}: zero-width characters, retype it`);
  if (DASHES.test(text)) out.push(`${label}: em or en dash`);
  if (text.includes("!")) out.push(`${label}: exclamation mark`);
  if (/café/i.test(text)) out.push(`${label}: accented cafe`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  for (const [us, ca] of [
    ["honor", "honour"],
    ["color", "colour"],
    ["center", "centre"],
    ["flavor", "flavour"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  return out;
}

/* ------------------------------------------------------------------- copy */

/**
 * Apostrophes in c04, c05 and c29 are curly, matching the live copy in
 * those fields rather than normalising it.
 *
 * c04 and c07 both carry "harnesses" in his text. "harness the power of" is
 * the one banned phrase and neither of these is that phrase, so both stand
 * as he wrote them.
 */
const DECISIONS = [
  {
    id: "c08",
    doc: `*[_type=="serviceLifestyle" && !(_id in path("drafts.**"))][0]`,
    list: "benefits",
    title: "Sustain Energy Naturally",
    field: "description",
    expect: "starting the moment you wake up",
    to: "Experience all-day vitality with fewer crashes and more stamina, from the moment you wake up.",
  },
  {
    id: "c09",
    doc: `*[_type=="serviceLifestyle" && !(_id in path("drafts.**"))][0]`,
    list: "benefits",
    title: "Heal Through Nourishment",
    field: "description",
    expect: "enjoy improved digestion",
    to: "Rebalance your relationship with food, for better digestion and fewer cravings, and a weight you can sustain.",
  },
  {
    id: "c29",
    doc: `*[_type=="treatments" && treatmentSlug.current=="chiropractic-care"][0]`,
    list: "additionalSections",
    title: "The Foundation of Your Health",
    field: "sectionParagraph",
    expect: "ensuring that every part",
    to: "Just as a building relies on a solid foundation, your body’s wellness depends on the health of your spine and joints. With intricate knowledge of anatomy, physiology and biomechanics, our chiropractors bring a master builder’s touch to your body’s blueprint, helping every part of your skeletal structure, from the ground up, move at its best. Imagine the joy of being able to do the things you love, with more optimal body function, free of nagging aches and pains.",
  },
  {
    id: "c37",
    doc: `*[_type=="treatments" && treatmentSlug.current=="breathwork"][0]`,
    list: "additionalSections",
    title: "The Benefits of Breathwork",
    field: "sectionParagraph",
    expect: "a gateway to enhanced mental clarity",
    to: "Breathwork goes beyond the simple act of breathing. It can support mental clarity, emotional release, and physical relaxation. Through intentional breathing patterns, you can:",
    /*
     * This section's text is a lead-in followed by a bulleted list of
     * benefits, so only the FIRST block changes and the rest are kept.
     */
    firstBlockOnly: true,
  },
  {
    id: "c04",
    doc: `*[_type=="treatments" && treatmentSlug.current=="acupuncture"][0]`,
    list: "additionalSections",
    title: "Integrated Acupuncture: A Unified Path to Healing ",
    field: "sectionParagraph",
    expect: "Step into a serene world",
    to: "Step into a serene world where the ancient artistry of TCM meets the evidence-based precision of CMA. In a tranquil setting, whisper-thin needles, often barely felt, are expertly placed by licensed practitioners along meridians and neuromuscular points to harmonize your body’s energy and stimulate physiological healing. TCM restores the flow of Qi to address imbalances, easing pain, calming stress, and boosting vitality with centuries-old wisdom. Simultaneously, CMA targets nerves, muscles, and tissues, triggering endorphin release, reducing inflammation, and promoting recovery through modern scientific mechanisms. This integrated approach offers a minimally invasive therapy that often leaves you feeling refreshed and balanced.",
  },
  {
    id: "c05",
    doc: `*[_type=="treatments" && treatmentSlug.current=="acupuncture"][0]`,
    list: "additionalSections",
    title: "Personalized Acupuncture, Tailored for You",
    field: "sectionParagraph",
    expect: "uniquely crafted to honour your body",
    to: "At Curate Health, our integrated acupuncture approach is uniquely crafted to honour your body’s story. Practitioners begin with a thorough assessment of your symptoms and medical history, and of your goals, such as relief from chronic pain or a faster recovery. By attuning to your pulse, energy cues, and physical condition, they map out a treatment plan that blends traditional meridian-based techniques with modern neuroanatomical precision. Ultra-fine needles are strategically placed along meridians to restore energetic balance and into specific neuromuscular points to modulate pain and promote healing. Each session is tailored with elegant precision, addressing your unique needs and guiding you toward lasting vitality.",
  },
  {
    id: "c45",
    doc: `*[_type=="cafePage" && !(_id in path("drafts.**"))][0]`,
    list: "additionalSections",
    title: "Nourish Your Body, Feed Your Soul ",
    field: "sectionParagraph",
    expect: "every cup, every plate, and every moment",
    // One sentence inside a longer section, so it is a substitution rather
    // than a replacement of the whole field.
    replaceSentence: {
      from: "We offer a thoughtful alternative to the usual fast pace of everyday life: where every cup, every plate, and every moment can be enjoyed with purpose and presence.",
      to: "We offer a thoughtful alternative to the usual fast pace of everyday life, where every cup and every plate can be enjoyed with purpose and presence.",
    },
  },
];

/* -------------------------------------------------------------- machinery */

const textOf = (blocks) =>
  (blocks ?? [])
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n");

/** Replaces a one-span block's text, keeping its key, style and list level. */
const retext = (block, text) => ({
  ...block,
  children: (block.children ?? []).map((c, i) => (i === 0 ? { ...c, text } : c)),
});

(async () => {
  const problems = [];
  const changes = [];

  /*
   * Grouped by document, because two of these edit the same array on the
   * same document and that is exactly what went wrong last time. Each
   * document is read once, every edit is folded into one evolving value,
   * and it is patched once.
   */
  const byDoc = new Map();
  for (const d of DECISIONS) {
    if (!byDoc.has(d.doc)) byDoc.set(d.doc, []);
    byDoc.get(d.doc).push(d);
  }

  const patches = [];

  for (const [docQuery, group] of byDoc) {
    const doc = await query(`${docQuery}{_id, _rev, ${group[0].list}}`);
    if (!doc) {
      problems.push(`${group.map((g) => g.id).join(", ")}: no document matched`);
      continue;
    }

    let list = doc[group[0].list] ?? [];
    let touched = false;

    for (const d of group) {
      const i = list.findIndex((e) => e.sectionTitle === d.title || e.title === d.title);
      if (i === -1) {
        problems.push(`${d.id}: no entry titled "${d.title}" in ${d.list}`);
        continue;
      }

      const blocks = list[i][d.field] ?? [];
      const now = textOf(blocks);

      if (!now.includes(d.expect)) {
        problems.push(
          `${d.id}: "${d.title}" no longer contains "${d.expect}". It reads: ${now.slice(0, 120)}`
        );
        continue;
      }

      let next;
      if (d.replaceSentence) {
        // One sentence inside the field, so every block is walked and only
        // the span holding it is changed.
        next = blocks.map((b) =>
          b._type === "block"
            ? {
                ...b,
                children: (b.children ?? []).map((c) =>
                  typeof c.text === "string" &&
                  c.text.includes(d.replaceSentence.from)
                    ? {
                        ...c,
                        text: c.text.replace(
                          d.replaceSentence.from,
                          d.replaceSentence.to
                        ),
                      }
                    : c
                ),
              }
            : b
        );
        if (textOf(next) === now) {
          problems.push(`${d.id}: the sentence to replace was not found in any span`);
          continue;
        }
      } else if (d.firstBlockOnly) {
        next = blocks.map((b, j) => (j === 0 ? retext(b, d.to) : b));
      } else {
        next = blocks.map((b, j) => (j === 0 ? retext(b, d.to) : b));
        // Anything after the first block would be orphaned prose, so a
        // multi-block field is refused rather than half rewritten.
        if (blocks.filter((b) => b._type === "block").length > 1) {
          problems.push(
            `${d.id}: "${d.title}" is ${blocks.length} blocks, so replacing the first alone would leave the rest. Mark it firstBlockOnly if that is intended.`
          );
          continue;
        }
      }

      list = list.map((e, j) => (j === i ? { ...e, [d.field]: next } : e));
      touched = true;
      changes.push({
        id: d.id,
        where: `${doc._type} ${d.list} "${d.title.trim()}"`,
        from: now,
        to: textOf(next),
      });
    }

    if (touched) {
      patches.push({
        id: doc._id,
        ifRevisionID: doc._rev,
        set: { [group[0].list]: list },
      });
    }
  }

  for (const c of changes) problems.push(...ruleBreaks(c.id, c.to));

  console.log();
  for (const c of changes) {
    console.log(`  ${c.id}  ${c.where}`);
    console.log(`    WAS: ${c.from.replace(/\n/g, " ").slice(0, 190)}`);
    console.log(`    NOW: ${c.to.replace(/\n/g, " ").slice(0, 190)}`);
    console.log();
  }
  console.log(`  ${changes.length} changes across ${patches.length} documents.`);
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

  const result = await mutate(patches.map((patch) => ({ patch })));
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  /*
   * Read every field back, because the bug this script exists to correct
   * reported success while writing nothing.
   */
  console.log("\n  Reading back:");
  for (const [docQuery, group] of byDoc) {
    const doc = await query(`${docQuery}{${group[0].list}}`);
    for (const d of group) {
      const entry = (doc[d.list] ?? []).find(
        (e) => e.sectionTitle === d.title || e.title === d.title
      );
      const now = textOf(entry?.[d.field]);
      const want = d.replaceSentence ? d.replaceSentence.to : d.to;
      console.log(`    ${d.id}  ${now.includes(want.slice(0, 60)) ? "in" : "NOT IN"}`);
    }
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
