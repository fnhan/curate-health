/**
 * Share photos Frank marked to swap, where the answer is already known.
 *
 *   node scripts/fix-share-photos.js            dry run
 *   node scripts/fix-share-photos.js --apply    writes
 *
 * WHY A SHARE PHOTO NEEDS ITS OWN CROP
 *
 * A share card is 1200x630, roughly 1.91:1. Anything taller than it is wide
 * gets a strip cut out of the middle, and the middle is often the least useful
 * part of the photograph. Clinical Care's card is a plain white t-shirt for
 * exactly this reason: the photo underneath is a good hands-on treatment shot,
 * 3840x5760, and the automatic crop lands on fabric.
 *
 * Setting the crop in Sanity fixes it without changing the photo, and
 * urlForShareImage honours it, so the framing stays adjustable in the Studio
 * rather than living in code.
 *
 * WHAT IS HERE, AND WHAT IS NOT
 *
 * Frank marked five photos to swap on 2026-09-10. Two have a clear answer and
 * are below. The other three do not: the asset library holds nothing that is
 * obviously better for the services hub, Our Story or Pillars of Health, and
 * picking a replacement is a content decision rather than a mechanical one.
 * They stay on the list until he says what they should show.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

const CHANGES = [
  {
    type: "product",
    slug: "tens-machines",
    what: "swap",
    // Was a catalogue photograph of the unit itself, 1000x1081, both too small
    // for a card and taller than one. This shows the pads going on somebody's
    // shoulder, which is what the machine is for, and it is 3537x2256.
    asset: "image-3a1bc8e6ec2b10f8b7b13c824416b87bf5db80b7-3537x2256-png",
    alt: "Electrode pads being placed on a person's upper back and shoulder.",
  },
  {
    type: "product",
    slug: "profession-grade-supplements",
    what: "crop",
    // Keeps the photograph. It is 5142x7709, and the centre crop lands on
    // empty background below the hand. The subject, a hand holding a capsule,
    // sits in the top third, so the crop takes the top 26% and the card shows
    // the capsule instead of white space.
    //
    // 0.74 from the bottom leaves 0.26 of 7709, which is 2004 pixels against a
    // 5142 width. That is 2.57:1, wider than a card needs, so nothing is lost
    // at the sides.
    crop: {
      _type: "sanity.imageCrop",
      top: 0,
      bottom: 0.74,
      left: 0,
      right: 0,
    },
    hotspot: {
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.13,
      width: 1,
      height: 0.26,
    },
  },
];

function check(alt) {
  const problems = [];
  if (alt.length < 25) problems.push(`alt is ${alt.length} chars, under 25`);
  if (alt.length > 125) problems.push(`alt is ${alt.length} chars, over 125`);
  if (alt !== alt.trim()) problems.push("alt has stray whitespace");
  if (/[—–]/.test(alt)) problems.push("alt uses a dash as punctuation");

  return problems;
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Share photos");
  console.log(RULE);

  const mutations = [];
  let problems = 0;

  for (const item of CHANGES) {
    const doc = await query(
      `*[_type == $type && coalesce(slug.current, treatmentSlug.current) == $slug && !(_id in path("drafts.**"))][0]{
        _id, title, name,
        "asset": seo.socialMeta.ogImage.asset->{_id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
        "alt": seo.socialMeta.ogImage.alt,
        "crop": seo.socialMeta.ogImage.crop
      }`,
      { type: item.type, slug: item.slug }
    );

    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type} ${item.slug}`);
      process.exit(2);
    }

    console.log(`\n  ${doc.title || doc.name}`);
    console.log(
      `    now: ${doc.asset ? `${doc.asset.originalFilename} ${doc.asset.w}x${doc.asset.h}` : "no image"}`
    );

    if (item.what === "swap") {
      const faults = check(item.alt);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));

      console.log(`    new: ${item.asset}`);
      console.log(`    alt: ${JSON.stringify(item.alt)}`);

      const image = {
        _type: "image",
        asset: { _type: "reference", _ref: item.asset },
        alt: item.alt,
      };

      mutations.push({
        patch: {
          id: doc._id,
          set: {
            "seo.socialMeta.ogImage": image,
            "seo.socialMeta.twitterImage": image,
          },
        },
      });
      continue;
    }

    // A crop, so the photograph and its alt text stay exactly as they are.
    console.log(
      `    crop: keeping the top ${Math.round((1 - item.crop.bottom) * 100)}%, where the subject is`
    );

    if (JSON.stringify(doc.crop || null) === JSON.stringify(item.crop)) {
      console.log("    already set");
      continue;
    }

    mutations.push({
      patch: {
        id: doc._id,
        set: {
          "seo.socialMeta.ogImage.crop": item.crop,
          "seo.socialMeta.ogImage.hotspot": item.hotspot,
          "seo.socialMeta.twitterImage.crop": item.crop,
          "seo.socialMeta.twitterImage.hotspot": item.hotspot,
        },
      },
    });
  }

  console.log(`\n${RULE}`);
  console.log("STILL OPEN, WAITING ON FRANK");
  console.log(`
  Our Services      An olive branch. Nothing in the library says "everything
                    we offer"; the FrontPage_Clinic_* files are stock
                    landscapes rather than photographs of the space.
  Our Story         Currently Frank treating a patient. The alternatives in
                    the library are variations of the same shot.
  Pillars of Health Water ripples. Correctly shaped and abstract, which suits
                    an abstract subject, so there is nothing to fix mechanically.
`);

  if (problems) {
    console.error(`${problems} problem(s). Nothing written.`);
    process.exit(2);
  }

  if (!mutations.length) {
    console.log("Nothing to apply.");
    return;
  }

  if (!apply) {
    console.log(
      `Dry run. ${mutations.length} patch(es) prepared, nothing written.`
    );
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
