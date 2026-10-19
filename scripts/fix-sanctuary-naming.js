/**
 * The outdoor space is the Recovery Sanctuary, on every page.
 *
 * Frank, 2026-10-19: "Should always be Recovery Sanctuary", and the
 * physiotherapy call to action should be about physiotherapy.
 *
 * Two treatment pages had invented their own names for the one outdoor space,
 * "Outdoor Yoga Sanctuary" and "Outdoor Pilates Sanctuary". That breaks the
 * naming rule in CLAUDE.md and, worse, reads as three different places when
 * there is one.
 *
 * Separately, the physiotherapy page's call to action was the naturopathy one
 * pasted whole: it named "Naturopathic Care services" and talked about
 * natural therapies, on a page about physiotherapy. The naturopathy page's
 * own copy says the same thing correctly and is left alone.
 */
const { createClient } = require("next-sanity");

const APPLY = process.argv.includes("--apply");

const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

/*
 * Every change states the text it expects to replace, so a run against copy
 * somebody has edited since refuses rather than overwriting it. The dash
 * sweep learned this the hard way: keying on position lets one paragraph be
 * written into another field.
 */
const CHANGES = [
  {
    slug: "outdoor-yoga-therapy",
    edits: [
      {
        path: "benefits.title",
        from: "Why Choose Curate Health's Outdoor Yoga Sanctuary?",
        to: "Why Choose Outdoor Yoga at Curate Health's Recovery Sanctuary?",
      },
      {
        path: "benefits.benefitsList[3].subtitle",
        from: "Outdoor Yoga Sanctuary is part of Curate Health's comprehensive approach to well-being, integrating physical, mental, and emotional health.",
        to: "Outdoor yoga at the Recovery Sanctuary is part of Curate Health's comprehensive approach to well-being, integrating physical, mental, and emotional health.",
      },
      {
        path: "intro.subtitle",
        from: "Find Your Zen in Nature: Outdoor Yoga Sanctuary",
        to: "Find Your Zen in Nature: Outdoor Yoga at the Recovery Sanctuary",
      },
      {
        path: "intro.introParagraph",
        from: "Escape the hustle and bustle of daily life and find your sanctuary amidst the natural beauty of Curate Health's Outdoor Yoga Sanctuary. Surrounded by lush greenery and fresh air, our outdoor yoga sessions offer a rejuvenating escape from the stresses of modern living. Whether you're seeking to deepen your practice or simply unwind, our sanctuary provides the perfect space to harmonize mind, body, and spirit.",
        to: "Escape the hustle and bustle of daily life and practise amidst the natural beauty of Curate Health's Recovery Sanctuary. Surrounded by lush greenery and fresh air, our outdoor yoga sessions offer a rejuvenating escape from the stresses of modern living. Whether you're seeking to deepen your practice or simply unwind, the Recovery Sanctuary provides the perfect space to harmonize mind, body, and spirit.",
      },
      {
        path: "cta.ctaText",
        from: "Ready to rejuvenate your mind, body, and spirit in the embrace of nature? Join us at Curate Health's Outdoor Yoga Sanctuary and embark on a journey of self-discovery, renewal, and connection. Find your zen amidst the beauty of the outdoors and experience the transformative power of yoga.",
        to: "Ready to rejuvenate your mind, body, and spirit in the embrace of nature? Join us for outdoor yoga at Curate Health's Recovery Sanctuary and embark on a journey of self-discovery, renewal, and connection. Find your zen amidst the beauty of the outdoors and experience the transformative power of yoga.",
      },
    ],
  },
  {
    slug: "outdoor-pilates",
    edits: [
      {
        path: "benefits.title",
        from: "Why Choose Curate Health’s Outdoor Pilates Sanctuary?",
        to: "Why Choose Outdoor Pilates at Curate Health’s Recovery Sanctuary?",
      },
      {
        path: "intro.introParagraph",
        from: "Leave the day behind and step into our Outdoor Pilates Sanctuary, a space created to refine your movement, build a strong foundation, and reconnect you with your body. Join us and shift into a space where nature sets the tone. Bask in the fresh air and sunlight, and allow the natural surroundings to offer a deeply intentional, focused practice designed to leave you feeling stronger and calmer.",
        to: "Leave the day behind and step into our Recovery Sanctuary, a space created to refine your movement, build a strong foundation, and reconnect you with your body. Join us and shift into a space where nature sets the tone. Bask in the fresh air and sunlight, and allow the natural surroundings to offer a deeply intentional, focused practice designed to leave you feeling stronger and calmer.",
      },
    ],
  },
  {
    slug: "physiotherapy",
    edits: [
      {
        /*
         * The whole paragraph was naturopathy's, not only the service name,
         * so swapping the name alone would have left "the healing potential
         * of your own body and nature" and "natural therapies" sitting on a
         * physiotherapy page. Rewritten to describe physiotherapy.
         */
        path: "cta.ctaText",
        from: "Ready to unlock the healing potential of your own body and nature? With Curate Health’s Naturopathic Care services, discover how natural therapies can lead to profound changes in your health and well-being. Let us guide you towards a life of vitality, balance, and harmony.",
        to: "Ready to move without pain holding you back? With Curate Health’s Physiotherapy Services, find out how assessment, hands-on treatment and targeted exercise can restore how you move. Let us guide you towards strength, mobility and confidence in your body.",
      },
    ],
  },
];

const get = (doc, path) =>
  path.split(".").reduce((o, k) => {
    const m = k.match(/^(\w+)\[(\d+)\]$/);
    return m ? o?.[m[1]]?.[Number(m[2])] : o?.[k];
  }, doc);

(async () => {
  const docs = await client.fetch(
    `*[_type == "treatments" && treatmentSlug.current in $slugs]{_id, _rev, title, "slug": treatmentSlug.current, ...}`,
    { slugs: CHANGES.map((c) => c.slug) }
  );

  const patches = [];
  let mismatches = 0;

  for (const change of CHANGES) {
    const doc = docs.find((d) => d.slug === change.slug);
    if (!doc) throw new Error("no treatment with slug " + change.slug);
    console.log(`\n### ${doc.title}  (/${doc.slug})`);

    const set = {};
    for (const edit of change.edits) {
      const live = get(doc, edit.path);
      if (live !== edit.from) {
        mismatches++;
        console.log(`  MISMATCH at ${edit.path}, refusing.`);
        console.log(`    expected: ${JSON.stringify(edit.from).slice(0, 110)}`);
        console.log(`    found:    ${JSON.stringify(live).slice(0, 110)}`);
        continue;
      }
      set[edit.path] = edit.to;
      console.log(`\n  ${edit.path}`);
      console.log(`    - ${edit.from}`);
      console.log(`    + ${edit.to}`);
    }
    if (Object.keys(set).length) {
      patches.push({ id: doc._id, rev: doc._rev, set });
    }
  }

  if (mismatches) {
    console.log(`\n${mismatches} value(s) no longer match. Nothing written.`);
    process.exit(1);
  }
  if (!APPLY) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN is not set");
  }

  let tx = client.transaction();
  for (const p of patches) {
    tx = tx.patch(client.patch(p.id, { ifRevisionID: p.rev }).set(p.set));
  }
  const res = await tx.commit();
  console.log(
    `\nApplied. Transaction ${res.transactionId}, ${res.results.length} documents.`
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
