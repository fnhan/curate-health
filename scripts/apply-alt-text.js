/**
 * CH-028. Writes the alt text Frank approved, and merges the cafe section
 * that has no image into the one that does.
 *
 *   node scripts/apply-alt-text.js            dry run, writes nothing
 *   node scripts/apply-alt-text.js --apply
 *
 * Every value here was drafted from the image itself, not from the filename
 * or the surrounding copy, and approved on 2026-09-13. The essential series
 * line carries Frank's correction: that photo shows a functional pulley
 * machine, not a resistance band.
 *
 * Run scripts/audit-alt-text.js afterwards. This writes to Sanity; whether
 * the page shows it is a separate question, and the plumbing fixed in #235 is
 * the reason to check rather than assume.
 */

const { mutate, query } = require("./lib/sanity-cli");

const apply = process.argv.includes("--apply");

/**
 * Each entry names the document by type, the path to the alt field, and the
 * value. Paths are resolved against the live document at run time rather than
 * written as wildcards: a bare `additionalSections[]` patch matches nothing
 * and reports success, which cost a day on CH-025.
 */
const ALT = [
  {
    type: "ourPrograms",
    path: "essentialSeries.image.alt",
    value:
      "A practitioner guiding a patient through an exercise on a functional pulley machine, one hand on her shoulder blade.",
  },
  {
    type: "ourPrograms",
    path: "curateLifestyle.image.alt",
    value:
      "A participant taking notes during a group session, seated in a circle of chairs.",
  },
  {
    type: "ourPrograms",
    path: "masterHealthBlueprint.image.alt",
    value: "A pencil and ruler resting on a technical drawing.",
  },
  {
    type: "ourPrograms",
    path: "exploreYourOptions.image.alt",
    value: "Green stems in a clear glass bottle on a wooden board.",
  },
  {
    type: "contactPage",
    path: "contactForm.alt",
    value: "A single monstera leaf in a clear glass vase.",
  },
  {
    type: "cafePage",
    path: "ctaBandSection.backgroundImage.alt",
    value: "Mist between trees in a green forest.",
  },
];

/**
 * Two alt values that are already live and wrong.
 *
 * The second is an entire assistant reply pasted into the field, preamble,
 * label, unterminated quote and all. It is on the page now.
 */
const FIXES = [
  {
    type: "cafePage",
    match: /kombutcha/,
    value:
      "Two textured glass tumblers of turquoise and lavender kombucha on a white ridged side table, beside a potted fiddle leaf fig.",
  },
  {
    type: "cafePage",
    match: /Here's the alt text/,
    value:
      "Iced coffee in a textured glass on a wooden rail, with greenery and a pergola behind.",
  },
];

function span(text) {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 14),
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: Math.random().toString(36).slice(2, 14), marks: [], text },
    ],
  };
}

/** Flattens a portable text block to its plain text, for printing. */
function plain(blocks) {
  return (blocks || [])
    .flatMap((b) => (b.children || []).map((c) => c.text))
    .join(" ");
}

async function main() {
  const patches = [];
  const report = [];

  for (const entry of [...ALT]) {
    const docs = await query(
      `*[_type == $type && !(_id in path("drafts.**"))]{_id}`,
      { type: entry.type }
    );

    if (!docs.length) {
      throw new Error(`No ${entry.type} document. Refusing to guess.`);
    }

    for (const doc of docs) {
      patches.push({
        patch: { id: doc._id, set: { [entry.path]: entry.value } },
      });
      report.push(`  ${entry.type}  ${entry.path}\n      ${entry.value}`);
    }
  }

  /* ---- the blog and cafe section images, located by index ------------ */

  const posts = await query(
    `*[_type == "post" && !(_id in path("drafts.**"))]{_id, "slug": slug.current, sections}`
  );

  const POST_ALT = {
    "joints-in-motion-prioritizing-joint-health-for-lifelong-mobility": [
      "A therapist supporting an older man's arm as he lifts a dumbbell.",
      "An older couple holding foam floats in a swimming pool.",
      "An older man drinking a glass of water in a kitchen.",
    ],
    "curate-health-on-diet-and-exercise": [
      "Dried herbs and flowers in small bowls around a dropper bottle.",
      "Dried herbs, spices and garlic in white bowls around a mortar and pestle.",
      "A woman holding a barbell across her shoulders, photographed from behind.",
    ],
  };

  for (const post of posts) {
    const values = POST_ALT[post.slug];
    if (!values) continue;

    (post.sections || []).forEach((section, index) => {
      if (!section.sectionImage?.image?.asset?._ref) return;
      const value = values[index];
      if (!value) return;
      patches.push({
        patch: {
          id: post._id,
          set: { [`sections[${index}].sectionImage.alt`]: value },
        },
      });
      report.push(
        `  post ${post.slug}\n      sections[${index}].sectionImage.alt\n      ${value}`
      );
    });
  }

  const cafe = await query(
    `*[_type == "cafePage" && !(_id in path("drafts.**"))][0]{_id, additionalSections}`
  );

  const foodIndex = cafe.additionalSections.findIndex(
    (s) => s.sectionTitle === "Food Is Medicine"
  );
  const cookIndex = cafe.additionalSections.findIndex(
    (s) => s.sectionTitle === "What we cook with"
  );

  if (foodIndex < 0 || cookIndex < 0) {
    throw new Error(
      "Could not find both cafe sections by title. Refusing to patch by index."
    );
  }

  patches.push({
    patch: {
      id: cafe._id,
      set: {
        [`additionalSections[${foodIndex}].sectionImage.alt`]:
          "Three energy balls in a black bowl, rolled in matcha, chopped nuts and golden crumb.",
      },
    },
  });
  report.push(
    `  cafePage  additionalSections[${foodIndex}] (Food Is Medicine) sectionImage.alt`
  );

  /* ---- the two live values that are wrong ---------------------------- */

  for (const fix of FIXES) {
    const found = cafe.additionalSections.findIndex((s) =>
      fix.match.test(s.sectionImage?.alt ?? "")
    );
    if (found < 0) {
      console.log(`  (already fixed: ${fix.match})`);
      continue;
    }
    patches.push({
      patch: {
        id: cafe._id,
        set: { [`additionalSections[${found}].sectionImage.alt`]: fix.value },
      },
    });
    report.push(
      `  cafePage  additionalSections[${found}].sectionImage.alt  REPLACES:\n` +
        `      ${JSON.stringify(cafe.additionalSections[found].sectionImage.alt.slice(0, 90))}\n` +
        `      ${fix.value}`
    );
  }

  /* ---- merge the section with no image into the one with a photo ----- */

  const cook = cafe.additionalSections[cookIndex];
  const food = cafe.additionalSections[foodIndex];

  /**
   * The specifics lead, the general claims follow.
   *
   * Straight concatenation put "Food Is Medicine" first, which opens on
   * claims any cafe could make and buries the only lines nobody else can say:
   * no industrial seed oils, no refined sugar, maple or honey, Ontario-grown.
   * Those are what a search engine and a reader are here for, so they go
   * first.
   *
   * No sentence is added, removed or rewritten. The only character that
   * changes is the em dash in the existing copy, which the content rules in
   * CLAUDE.md forbid, replaced by the comma it was standing in for.
   */
  const merged = [
    ...(cook.sectionParagraph || []).map((b) => span(plain([b]))),
    ...(food.sectionParagraph || []).map((b) =>
      span(plain([b]).replace(/\s*—\s*/g, ", "))
    ),
  ];

  const remaining = cafe.additionalSections.filter((_, i) => i !== cookIndex);

  patches.push({
    patch: {
      id: cafe._id,
      set: {
        [`additionalSections[${foodIndex}].sectionParagraph`]: merged,
      },
    },
  });
  /**
   * THE WHOLE-ARRAY WRITE MUST CARRY THE INDEXED EDITS, NOT FOLLOW THEM
   *
   * Removing one entry shifts every index after it, so the array is rewritten
   * rather than spliced. The first run of this script pushed three
   * `additionalSections[n].sectionImage.alt` patches and then this one, in the
   * same transaction. Sanity applied them in order, and this overwrote all
   * three with the array as it had been read before any of them ran. The
   * script reported success and three alt values were silently lost,
   * including the fix for the assistant reply that is live on the page.
   *
   * So every edit to this array is folded into the value written here, and
   * nothing patches it by index.
   */
  const altEdits = new Map(
    patches
      .filter((p) => p.patch.id === cafe._id)
      .flatMap((p) => Object.entries(p.patch.set))
      .map(([path, value]) => [path, value])
  );

  const rewritten = remaining.map((section, i) => {
    const originalIndex = cafe.additionalSections.indexOf(section);
    const altPath = `additionalSections[${originalIndex}].sectionImage.alt`;
    const alt = altEdits.get(altPath);
    const isFood = section.sectionTitle === "Food Is Medicine";

    return {
      ...section,
      ...(isFood ? { sectionParagraph: merged } : {}),
      ...(alt
        ? { sectionImage: { ...section.sectionImage, alt } }
        : {}),
    };
  });

  // Drop the indexed patches this array write would have clobbered.
  for (let i = patches.length - 1; i >= 0; i -= 1) {
    const set = patches[i].patch.set;
    if (
      patches[i].patch.id === cafe._id &&
      Object.keys(set).some((k) => k.startsWith("additionalSections["))
    ) {
      patches.splice(i, 1);
    }
  }

  patches.push({
    patch: { id: cafe._id, set: { additionalSections: rewritten } },
  });

  report.push(
    `  cafePage  merge "What we cook with" into "Food Is Medicine"\n` +
      `      sections ${cafe.additionalSections.length} -> ${remaining.length}`
  );

  console.log(
    `${apply ? "APPLY" : "DRY RUN"}  ${patches.length} patches\n`
  );
  console.log(report.join("\n"));

  console.log("\n--- merged Food Is Medicine reads ---\n");
  console.log(plain(merged).replace(/(.{95}\s)/g, "$1\n"));

  if (!apply) {
    console.log("\nNothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`\nWrote in transaction ${result.transactionId}`);

  const back = await query(
    `*[_type == "cafePage" && !(_id in path("drafts.**"))][0]{"n": count(additionalSections), additionalSections[]{sectionTitle,"alt":sectionImage.alt}}`
  );
  console.log(`\ncafePage now has ${back.n} sections:`);
  for (const s of back.additionalSections) {
    console.log(`  ${String(s.sectionTitle).padEnd(38)} alt: ${s.alt ? "yes" : "NONE"}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
