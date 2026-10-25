/**
 * The decisions Frank settled on 2026-10-24, from the copy review.
 *
 *   node scripts/apply-frank-decisions.js           # dry run, prints every change
 *   node scripts/apply-frank-decisions.js --apply
 *
 * This is the first batch, and it is the items he named in his own words in
 * that message rather than the whole 48. The rest are located by
 * scripts/locate-decisions.js and go in a second pass.
 *
 * EVERY CHANGE STATES THE TEXT IT EXPECTS
 *
 * Same guard as the dash sweep: if a field no longer reads what this script
 * was written against, the whole run refuses rather than writing one paragraph
 * over another. Decision ids come from the review page and are not stable
 * enough to key on, and nor is array position.
 *
 * WHAT IS IN IT
 *
 *   c46   Cafe, "Where Every Bite Matters", his wording, with "our menu"
 *         linked to /cafe/menu
 *   s06   Products share title, his wording
 *   s10   Blog share pictures: clear the override so each post uses its own
 *         photograph, on BOTH posts rather than only the one he reviewed
 */
const { query, mutate } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/* ------------------------------------------------------------------- copy */

/**
 * c46, Frank 2026-10-24, verbatim.
 *
 * Split into three spans so "our menu" can carry the link he asked for:
 * "link the menu page in the words 'our menu'".
 *
 * His text arrived with straight apostrophes and this section is curly
 * throughout, so they are reconciled to the section rather than normalised,
 * per the dash sweep note.
 *
 * THE CALL TO ACTION IS NOT IN THIS SECTION, AND THAT IS DELIBERATE.
 *
 * His text ended on three sentences that the call to action band further down
 * the same page already says word for word. That is the duplication he had cut
 * from this very section on 2026-10-20, and shown it again on 2026-10-24 he
 * asked for it cut again: "revert the cafe text back so there's no
 * duplications". So the section closes on its own last point, about seasonal
 * sourcing, and the band carries the pitch.
 *
 * The second "our menu" link went with those sentences. The one in "Our menu
 * changes seasonally" is the link he asked for and it stays.
 */
const CAFE_BITE_SPANS = [
  {
    text:
      "Curate Cafe is more than a place to grab a drink or meal. It’s a space to slow down, savour, reflect, and look after your well-being. Here, quality and wellness come first. We look forward to welcoming you in, sharing a cup, and helping you make every bite a step toward feeling your best. ",
  },
  { text: "Our menu", link: "/cafe/menu" },
  {
    text:
      " changes seasonally, reflecting the freshest ingredients available and keeping your healthy eating experience exciting and varied. This approach not only supports local farmers and sustainability but also ensures that you receive the maximum nutritional support your body needs for the season it’s in.",
  },
];

/**
 * The openings this script is prepared to overwrite, rather than one.
 *
 * It has to be a list because the script has already run once: the first run
 * wrote his text with the duplicated tail, and the second writes the same text
 * without it. A guard matching only the original would refuse the second run,
 * and widening it to the one sentence both share would stop it noticing a
 * wholesale rewrite, which is the thing it exists to catch.
 */
const CAFE_BITE_EXPECT = [
  // What was live before any of this, from the 2026-10-20 dedupe.
  "Curate Cafe is more than a place to grab a drink or meal. It’s a space to savour, reflect, and realign with your well-being.",
  // What the first run of this script wrote, on 2026-10-24.
  "Curate Cafe is more than a place to grab a drink or meal. It’s a space to slow down, savour, reflect, and look after your well-being.",
];

/** s06, his wording on 2026-10-24, replacing "Not Sold Off a Shelf". */
const PRODUCTS_SHARE_TITLE =
  "Fitted by a Practitioner, custom and curated just for you.";

/* ------------------------------------------------------------ rule checks */

const DASHES = /[–—]/;
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
  if (/café/i.test(text)) out.push(`${label}: accented cafe`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  for (const [us, ca] of [
    ["flavor", "flavour"],
    ["savor", "savour"],
    ["honor", "honour"],
    ["color", "colour"],
    ["center", "centre"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  return out;
}

/* ------------------------------------------------------------------ shape */

/** Keys derived from the text, so a re-run writes the same document. */
const key = (text, n) =>
  `${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20)}-${n}`;

/** One block carrying the spans, with a markDef for each linked span. */
function buildBlock(spans) {
  const markDefs = [];
  const children = spans.map((span, i) => {
    const marks = [];
    if (span.link) {
      const defKey = key(span.text, `link${i}`);
      markDefs.push({ _key: defKey, _type: "link", href: span.link });
      marks.push(defKey);
    }
    return {
      _key: key(span.text, i),
      _type: "span",
      marks,
      text: span.text,
    };
  });

  return [
    {
      _key: "where-every-bite-matters",
      _type: "block",
      style: "normal",
      markDefs,
      children,
    },
  ];
}

(async () => {
  const problems = [];
  const changes = [];

  /* ------------------------------------------------------ c46, the cafe */

  const cafe = await query(
    `*[_type == "cafePage" && !(_id in path("drafts.**"))][0]{_id, _rev, additionalSections}`
  );
  if (!cafe) throw new Error("no published cafePage");

  const sectionIndex = (cafe.additionalSections ?? []).findIndex(
    (s) => s._key === "a0e65e61c684"
  );
  if (sectionIndex === -1) {
    problems.push("c46: no cafe section with _key a0e65e61c684");
  } else {
    const section = cafe.additionalSections[sectionIndex];
    const now = (section.sectionParagraph ?? [])
      .filter((b) => b._type === "block")
      .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
      .join("\n");

    if (!CAFE_BITE_EXPECT.some((opening) => now.startsWith(opening))) {
      problems.push(
        `c46: the section no longer opens on any text this was written against.\n       found: ${now.slice(0, 130)}`
      );
    } else {
      changes.push({
        what: "c46  Cafe, Where Every Bite Matters",
        from: now,
        to: CAFE_BITE_SPANS.map((s) => s.text).join(""),
        note: 'with "Our menu" linked to /cafe/menu',
      });
    }
  }

  /* -------------------------------------------- s06, the products share */

  const products = await query(
    `*[_type == "productsPage" && !(_id in path("drafts.**"))][0]{_id, _rev, seo}`
  );
  if (!products) {
    problems.push("s06: no published productsPage");
  } else {
    const nowTitle = products.seo?.socialMeta?.title ?? "(empty)";
    changes.push({
      what: "s06  Products, share card title",
      from: nowTitle,
      to: PRODUCTS_SHARE_TITLE,
    });
  }

  /* ------------------------------------------- s10, the blog share image */

  const posts = await query(
    `*[_type == "post" && !(_id in path("drafts.**"))]{
      _id, _rev, title,
      "override": seo.socialMeta.ogImage.asset->{originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
      "twitter": seo.socialMeta.twitterImage.asset->originalFilename,
      "own": mainImage.asset->{originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height}
    }`
  );

  const postsToClear = [];
  for (const post of posts) {
    if (!post.override && !post.twitter) continue;
    if (!post.own) {
      problems.push(
        `s10: "${post.title}" has no photograph of its own, so clearing the override would leave a bare card`
      );
      continue;
    }
    postsToClear.push(post);
    changes.push({
      what: `s10  ${post.title}, share picture`,
      from: `${post.override?.originalFilename} at ${post.override?.w}x${post.override?.h}, upscaled to 1200x630`,
      to: `its own ${post.own.originalFilename} at ${post.own.w}x${post.own.h}`,
      note: "the override is cleared, so the post's own photograph is used",
    });
  }

  /* ----------------------------------------------------------- the rules */

  for (const change of changes) {
    problems.push(...ruleBreaks(change.what, change.to));
  }

  /* ----------------------------------------------------------- the print */

  console.log();
  for (const c of changes) {
    console.log(`  ${c.what}`);
    console.log(`    WAS: ${c.from}`);
    console.log(`    NOW: ${c.to}`);
    if (c.note) console.log(`    ${c.note}`);
    console.log();
  }

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

  // The array is written whole, per the CH-028 note: an indexed patch
  // alongside an array write in one transaction is applied first and then
  // overwritten, and the script reports success.
  const nextSections = cafe.additionalSections.map((s, i) =>
    i === sectionIndex
      ? { ...s, sectionParagraph: buildBlock(CAFE_BITE_SPANS) }
      : s
  );
  mutations.push({
    patch: {
      id: cafe._id,
      ifRevisionID: cafe._rev,
      set: { additionalSections: nextSections },
    },
  });

  mutations.push({
    patch: {
      id: products._id,
      ifRevisionID: products._rev,
      set: { "seo.socialMeta.title": PRODUCTS_SHARE_TITLE },
    },
  });

  for (const post of postsToClear) {
    mutations.push({
      patch: {
        id: post._id,
        ifRevisionID: post._rev,
        unset: [
          "seo.socialMeta.ogImage",
          "seo.socialMeta.twitterImage",
        ],
      },
    });
  }

  const result = await mutate(mutations);
  console.log(`  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
