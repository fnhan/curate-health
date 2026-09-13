/**
 * The cafe copy Frank approved on 2026-09-12.
 *
 *   node scripts/apply-cafe-copy.js           # dry run, writes nothing
 *   node scripts/apply-cafe-copy.js --apply
 *
 * Three changes to cafePage:
 *
 *   1. A new "What we cook with" section, carrying the facts that make the
 *      cafe different and that appeared nowhere in the 822 words already on
 *      the page. It said "organic" and "seasonal", which every wellness cafe
 *      in the city says, and none of the checkable specifics.
 *   2. The Bring Your Own Vessel sentence stops saying "all beverages", so the
 *      rename actually covers food. The thank-you stays, at Frank's request.
 *   3. "café" loses its accent. House spelling is "cafe" everywhere.
 *
 * ORDER MATTERS IN THIS TRANSACTION
 *
 * Sanity applies patches in sequence, and two of these address content by
 * array index. Inserting the new section first would shift those indices under
 * the edits that follow and land them on the wrong paragraph. So both text
 * edits go first and the insert goes last.
 *
 * A SET THAT MATCHES NOTHING IS NOT AN ERROR
 *
 * Sanity accepts a patch whose path matches no part of the document and reports
 * the transaction as applied. A bare additionalSections[] wildcard does not
 * match, so the first run of this script reported success and changed nothing
 * but the insert. Paths here are built from indices located at run time, and
 * the script re-reads the document afterwards and fails if the values did not
 * actually change.
 *
 * The section is inserted after the opening one rather than appended, so the
 * specifics sit high on the page instead of below the closing call to action.
 * The array stays drag-sortable in the Studio if Frank wants it elsewhere.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const SECTION_TITLE = "What we cook with";

const PARAGRAPHS = [
  "No industrial seed oils, and no refined sugar in anything we make. Where something needs sweetening, it is local maple or honey.",
  "Produce is Ontario-grown and seasonal when possible, so the menu items may change through the year rather than staying fixed.",
  "We pay attention to what the food touches as well as what goes into it, and keep plastic out of preparation and storage wherever there is a workable alternative.",
];

/** The vessel sentence, with "all beverages" removed so food is included. */
const VESSEL_BLOCK_KEY = "13a25328bb87";
const VESSEL_LEAD_KEY = "a1c576ce98fe0";
const VESSEL_LEAD_TO =
  "In addition to functional nourishment, sustainability is central to our values. We strongly believe small, conscious choices create meaningful impact. As part of our commitment to being environmentally conscious, we encourage guests to participate in our ";
const VESSEL_TAIL_KEY = "a1c576ce98fe2";
const VESSEL_TAIL_TO =
  " initiative, whether for a drink or something to eat, with a $1 discount as a thank-you for saving the planet and supporting our low-waste mission.";

/** The one accented spelling in the dataset. */
const ACCENT_SPAN_KEY = "cb8f3f52c5f5";

const SURVEY = `*[_type == "cafePage"][0]{
  _id, _rev,
  additionalSections[]{_key, sectionTitle, sectionParagraph[]{_key, children[]{_key, text}}}
}`;

const block = (text, i) => ({
  _key: `cook-${i}`,
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: `cook-${i}-0`, _type: "span", text, marks: [] }],
});

async function main() {
  const doc = await query(SURVEY);
  if (!doc) throw new Error("No cafePage document found.");

  console.log(`cafePage ${doc._id} rev ${doc._rev}\n`);

  const sections = doc.additionalSections ?? [];

  if (sections.some((s) => (s.sectionTitle ?? "").trim() === SECTION_TITLE)) {
    console.log(`"${SECTION_TITLE}" already exists. Nothing to insert.`);
  }

  // Locate the accented span by key, and report what is actually there, so a
  // changed document fails loudly rather than patching the wrong paragraph.
  const locate = (blockKey) => {
    for (let si = 0; si < sections.length; si++) {
      for (const b of sections[si].sectionParagraph ?? []) {
        if (b._key === blockKey) return { si, block: b };
      }
    }
    return null;
  };

  const accentAt = locate(ACCENT_SPAN_KEY);
  const vesselAt = locate(VESSEL_BLOCK_KEY);

  if (!accentAt || !vesselAt) {
    console.error(
      "Could not find the blocks this script edits. The copy has changed " +
        "since it was written. Re-read the document rather than widening the match."
    );
    process.exitCode = 2;
    return;
  }

  const accentText = accentAt.block.children?.[0]?.text ?? null;
  const accentPath = `additionalSections[${accentAt.si}].sectionParagraph[_key=="${ACCENT_SPAN_KEY}"]`;

  const mutations = [];

  // ---- 1. accent ----
  if (accentText && /caf[\u00e9\u00c9]/.test(accentText)) {
    const fixed = accentText
      .replace(/caf\u00e9/g, "cafe")
      .replace(/Caf\u00c9/g, "Cafe");
    console.log("accent fix:");
    console.log(`  at   ${accentPath}`);
    console.log(`  from ${JSON.stringify(accentText)}`);
    console.log(`  to   ${JSON.stringify(fixed)}\n`);
    mutations.push({
      patch: {
        id: doc._id,
        set: {
          [`${accentPath}.children[0].text`]: fixed,
        },
      },
    });
  } else {
    console.log("accent fix: nothing accented found, skipping\n");
  }

  // ---- 2. vessel sentence ----
  console.log("vessel sentence:");
  console.log(`  lead -> ...${VESSEL_LEAD_TO.slice(-60)}`);
  console.log(`  tail -> ${VESSEL_TAIL_TO.slice(0, 70)}...\n`);
  mutations.push({
    patch: {
      id: doc._id,
      set: {
        [`additionalSections[${vesselAt.si}].sectionParagraph[_key=="${VESSEL_BLOCK_KEY}"].children[_key=="${VESSEL_LEAD_KEY}"].text`]:
          VESSEL_LEAD_TO,
        [`additionalSections[${vesselAt.si}].sectionParagraph[_key=="${VESSEL_BLOCK_KEY}"].children[_key=="${VESSEL_TAIL_KEY}"].text`]:
          VESSEL_TAIL_TO,
      },
    },
  });

  // ---- 3. the new section, last, so the insert cannot shift the paths above ----
  if (!sections.some((s) => (s.sectionTitle ?? "").trim() === SECTION_TITLE)) {
    console.log(
      `new section "${SECTION_TITLE}", after "${sections[0]?.sectionTitle?.trim()}":`
    );
    PARAGRAPHS.forEach((p) => console.log(`  ${p}`));
    mutations.push({
      patch: {
        id: doc._id,
        insert: {
          after: "additionalSections[0]",
          items: [
            {
              _key: "section-what-we-cook-with",
              _type: "additionalSection",
              sectionTitle: SECTION_TITLE,
              sectionParagraph: PARAGRAPHS.map(block),
            },
          ],
        },
      },
    });
  }

  if (!APPLY) {
    console.log(`\nDry run. ${mutations.length} mutation(s) would be sent.`);
    console.log("Re-run with --apply to write.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  // Read it back. Sanity accepts a patch whose path matches nothing and
  // reports the transaction as applied, so a transaction id proves only that
  // the request was accepted. The first run of this script came back with an
  // id having changed nothing but the insert.
  const after = await query(SURVEY);
  const blocks = (after.additionalSections ?? []).flatMap(
    (s) => s.sectionParagraph ?? []
  );
  const textOf = (key) =>
    (blocks.find((b) => b._key === key)?.children ?? [])
      .map((c) => c.text)
      .join("");

  const failures = [];
  if (/caf[éÉ]/.test(textOf(ACCENT_SPAN_KEY))) {
    failures.push("the accented spelling is still there");
  }
  if (textOf(VESSEL_BLOCK_KEY).includes("all beverages")) {
    failures.push('the vessel sentence still says "all beverages"');
  }
  if (
    !(after.additionalSections ?? []).some(
      (s) => (s.sectionTitle ?? "").trim() === SECTION_TITLE
    )
  ) {
    failures.push(`"${SECTION_TITLE}" was not inserted`);
  }

  if (failures.length) {
    console.error("\nWrote, but the document did not change:");
    failures.forEach((f) => console.error("  " + f));
    process.exitCode = 1;
    return;
  }

  console.log("Verified against the document: every change is in.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
