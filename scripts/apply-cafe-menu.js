/**
 * CH-108: the cafe menu as text in Sanity, so it can be a page.
 *
 *   node scripts/apply-cafe-menu.js           # dry run, prints the whole menu
 *   node scripts/apply-cafe-menu.js --apply
 *
 * WHERE THIS CONTENT COMES FROM, AND WHAT IS A JUDGEMENT CALL
 *
 * Two sources, both Frank's:
 *
 *   the menu PDF   "Menu June 2026.pdf", the file /cafe has been linking to.
 *                  Every item, size and price below is read off it.
 *   the recipe doc the "New recipes" Google Doc, which is NEWER than the menu
 *                  and is the master for what the kitchen actually makes.
 *
 * The PDF sets items out in four columns with the ingredient lists in a
 * separate text layer, so pairing a list to its drink is a reading of the
 * layout rather than something the file states. The pairings that are not
 * self-evident are marked CHECK below. They are Frank's to confirm, and a
 * wrong one on a menu means a wrong allergen.
 *
 * THE MAPLE ALMOND BAR DOES NOT USE THE PRINTED LINE
 *
 * The bar is "Almond & Walnut" on the PDF and its printed ingredients read
 * "almonds, dates, maple syrup, cinnamon, cacao powder, vanilla extract,
 * salt". That line is wrong three ways: it omits walnut, which is a tree nut
 * and is in the title, it omits the goji berries and lemon zest, and it lists
 * cacao powder, which belongs to the Chocolate Hazelnut bar. The recipe doc is
 * newer and has the real ingredients, so those are what go in.
 *
 * Frank renamed it **Maple Almond** on 2026-10-16, because the recipe's own
 * name, "Almond Goji Citrus Brain Bar", is too long for a menu and the maple is
 * the flavour people notice. He also confirmed **no honey** in it, which the
 * recipe agrees with. Honey stays in the drinks that do have it.
 */

const { query, mutate } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const DOC_ID = "cafeMenu";

/** A single newline, which the intro and note fields use to separate lines. */
const LINE_BREAK = String.fromCharCode(10);

/** The page's one h1. */
const TITLE = "Cafe Menu";

/**
 * The hero's standing line is the first paragraph and the band below the menu
 * is the rest, the same split /services, /about and /products use.
 *
 * THE FIRST TWO PARAGRAPHS ARE FRANK'S, 2026-10-18, AND ARE ONE PARAGRAPH OF HIS
 *
 * He sent them as a single paragraph. They are split at his own sentence break
 * so the first becomes the hero's standing line and the second the band, which
 * is the only change: at 250 characters the whole thing ran to four lines over
 * the photograph. Not a word is altered.
 *
 * The third is mine and is the allergen line. It was trimmed when his went in,
 * because his second sentence already says the almond milk is in most of the
 * drinks and saying it twice in three paragraphs reads as padding.
 *
 * The draft his replaced opened on "cooked without industrial seed oils and
 * sweetened with maple syrup, honey or dates rather than refined sugar". That
 * claim is gone because he took it out, not by oversight. Do not put it back
 * without asking him.
 */
const INTRO = [
  "Everything here begins with sourcing organic, local, farm to table, and seasonal ingredients whenever possible.",
  "We make as much as we can in-house, from our ferments to our energy bars, and even our almond milk that goes into most of the drinks.",
  "Every item below lists what is in it. Several contain tree nuts, so ask at the counter if you need to check something.",
].join("\n\n");

/**
 * Frank's wording, 2026-10-18. "Vessel", not "mug", and food as well as drink.
 *
 * Two lines, as he wrote them, because they are two separate offers rather
 * than one sentence. The page renders each on its own line.
 */
const NOTE = [
  "Bring your own vessel for $1.00 off all food and beverages.",
  "House-made almond milk, 1oz, can be added to any drink.",
].join(LINE_BREAK);

const SEO = {
  pageTitle: "Cafe Menu: Matcha, Smoothies and Salads",
  pageDescription:
    "The full menu at Curate Cafe in Midtown Toronto: matcha, pour-over coffee, kombucha on tap, smoothies, salads and house-made energy bars, with ingredients.",
};

/**
 * The menu.
 *
 * `check` on an item is a note for the pull request, not content: it marks a
 * reading of the PDF layout that Frank should confirm. It is stripped before
 * anything is written.
 */
const SECTIONS = [
  {
    title: "Hot",
    // Hot and Iced are two columns on the PDF and the split is by size,
    // everything 12oz and under here. Frank settled the one ambiguous case on
    // 2026-10-18: Matcha Latte at 16oz is iced.
    items: [
      { name: "Genuine Tea", size: "12oz", price: 8 },
      { name: "Mushroom Tea", size: "12oz", price: 7 },
      { name: "Pour-over coffee", size: "10oz", price: 9 },
      { name: "Ceremonial Matcha", size: "6oz", price: 10 },
    ],
  },
  {
    title: "Iced",
    items: [
      { name: "Cold Brew", size: "8oz", price: 10 },
      { name: "Matcha Latte", size: "16oz", price: 12 },
      { name: "Iced Matcha Tea", size: "16oz", price: 10 },
      { name: "Matcha Lemonade", size: "16oz", price: 11 },
    ],
  },
  {
    title: "Specialty Lattes",
    items: [
      {
        name: "Iced Golden Immunity Latte",
        size: "16oz",
        price: 11,
        ingredients:
          "turmeric, ginger, cinnamon, black pepper, Four Sigmatic immunity mushroom blend, house-made almond milk, honey",
      },
      {
        name: "Iced Butterfly Pea Flower Latte",
        size: "16oz",
        price: 10,
        ingredients: "butterfly pea flower, house-made almond milk, honey",
      },
    ],
  },
  {
    /*
     * Both protein drinks together, by Frank on 2026-10-18, under the
     * PDF's own name for this section. That retires its Protein Shakes
     * heading, which he had already cut to a single item.
     */
    title: "Specialty Protein",
    items: [
      {
        /*
         * One item, confirmed by Frank 2026-10-18. The PDF has "Matchacano
         * with Protein" and "Cold Foam (16oz)" as two runs in one column.
         *
         * RENAMED OFF "MATCHACANO"
         *
         * He said the matchacano and the ceremonial matcha "are the same, we
         * should just pick one". Ceremonial Matcha is the name kept, because
         * it is the term people search and it is already the first thing in
         * this item's own ingredient line, while "matchacano" is a coined
         * word with no search behind it that reads as a typo of americano.
         *
         * Renamed rather than deleted, so neither preparation came off the
         * menu: the plain 6oz is still under Hot and this is the 16oz with
         * protein. If he wants only one of the two, drop the other then.
         */
        name: "Ceremonial Matcha with Protein Cold Foam",
        size: "16oz",
        price: 14,
        ingredients:
          "ceremonial grade matcha, house-made almond milk, protein and superfood powder",
      },
      {
        /*
         * Moved here from Protein Shakes, which Frank cut to this one item on
         * 2026-10-18 and then folded into Smoothies, so that section is gone.
         *
         * WHAT CAME OFF THE MENU WITH IT
         *
         * "Organic All-In-One Plant-based Protein Shake" (20oz, $12) and
         * "Signature Protein Milkshake with House-made Almond Milk" (20oz,
         * $12), both printed on the PDF. Removed on his instruction, not by
         * accident. Put them back if that was not what he meant.
         *
         * The three flavours are his, moved off the add-on.
         */
        name: "Banana Booster Protein Smoothie",
        size: "20oz",
        price: 13,
        ingredients:
          "organic sprouted plant-based protein and superfood powder, banana, house-made almond milk, in vanilla, chocolate or chocolate peanut butter",
      },
    ],
  },
  {
    title: "Kombucha on Tap",
    items: [
      { name: "Blue Pomegranate", size: "16oz", price: 9 },
      { name: "Sour Apple", size: "16oz", price: 9 },
      // Replaced Cranberry on 2026-10-18, Frank.
      { name: "Violet Lemongrass", size: "16oz", price: 9 },
    ],
  },
  {
    title: "Smoothies",
    /*
     * The add-on is a footnote rather than an item, so it stops reading like
     * something you order on its own. Frank, 2026-10-18: "add on should be in
     * italics and not look like an actual item", limited to vanilla, and then
     * "should be at the bottom of smoothie section".
     *
     * A `note` sits above the items beside the prices, which is right for the
     * bars' bundle price and wrong for this. `footnote` sits below them.
     *
     * The other two flavours were never the add-on's. They belong to the
     * Banana Booster, which is where he put them.
     */
    footnote: "Add plant protein and superfoods powder, vanilla, for $3.",
    items: [
      {
        name: "Gut Health Smoothie",
        size: "20oz",
        price: 15,
        ingredients:
          "mixed berry, banana, raw honey, ginger, turmeric, cinnamon, flaxseeds, black pepper, house-made almond milk",
      },
      {
        name: "Green Mojito Smoothie",
        size: "20oz",
        price: 15,
        ingredients:
          "granny smith apple, spinach, avocado, cucumber, mint, chia seeds, honey, lime juice, lime peel, house-made almond milk",
      },
      {
        name: "Beet Smoothie",
        size: "20oz",
        price: 15,
        ingredients:
          "strawberry, beet, banana, arugula, apple, ginger, dates, lemon juice, pumpkin seeds, cacao, house-made almond milk",
      },
    ],
  },
  {
    title: "Energy Bars",
    // Frank, 2026-10-18.
    note: "$13 for 3",
    items: [
      {
        name: "Maple Almond",
        size: "35g",
        price: 4.5,
        /*
         * From the recipe doc, not the PDF. See the header.
         *
         * The recipe calls the topping a brittle and Frank corrected that on
         * 2026-10-18: "it's not a brittle, it's just a maple walnut topping".
         * Worth keeping either way, since walnut is the tree nut the printed
         * line left out.
         */
        ingredients:
          "almond pulp, almond butter, dates, maple syrup, goji berries, lemon zest, cinnamon, vanilla extract, coconut oil, sea salt, with a maple walnut topping",
      },
      {
        name: "Chocolate Hazelnut",
        size: "35g",
        price: 4.5,
        ingredients:
          "hazelnut flour, hazelnut butter, cacao powder, hemp seeds, coconut oil, vanilla extract, maple syrup",
      },
      {
        name: "Matcha Pistachio",
        size: "35g",
        price: 4.5,
        ingredients:
          "pistachio, matcha, cashews, dates, coconut oil, pumpkin seeds, pumpkin seed butter, sea salt, maple syrup, vanilla extract",
      },
    ],
  },
  {
    /*
     * Added 2026-10-18 at Frank's request, from the recipe doc rather than the
     * PDF: neither muffin nor the cheesecake is on the printed menu.
     *
     * Prices are Frank's, 2026-10-18: $6 a muffin and $15 for the
     * cheesecake. Neither the recipe doc nor the PDF carries a price for
     * these, so they could not be read off anything.
     *
     * Ingredients are the recipe reduced to a menu line, with every allergen
     * kept: walnut, egg, hemp and oats here, cashew in the cheesecake.
     */
    title: "Muffins",
    items: [
      {
        name: "Banana Zucchini Protein Muffin",
        size: "65g",
        price: 6,
        ingredients:
          "sprouted oat flour, banana, zucchini, silken tofu, egg, walnuts, hemp hearts, coconut oil, maple syrup, cinnamon, nutmeg, with an oat and walnut crumble",
      },
      {
        name: "Double Dark Chocolate Protein Muffin",
        size: "65g",
        price: 6,
        ingredients:
          "sprouted oat flour, cacao powder, cacao paste, banana, zucchini, silken tofu, egg, hemp hearts, coconut oil, maple syrup, vanilla extract",
      },
    ],
  },
  {
    /*
     * Chia Pudding and the cheesecake share a section, by Frank on 2026-10-18,
     * "to reduce sections". Both are chilled, spooned out of a glass and
     * sweetened with maple, so they belong together.
     *
     * **Not "Desserts".** That was the first name and Frank rejected it on
     * 2026-10-18: "this gives the impression unhealthy. These are protein
     * packed, so should be able to eat for breakfast, lunch or dinner". He is
     * right, and it is the same mistake as putting the protein muffins under
     * a sweets heading: the word tells a reader what meal the food is for,
     * and these are not an after-dinner course.
     *
     * "Jars" was the second try and he turned that down too. **"Fuel Foods"**
     * is his, and it is the better answer than either: it says what the food
     * is for rather than what it is served in, which is the whole point he was
     * making, and it is a phrase somebody might actually search.
     */
    title: "Fuel Foods",
    items: [
      {
        // No weight, by Frank on 2026-10-18, so it reads as one line. The
        // ingredient line stays: the granola carries cashew, walnut, pumpkin
        // seed and sesame, and that is allergen information.
        name: "Chia Pudding",
        price: 10,
        ingredients: "topped with hojicha granola and probiotic berry compote",
      },
      {
        name: "No-Bake Cheesecake",
        size: "65g",
        price: 15,
        ingredients:
          "a hojicha nut granola and Medjool date crust, with silken tofu, cashew, coconut cream, coconut oil, lemon juice and zest, maple syrup, vanilla extract",
      },
    ],
  },
  {
    title: "Salads",
    items: [
      {
        name: "Annual Salad",
        size: "350g",
        price: 21,
        ingredients:
          "house blend of sprouts, red cabbage, carrots, marinated edamame, cucumber, miso-cilantro dressing, roasted nut mix",
      },
      {
        name: "Seasonal Salad",
        size: "350g",
        price: 21,
        ingredients:
          "Zawadi Farms salad mix, asparagus, green beans, lacto-fermented zucchini, soft boiled egg, sea asparagus, watermelon radish, citrus emulsion dressing",
      },
    ],
  },
];

/* ------------------------------------------------------------------ checks */

/**
 * The content rules, before anything is written rather than after.
 *
 * Em and en dashes are the hard ban, reaffirmed 2026-10-11, and they are what a
 * paste out of a document brings with it. The cafe accent and the banned list
 * are checked for the same reason: this file is copy, and copy on this project
 * goes through the rules.
 */
const DASHES = /[–—]/;

/**
 * Zero-width and bidi characters, CH-020.
 *
 * Checked here and not only by `audit-unicode.js` because the audit runs after
 * the write, and this is the exact path the original contamination took: copy
 * pasted out of a rich text source into a field. Frank's menu copy on
 * 2026-10-18 arrived carrying them, so this is not hypothetical.
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
  if (/café/i.test(text)) out.push(`${label}: accented cafe`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  // Canadian spelling, the few that a menu realistically carries.
  for (const [us, ca] of [
    ["flavor", "flavour"],
    ["savory", "savoury"],
    ["yogurt ", "yoghurt or yogurt, pick one"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  return out;
}

/**
 * Whole numbers print without decimals, by Frank on 2026-10-18: almost
 * everything is a round dollar "and that is why". Only the $4.50 bars show
 * cents. Mirrors menuPrice in lib/structured-data.tsx, which is what the
 * page and the markup use.
 */
function money(price) {
  if (typeof price !== "number") return "";
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

/* ------------------------------------------------------------------- shape */

let keySeed = 0;
/**
 * Keys are derived from the item, not random, so re-running the dry run prints
 * the same document and a second apply is a no-op rather than a churn of new
 * keys. Sanity only needs them unique within the array.
 */
const key = (text) =>
  `${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}-${(keySeed += 1)}`;

function buildDocument() {
  return {
    _id: DOC_ID,
    _type: "cafeMenu",
    title: TITLE,
    intro: INTRO,
    note: NOTE,
    seo: {
      _type: "seo",
      pageTitle: SEO.pageTitle,
      pageDescription: SEO.pageDescription,
      socialMeta: {
        _type: "socialMeta",
        // The house shape: the share title repeats the page title and the share
        // description repeats the page description. The share image is
        // deliberately unset, so the page falls through to the cafe's own hero
        // and the two cannot disagree. See the /about note in CLAUDE.md.
        title: SEO.pageTitle,
        description: SEO.pageDescription,
      },
    },
    sections: SECTIONS.map((section) => ({
      _key: key(section.title),
      _type: "menuSection",
      title: section.title,
      ...(section.note ? { note: section.note } : {}),
      ...(section.footnote ? { footnote: section.footnote } : {}),
      items: section.items.map((item) => ({
        _key: key(item.name),
        _type: "menuItem",
        name: item.name,
        ...(item.size ? { size: item.size } : {}),
        ...(typeof item.price === "number" ? { price: item.price } : {}),
        ...(item.ingredients ? { ingredients: item.ingredients } : {}),
      })),
    })),
  };
}

/* -------------------------------------------------------------------- main */

async function main() {
  const apply = process.argv.includes("--apply");
  const doc = buildDocument();

  const items = SECTIONS.reduce((n, s) => n + s.items.length, 0);
  console.log(
    `${SECTIONS.length} sections, ${items} items, document ${DOC_ID}\n`
  );

  console.log(`Title:       ${TITLE}`);
  console.log(
    `SEO title:   ${SEO.pageTitle} | Curate Health  (${SEO.pageTitle.length + 16} chars)`
  );
  console.log(
    `Description: ${SEO.pageDescription}  (${SEO.pageDescription.length} chars)\n`
  );

  for (const section of SECTIONS) {
    console.log(section.title);
    if (section.note) console.log(`  ${section.note}`);
    if (section.footnote) console.log(`  (footnote) ${section.footnote}`);
    for (const item of section.items) {
      const size = item.size ? ` (${item.size})` : "";
      console.log(`  ${item.name}${size}  ${money(item.price)}`);
      if (item.ingredients) console.log(`      ${item.ingredients}`);
    }
    console.log("");
  }

  const checks = [];
  for (const section of SECTIONS) {
    if (section.check) checks.push([section.title, section.check]);
    for (const item of section.items) {
      if (item.check) checks.push([item.name, item.check]);
    }
  }
  if (checks.length) {
    console.log("For Frank to confirm, readings of the PDF layout:");
    for (const [where, note] of checks) console.log(`  ${where}: ${note}`);
    console.log("");
  }

  // --- the rules
  const breaks = [
    ...ruleBreaks("title", TITLE),
    ...ruleBreaks("intro", INTRO),
    ...ruleBreaks("note", NOTE),
    ...ruleBreaks("seo.pageTitle", SEO.pageTitle),
    ...ruleBreaks("seo.pageDescription", SEO.pageDescription),
  ];
  for (const section of SECTIONS) {
    breaks.push(...ruleBreaks(`section "${section.title}"`, section.title));
    breaks.push(...ruleBreaks(`note "${section.title}"`, section.note));
    breaks.push(...ruleBreaks(`footnote "${section.title}"`, section.footnote));
    for (const item of section.items) {
      breaks.push(...ruleBreaks(`item "${item.name}"`, item.name));
      breaks.push(
        ...ruleBreaks(`ingredients "${item.name}"`, item.ingredients)
      );
    }
  }

  // The audits' own limits, checked here so a failure is visible before the
  // write rather than after the build.
  if (SEO.pageTitle.length + 16 > 60) {
    breaks.push(
      `seo.pageTitle: ${SEO.pageTitle.length + 16} chars with the brand, over 60`
    );
  }
  if (SEO.pageDescription.length > 155) {
    breaks.push(
      `seo.pageDescription: ${SEO.pageDescription.length} chars, over 155`
    );
  }
  if (SEO.pageDescription.length < 70) {
    breaks.push(
      `seo.pageDescription: ${SEO.pageDescription.length} chars, under 70`
    );
  }
  // audit-metadata.js wants every significant word of the h1 in the title.
  for (const word of TITLE.toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)) {
    if (!SEO.pageTitle.toLowerCase().includes(word)) {
      breaks.push(`seo.pageTitle is missing "${word}" from the h1`);
    }
  }

  if (breaks.length) {
    console.error("Content rule breaks, nothing written:");
    for (const b of breaks) console.error(`  ${b}`);
    process.exit(1);
  }
  console.log("Content rules: clean.\n");

  const [existing] = await query(
    `*[_id == $id]{_id, _rev, title, "sections": count(sections)}`,
    { id: DOC_ID }
  );

  if (existing) {
    console.log(
      `${DOC_ID} already exists, rev ${existing._rev}, ${existing.sections} sections.`
    );
    console.log(
      "It will be replaced with the above, including the SEO fields."
    );
  } else {
    console.log(`${DOC_ID} does not exist yet, it will be created.`);
  }

  /*
   * The block on /cafe, which still sells the PDF.
   *
   * Its description ended "Save or share the menu in one tap", written when
   * downloading the file was the only thing that block did. Frank asked for
   * that sentence out on 2026-10-18 now that the page is the primary action.
   *
   * Matched on the sentence rather than replaced wholesale, so an editor
   * rewording the rest of the paragraph in the Studio does not have their
   * work silently reverted by the next run of this script. Already gone, it
   * does nothing.
   */
  const [cafePage] = await query(
    `*[_type == "cafePage" && pageActive == true][0...1]{
      _id, _rev, "description": menuDownloadSection.description
    }`
  );

  const STALE_SENTENCE = "Save or share the menu in one tap.";
  const cafeDescription = (cafePage?.description || "").trim();
  const trimmedDescription = cafeDescription.includes(STALE_SENTENCE)
    ? cafeDescription.replace(STALE_SENTENCE, "").replace(/\s+$/, "")
    : null;

  if (trimmedDescription !== null) {
    console.log("\n/cafe menu block description");
    console.log(`  before: ${cafeDescription}`);
    console.log(`  after:  ${trimmedDescription}`);
  } else if (cafePage) {
    console.log(
      `\n/cafe menu block description: already clear of "${STALE_SENTENCE}"`
    );
  }

  if (!apply) {
    console.log("\nDry run. Nothing written.");
    return;
  }

  /*
   * createOrReplace, with ifRevisionID when the document is already there.
   *
   * Replace rather than patch because this script owns the whole menu: a patch
   * of `sections` would leave an older section behind if one were removed here.
   * The revision guard is what makes that safe, so a Studio edit nobody has
   * read fails the mutation instead of being overwritten.
   */
  const mutations = existing
    ? [
        {
          patch: {
            id: DOC_ID,
            ifRevisionID: existing._rev,
            unset: ["sections"],
          },
        },
        { createOrReplace: doc },
      ]
    : [{ createOrReplace: doc }];

  if (trimmedDescription !== null) {
    mutations.push({
      patch: {
        id: cafePage._id,
        ifRevisionID: cafePage._rev,
        set: { "menuDownloadSection.description": trimmedDescription },
      },
    });
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId || "(none)"}`);
  console.log(
    "The page is /cafe/menu. Publishing this tells Bing, per CH-114."
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
