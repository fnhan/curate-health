/**
 * CH-029: the oversized PNGs, converted to JPEG. Frank, 2026-10-24.
 *
 *   node scripts/convert-heavy-pngs.js                 # dry run, lists them
 *   node scripts/convert-heavy-pngs.js --apply
 *   node scripts/convert-heavy-pngs.js --apply --limit=5
 *
 * WHY A PHOTOGRAPH STORED AS PNG IS THE WHOLE PROBLEM
 *
 * PNG is lossless, which is right for a logo or a diagram and wrong for a
 * photograph: it stores every pixel of sensor noise exactly, at no visible
 * benefit. The yoga hero is 33 MB at 6500x3846 for a picture the site never
 * paints wider than about 1400.
 *
 * `sizes` already means a visitor is served a resized copy, so this is not
 * about what reaches a browser. It is about what the resizer has to fetch
 * first: on a cold request Next pulls the whole 33 MB from Sanity before it
 * can produce a 280px thumbnail, which measured 4.4 seconds with the slot
 * blank until it arrived.
 *
 * WHAT IS CONVERTED, AND WHAT IS NOT
 *
 * Only an asset that is **referenced**, **opaque** and **over 1 MB**.
 *
 * `metadata.isOpaque` is the test, not `hasAlpha`. Nearly every PNG here
 * carries an alpha channel and almost none of them use it; hasAlpha would
 * have excluded the lot. isOpaque is computed from the pixels.
 *
 * **A genuinely transparent PNG is never touched.** Converting one to JPEG
 * fills its transparency with a flat colour, which would put a white box
 * behind the five product cutouts, the B Corp mark and the white logo on the
 * blog byline. Twenty-five assets are in that group and they stay as they
 * are, listed at the end.
 *
 * SANITY DOES THE CONVERSION, NOT A CANVAS
 *
 * Every other image job on this project was done on a canvas in the browser,
 * because there is no image library here. This one does not need it: the
 * asset CDN already renders `?w=2600&fm=jpg&q=90`, which is the same pipeline
 * that serves every resized image on the site. Fetching that and uploading it
 * is fewer moving parts than 49 round trips through a canvas, and the result
 * is what the CDN would have produced anyway.
 *
 * 2600px because nothing on the site paints wider than 1920, and twice that
 * is past any screen in use. q=90 because at a 2.5x downscale the artefacts
 * are below what a screen resolves.
 *
 * THE REFERENCES ARE REWRITTEN BY DEEP SEARCH, NOT BY A LIST OF PATHS
 *
 * An asset id turns up in a hero, a section image, an seo share image, a
 * portable text block and a product banner, at different depths. Every
 * document that references one is walked whole and every occurrence of the
 * id is swapped, which is the same reasoning as audit-booking-links.js: a
 * list of field names written from memory misses one.
 */
const { query, mutate, uploadImage, getConfig } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(
  (process.argv.find((a) => a.startsWith("--limit=")) ?? "").split("=")[1] || 0
);

/** Nothing on the site paints wider than 1920, so twice that is plenty. */
const MAX_WIDTH = 2600;
const QUALITY = 90;
const MIN_SIZE = 1024 * 1024;

const mb = (b) => Math.round((b / 1024 / 1024) * 100) / 100;

/** Every occurrence of an id, anywhere in a value, swapped for another. */
function swapRefs(node, from, to) {
  if (typeof node === "string") return node === from ? to : node;
  if (Array.isArray(node)) return node.map((n) => swapRefs(n, from, to));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = swapRefs(v, from, to);
    return out;
  }
  return node;
}

const countRefs = (node, id) =>
  JSON.stringify(node).split(`"${id}"`).length - 1;

(async () => {
  const pngs = await query(`*[_type == "sanity.imageAsset" && mimeType == "image/png"]{
    _id, originalFilename, size, url,
    "w": metadata.dimensions.width,
    "h": metadata.dimensions.height,
    "opaque": metadata.isOpaque,
    "refs": count(*[references(^._id) && !(_type match "sanity.*")])
  } | order(size desc)`);

  const used = pngs.filter((p) => p.refs > 0);
  const transparent = used.filter((p) => p.opaque !== true);
  const small = used.filter((p) => p.opaque === true && p.size <= MIN_SIZE);
  let candidates = used.filter(
    (p) => p.opaque === true && p.size > MIN_SIZE
  );

  if (LIMIT) candidates = candidates.slice(0, LIMIT);

  const before = candidates.reduce((s, p) => s + p.size, 0);

  console.log();
  console.log(
    `  ${used.length} referenced PNGs. ${candidates.length} to convert, ${mb(before)} MB.`
  );
  console.log(
    `  ${transparent.length} genuinely transparent, left as PNG. ${small.length} opaque and under 1 MB, left alone.`
  );
  console.log();

  if (!APPLY) {
    for (const p of candidates) {
      const target = Math.min(p.w, MAX_WIDTH);
      console.log(
        `  ${String(mb(p.size)).padStart(7)} MB  ${p.w}x${p.h} -> ${target}px wide  refs=${p.refs}  ${p.originalFilename}`
      );
    }
    console.log();
    console.log("  STAYING PNG, transparency in use:");
    for (const p of transparent) {
      console.log(`  ${String(mb(p.size)).padStart(7)} MB  ${p.w}x${p.h}  ${p.originalFilename}`);
    }
    console.log();
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const { projectId, dataset } = getConfig();
  let after = 0;
  let rewritten = 0;
  const failures = [];

  for (const [i, p] of candidates.entries()) {
    const target = Math.min(p.w, MAX_WIDTH);
    const src = `${p.url}?w=${target}&fm=jpg&q=${QUALITY}`;

    const response = await fetch(src);
    if (!response.ok) {
      failures.push(`${p.originalFilename}: fetch ${response.status}`);
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const name = p.originalFilename.replace(/\.png$/i, "") + ".jpg";
    const asset = await uploadImage(buffer, name, "image/jpeg");
    after += buffer.length;

    // Every document holding the old id, walked whole.
    const docs = await query(
      `*[references($id) && !(_type match "sanity.*")]`,
      { id: p._id }
    );

    const patches = [];
    for (const doc of docs) {
      const next = swapRefs(doc, p._id, asset._id);
      const set = {};
      for (const [k, v] of Object.entries(next)) {
        if (k.startsWith("_")) continue;
        if (JSON.stringify(v) !== JSON.stringify(doc[k])) set[k] = v;
      }
      if (!Object.keys(set).length) continue;
      patches.push({ patch: { id: doc._id, ifRevisionID: doc._rev, set } });
      rewritten += countRefs(doc, p._id);
    }

    if (patches.length) await mutate(patches);

    console.log(
      `  ${String(i + 1).padStart(2)}/${candidates.length}  ${mb(p.size)} MB -> ${mb(buffer.length)} MB  ${patches.length} doc(s)  ${p.originalFilename}`
    );
  }

  console.log();
  console.log(
    `  ${mb(before)} MB of PNG became ${mb(after)} MB of JPEG, ${Math.round((1 - after / before) * 100)}% smaller.`
  );
  console.log(`  ${rewritten} references rewritten.`);

  if (failures.length) {
    console.log("\n  FAILED:");
    for (const f of failures) console.log(`    ${f}`);
  }

  // Read back: nothing should still point at a converted PNG.
  const stragglers = await query(
    `*[_type == "sanity.imageAsset" && mimeType == "image/png" && metadata.isOpaque == true && size > $min]{
      originalFilename, "refs": count(*[references(^._id) && !(_type match "sanity.*")])
    }[refs > 0]`,
    { min: MIN_SIZE }
  );
  console.log(
    `\n  Reading back: ${stragglers.length} heavy opaque PNG(s) still referenced.`
  );
  for (const s of stragglers) console.log(`    ${s.originalFilename}`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
