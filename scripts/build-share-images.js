/**
 * Builds the two share images that do not exist as files anywhere.
 *
 *   node scripts/build-share-images.js            writes PNGs to .share-images/
 *   node scripts/build-share-images.js --apply    uploads them and wires them up
 *
 * Needs sharp, which is not a project dependency:
 *
 *   npm install --no-save sharp
 *
 * It is deliberately not in package.json. Nothing the site serves needs it;
 * this is a one-off asset generator, and adding a native binary to every
 * install and every Vercel build to run a script twice a year is a bad trade.
 *
 * WHAT IT MAKES, AND WHY THESE TWO
 *
 * Frank asked for both on 2026-09-10, and neither could be picked out of the
 * asset library because neither exists there.
 *
 *   The services hub    A three-strip collage of the three live categories,
 *                       using the photograph each category card already shows.
 *                       The page was sharing a photograph of an olive branch.
 *
 *   Pillars of Health   The five-circle diagram from the page. That diagram is
 *                       a React component, not an image: circles positioned by
 *                       trigonometry, hover to change the text in the middle.
 *                       There is no file to reuse, so it is redrawn here from
 *                       the same five pillar names and the same geometry.
 *
 * THE DIAGRAM IS REDRAWN, NOT SCREENSHOTTED
 *
 * A screenshot would carry whichever pillar happened to be hovered, the
 * viewport's scrollbar, and whatever the animation was mid-way through. The
 * component places pillar i at (i * 360 / 5) - 90 degrees, so the first sits
 * at the top and the rest run clockwise, which is what buildPillars does
 * below. Colours come from the same tokens app/globals.css uses.
 *
 * If the component's geometry or the pillar names change, this drifts. It is
 * generated from the live pillar names for that reason, so at least the words
 * cannot go stale on their own.
 */

const fs = require("fs");
const path = require("path");

const { mutate, query, uploadImage } = require("./lib/sanity-cli");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error(
    "sharp is not installed. It is not a project dependency on purpose.\n" +
      "  npm install --no-save sharp"
  );
  process.exit(2);
}

const RULE = "=".repeat(78);
const OUT_DIR = path.join(__dirname, "..", ".share-images");

/** The size every social platform asks for. */
const W = 1200;
const H = 630;

/** app/globals.css, --primary and --secondary as hsl. */
const PRIMARY = "#263418";
const SECONDARY = "#868c76";

const CDN = "https://cdn.sanity.io/images/rwc5kyvy/production";

/** Turns an asset id back into the CDN path it was minted from. */
function assetUrl(id, params) {
  const bare = id.replace(/^image-/, "");
  const dot = bare.lastIndexOf("-");
  const file = `${bare.slice(0, dot)}.${bare.slice(dot + 1)}`;

  return `${CDN}/${file}?${params}`;
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Where each strip is taken from, left edge in the source's own pixels.
 *
 * Framed by hand, by Frank on 2026-09-10, because an automatic crop has no
 * idea what any of these photographs are of. `crop=entropy` picks the busiest
 * region, which put the sauna strip on the cold plunge tub and cut the
 * clinical strip to the right of the hands.
 *
 * Each window is the full height of its source and as wide as one strip needs,
 * so only the horizontal position is a choice.
 */
const COLLAGE_FRAMING = {
  // Shifted left, to show the fingers rather than the fabric beside them.
  "clinical-care": 150,
  // Shifted left, so less of the right side of his body is in frame.
  "movement-and-training": 760,
  // Shifted left, onto the sauna cabin. The tub is on the right of this photo
  // and is what the automatic crop was choosing.
  "recovery-sanctuary": 300,
};

/**
 * Three photographs side by side, each cropped to a third of the card.
 *
 * A hairline gap between them, in the brand green, so the strips read as three
 * things rather than one panorama that happens to be discontinuous.
 */
async function buildCollage(categories) {
  const gap = 4;
  const strip = Math.floor((W - gap * 2) / 3);

  const strips = await Promise.all(
    categories.map(async (c) => {
      // A full-height window, one strip wide, at the chosen left edge. Clamped
      // so a framing number that is too big for a narrower source still lands
      // inside the image rather than failing the request.
      const windowWidth = Math.round(c.height * (strip / H));
      const left = Math.max(
        0,
        Math.min(COLLAGE_FRAMING[c.slug] ?? 0, c.width - windowWidth)
      );

      const buffer = await fetchBuffer(
        assetUrl(
          c.assetId,
          `rect=${left},0,${windowWidth},${c.height}&w=${strip}&h=${H}&fit=crop&q=90`
        )
      );

      return sharp(buffer).resize(strip, H, { fit: "cover" }).toBuffer();
    })
  );

  const canvas = sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: PRIMARY,
    },
  });

  return canvas
    .composite(
      strips.map((input, i) => ({ input, left: i * (strip + gap), top: 0 }))
    )
    .png()
    .toBuffer();
}

/** The five-circle diagram, laid out the way the component lays it out. */
function buildPillars(names) {
  const cx = W / 2;
  const cy = H / 2;

  // Sized against the words in the middle, not by eye. The two bubbles at 18
  // degrees either side of centre are the narrowest point: their inner edges
  // sit at cx +/- (ring * cos(18) - bubble), and "Pillars of Health" at 34px
  // Georgia needs about 280px between them. A first pass used ring 195 and a
  // 40px title, and the title ran under the Social and Mental bubbles.
  const ring = 228;
  const bubble = 58;

  const circles = names
    .map((name, i) => {
      const angle = ((i * 360) / names.length - 90) * (Math.PI / 180);
      const x = cx + ring * Math.cos(angle);
      const y = cy + ring * Math.sin(angle);

      return `
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${bubble}" fill="#ffffff" />
    <text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-size="20"
          fill="${PRIMARY}">${name}</text>`;
    })
    .join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PRIMARY}" />
  <circle cx="${cx}" cy="${cy}" r="${ring}" fill="none" stroke="${SECONDARY}" stroke-width="1.5" />
  <text x="${cx}" y="${cy - 6}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#ffffff">Pillars of Health</text>
  <text x="${cx}" y="${cy + 30}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="17" font-style="italic" fill="${SECONDARY}">Curate Health, Midtown Toronto</text>
  ${circles}
</svg>`);
}

/** The image object a share field expects. */
function imageValue(assetId, alt) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt,
  };
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Generated share images");
  console.log(RULE);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // ------------------------------------------------------------- the collage
  const categories =
    await query(`*[_type == "service" && isActive == true && !(_id in path("drafts.**"))]{
    title, "slug": slug.current,
    "assetId": hero_image.asset->_id,
    "width": hero_image.asset->metadata.dimensions.width,
    "height": hero_image.asset->metadata.dimensions.height
  } | order(title asc)`);

  const usable = categories.filter((c) => c.assetId);

  console.log("\nSERVICES HUB, three strips from the category cards");
  usable.forEach((c) => console.log(`  ${c.title}`));

  if (usable.length !== 3) {
    console.error(
      `\n  Expected 3 live categories with a photo, found ${usable.length}.` +
        `\n  The layout is three strips, so this needs a look rather than a guess.`
    );
    process.exit(2);
  }

  const collage = await buildCollage(usable);
  const collagePath = path.join(OUT_DIR, "services-collage.png");
  fs.writeFileSync(collagePath, collage);
  console.log(
    `  wrote ${collagePath}  ${Math.round(collage.length / 1024)} KB`
  );

  // -------------------------------------------------------------- the pillars
  const pillars = await query(
    `*[_type == "pillarsOfHealth" && !(_id in path("drafts.**"))][0].pillars[].pillarName`
  );

  console.log("\nPILLARS OF HEALTH, the five-circle diagram redrawn");
  console.log(`  ${pillars.join(", ")}`);

  const diagram = await sharp(buildPillars(pillars)).png().toBuffer();
  const diagramPath = path.join(OUT_DIR, "pillars-diagram.png");
  fs.writeFileSync(diagramPath, diagram);
  console.log(
    `  wrote ${diagramPath}  ${Math.round(diagram.length / 1024)} KB`
  );

  console.log(`\n${RULE}`);

  if (!apply) {
    console.log(
      "Both written to .share-images/ for a look. Nothing uploaded, nothing\n" +
        "in Sanity changed. Re-run with --apply once the images look right."
    );
    return;
  }

  console.log("UPLOADING");

  const collageAsset = await uploadImage(
    collage,
    "services-three-strip-collage.png"
  );
  console.log(`  collage  ${collageAsset._id}`);

  const diagramAsset = await uploadImage(
    diagram,
    "pillars-of-health-diagram.png"
  );
  console.log(`  diagram  ${diagramAsset._id}`);

  const collageImage = imageValue(
    collageAsset._id,
    "Three photographs side by side, one for each area of care at Curate Health."
  );
  const diagramImage = imageValue(
    diagramAsset._id,
    `The five pillars of health at Curate Health: ${pillars.join(", ").toLowerCase()}.`
  );

  const result = await mutate([
    {
      patch: {
        id: await query(
          `*[_type == "servicesHeroSection" && !(_id in path("drafts.**"))][0]._id`
        ),
        set: {
          "seo.socialMeta.ogImage": collageImage,
          "seo.socialMeta.twitterImage": collageImage,
        },
      },
    },
    {
      patch: {
        id: await query(
          `*[_type == "pillarsOfHealth" && !(_id in path("drafts.**"))][0]._id`
        ),
        set: {
          "seo.socialMeta.ogImage": diagramImage,
          "seo.socialMeta.twitterImage": diagramImage,
        },
      },
    },
  ]);

  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
