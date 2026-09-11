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
 * Frank marked five photos to swap on 2026-09-10 and then said what each should
 * show. Three are here: TENS Machines and Our Story take a different
 * photograph, and the supplements photo keeps its own and gains a crop.
 *
 * Two more crops were added the same day, both his framing rather than mine:
 * the orthotic centred vertically, and the compression stockings moved up so
 * both feet are in shot.
 *
 * The services hub and Pillars of Health are not here. Neither wanted a
 * photograph that exists, so both are drawn and uploaded by
 * scripts/build-share-images.js.
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
    slug: "professional-grade-supplements",
    what: "crop",
    // Keeps the photograph, 5142x7709, and moves the window onto the hand.
    //
    // The first attempt took the top 26% and produced a completely white card.
    // The reasoning was wrong twice over: a test render used crop=top, which
    // crops the scaled image rather than the original, and the hand is not near
    // the top at all. It sits between about 42% and 76% down, under a large
    // area of empty background.
    //
    // 2700 of 7709 is the 1.91:1 a card wants against a 5142 width, placed to
    // centre on the hand and the capsule. Rendered and looked at this time.
    crop: {
      _type: "sanity.imageCrop",
      top: 0.4128,
      bottom: 0.237,
      left: 0,
      right: 0,
    },
    hotspot: {
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.5879,
      width: 1,
      height: 0.3502,
    },
  },
  {
    type: "service",
    slug: "recovery-sanctuary",
    what: "swap",
    // Frank asked for the sauna and the cold plunge, 2026-09-10. It was
    // sharing a stock photograph of a woman in a sauna interior that is not
    // this sauna.
    //
    // This is the photograph the category card already uses, and it holds both
    // the cedar cabin and the plunge tub, in the real space. The crop below
    // trims height only, so nothing is lost from either side.
    asset: "image-ee230e7ba114b5beea8abf2bafb82abef4342f2e-2601x1611-jpg",
    alt: "The cedar sauna cabin and the outdoor cold plunge in the Recovery Sanctuary.",
    crop: {
      _type: "sanity.imageCrop",
      top: 0.0745,
      bottom: 0.0776,
      left: 0,
      right: 0,
    },
    hotspot: {
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.4985,
      width: 1,
      height: 0.8479,
    },
  },
  {
    type: "ourStory",
    what: "swap",
    // Frank asked for the barbell photograph, 2026-09-10. It is already on
    // this page, in the first section, and at 4096x2731 it needs no crop.
    //
    // It replaces the photograph of him treating a patient, which was chosen
    // for this page in #216 and is a better fit for Clinical Care than for a
    // founder's story that begins with his own heart surgery at 17.
    asset: "image-d92d69ad043cf8e17015386312d73dd263c1ff7f-4096x2731-jpg",
    alt: "A man lifting a barbell overhead in a bright gym.",
  },
  {
    type: "product",
    slug: "custom-foot-orthotics",
    what: "crop",
    // Frank asked for it centred vertically, 2026-09-10. The image is 418x400
    // and the insole sits just below the middle, so a plain centre crop left
    // white space above it and clipped the toe.
    //
    // The window is 220 of 400 tall, which is the 1.91:1 a card wants against
    // a 418 width, placed to centre on the insole at 0.465.
    crop: {
      _type: "sanity.imageCrop",
      top: 0.19,
      bottom: 0.26,
      left: 0,
      right: 0,
    },
    hotspot: {
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.465,
      width: 1,
      height: 0.55,
    },
  },
  {
    type: "product",
    slug: "compression-stockings",
    what: "crop",
    // Frank asked to move it up so both feet show, 2026-09-10. The centre crop
    // of this 500x500 was landing on knees and mid-calf and cutting both feet
    // off, which is an odd thing to show for a product worn on the foot.
    //
    // Taking the window from 0.44 down to 0.964 keeps both feet with a little
    // clearance under the front toe.
    crop: {
      _type: "sanity.imageCrop",
      top: 0.44,
      bottom: 0.036,
      left: 0,
      right: 0,
    },
    hotspot: {
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.702,
      width: 1,
      height: 0.524,
    },
  },
];

/**
 * Whether a stored crop already matches the wanted one.
 *
 * Compared by the four edges, not by JSON.stringify. Sanity hands a stored
 * crop back with its own key order, so a string comparison said every crop
 * differed and a dry run after applying reported six changes that were
 * already in place. A dry run that cannot tell done from not done teaches
 * people to stop reading it.
 */
function sameCrop(stored, wanted) {
  if (!stored && !wanted) return true;
  if (!stored || !wanted) return false;

  return ["top", "bottom", "left", "right"].every(
    (edge) => Math.abs((stored[edge] ?? 0) - (wanted[edge] ?? 0)) < 1e-6
  );
}

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
    // ourStory is a singleton with no slug, so the filter has to drop the slug
    // comparison rather than compare against an empty string and match nothing.
    const filter = item.slug
      ? `_type == $type && coalesce(slug.current, treatmentSlug.current) == $slug`
      : `_type == $type`;

    const doc = await query(
      `*[${filter} && !(_id in path("drafts.**"))][0]{
        _id, title, name,
        "asset": seo.socialMeta.ogImage.asset->{_id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
        "alt": seo.socialMeta.ogImage.alt,
        "crop": seo.socialMeta.ogImage.crop
      }`,
      { type: item.type, slug: item.slug ?? "" }
    );

    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type} ${item.slug}`);
      process.exit(2);
    }

    // Singletons carry neither title nor name, so fall back to the type.
    console.log(`\n  ${doc.title || doc.name || item.type}`);
    console.log(
      `    now: ${doc.asset ? `${doc.asset.originalFilename} ${doc.asset.w}x${doc.asset.h}` : "no image"}`
    );

    if (item.what === "swap") {
      const faults = check(item.alt);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));

      console.log(`    new: ${item.asset}`);
      console.log(`    alt: ${JSON.stringify(item.alt)}`);

      // A swap may also carry framing. Recovery Sanctuary is one: a different
      // photograph AND a crop, because the new one is 1.61:1 and a card is
      // 1.91:1, so something has to give and it should be height rather than
      // either end of the space.
      if (item.crop) {
        const from = Math.round(item.crop.top * 100);
        const to = Math.round((1 - item.crop.bottom) * 100);
        console.log(`    crop: showing ${from}% to ${to}% down the photograph`);
      }

      const image = {
        _type: "image",
        asset: { _type: "reference", _ref: item.asset },
        alt: item.alt,
        ...(item.crop ? { crop: item.crop } : {}),
        ...(item.hotspot ? { hotspot: item.hotspot } : {}),
      };

      if (
        doc.asset?._id === item.asset &&
        doc.alt === item.alt &&
        sameCrop(doc.crop, item.crop)
      ) {
        console.log("    already set");
        continue;
      }

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
    // Say which slice of the photograph the card ends up showing. "the top
    // 74%" was the first wording here and it was wrong for any crop that also
    // trims from the top, which two of these do.
    const from = Math.round(item.crop.top * 100);
    const to = Math.round((1 - item.crop.bottom) * 100);
    console.log(`    crop: showing ${from}% to ${to}% down the photograph`);

    if (sameCrop(doc.crop, item.crop)) {
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
  console.log("HANDLED ELSEWHERE");
  console.log(`
  Our Services      A three-strip collage of the category photographs, and
  Pillars of Health the five-circle diagram from the page. Neither of those
                    exists as a file, so both are drawn and uploaded by
                    scripts/build-share-images.js rather than picked here.
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
