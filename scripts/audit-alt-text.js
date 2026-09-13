/**
 * Acceptance check for CH-028.
 *
 *   node scripts/audit-alt-text.js https://www.curatehealth.ca
 *   node scripts/audit-alt-text.js http://localhost:3000 --sanity
 *
 * Two views of the same problem.
 *
 * Without --sanity it reads rendered pages and reports every <img> whose alt
 * is missing or empty, with the page it sits on and the asset it points at.
 * That is what a crawler and a screen reader actually meet.
 *
 * With --sanity it walks the dataset instead and reports which document and
 * field holds the blank, which is the only thing you can act on: the rendered
 * page cannot tell you where to type the fix.
 *
 * An empty alt is not always wrong. alt="" is the correct markup for an image
 * that carries no information, and a screen reader announcing it would be
 * noise. Six on this site are genuinely decorative and are listed below by
 * name, so the check can pass while still reporting anything new.
 *
 * Exits 1 if any unlisted image has no usable alt.
 */

/**
 * Deliberately empty, each one checked by eye rather than assumed.
 *
 * The three checkmarks and the arrow are UI marks beside text that already
 * says what they mean. The Mux poster is the still frame behind the homepage
 * h1 while the video loads, and it already carries aria-hidden. CircleText is
 * a rotating graphic over a photo.
 *
 * Adding to this list is how an image stops being reported. Do it only after
 * looking at the image, and say why.
 */
const DECORATIVE = [
  "dark-green-checkmark",
  "cta-arrow",
  "thumbnail.webp", // the Mux hero poster
  "CircleText",
];

function isDecorative(src) {
  return DECORATIVE.some((name) => src.includes(name));
}

const { assertChecked } = require("./lib/assert-checked");

const args = process.argv.slice(2);
const sanityMode = args.includes("--sanity");
const target = (args.find((a) => a.startsWith("http")) || "https://www.curatehealth.ca").replace(/\/$/, "");

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "curate-alt/1.0" },
  });
  return res.ok ? await res.text() : "";
}

/** The asset filename out of a Sanity CDN or Next image URL, for identifying it. */
function assetOf(src) {
  const decoded = decodeURIComponent(src);
  const m = decoded.match(/([a-f0-9]{40}-\d+x\d+\.\w+)/);
  if (m) return m[1];
  return decoded.split("?")[0].split("/").pop() || decoded;
}

async function rendered() {
  const sitemap = await get(`${target}/sitemap.xml`);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  assertChecked({
    label: "sitemap URLs",
    count: urls.length,
    atLeast: 20,
    hint: `Got ${urls.length} from ${target}/sitemap.xml. With no pages, every image passes by not existing.`,
  });

  let totalImages = 0;
  const blanks = [];

  for (const url of urls) {
    const html = await get(url);
    const path = new URL(url).pathname;

    for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
      totalImages += 1;
      const raw = tag[0];
      const alt = raw.match(/\salt="([^"]*)"/);
      const src = raw.match(/\ssrc="([^"]*)"/);

      const source = src ? decodeURIComponent(src[1]) : "";
      if (isDecorative(source)) continue;

      if (!alt) {
        blanks.push({ path, kind: "no alt attribute", asset: assetOf(source) });
      } else if (!alt[1].trim()) {
        blanks.push({ path, kind: "empty alt", asset: assetOf(source) });
      }
    }
  }

  assertChecked({
    label: "img tags across the site",
    count: totalImages,
    atLeast: 50,
    hint: "Found almost no images, which means the pages did not render rather than that the alt text is fine.",
  });

  console.log(`${urls.length} pages, ${totalImages} img tags, ${blanks.length} without usable alt.\n`);

  const byPath = new Map();
  for (const b of blanks) {
    if (!byPath.has(b.path)) byPath.set(b.path, []);
    byPath.get(b.path).push(b);
  }

  for (const [path, list] of [...byPath].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${path}  (${list.length})`);
    for (const b of list) console.log(`      ${b.kind.padEnd(18)} ${b.asset}`);
  }

  return blanks.length;
}

async function fromSanity() {
  const { query, walkStrings } = require("./lib/sanity-cli");

  const docs = await query(
    `*[!(_type match "sanity.*") && !(_type match "system.*") && !(_type match "mux.*")]`
  );

  assertChecked({ label: "documents", count: docs.length, atLeast: 50 });

  /**
   * THE ALT IS RARELY ON THE OBJECT HOLDING THE ASSET
   *
   * A first version of this looked only at the node carrying asset._ref and
   * reported 225 blanks against 20 on the rendered site. Every extra one was
   * this mistake. The schemas use three shapes:
   *
   *   { asset }, with alt beside it          hero images
   *   { alt, image: { asset } }              sectionImage, alt on the PARENT
   *   { ctaBg: { asset }, ctaBgAlt }         a sibling under a different name
   *
   * So the asset's own object, its parent, and a sibling named after the field
   * plus "Alt" all have to be checked before calling anything blank.
   */
  const findings = [];

  function altFor(node, parent, key) {
    const candidates = [];

    const own = Object.keys(node).find((k) => /alt/i.test(k));
    if (own) candidates.push(node[own]);

    if (parent && key) {
      if (parent[`${key}Alt`] !== undefined) candidates.push(parent[`${key}Alt`]);
      const sibling = Object.keys(parent).find(
        (k) => /alt/i.test(k) && typeof parent[k] === "string"
      );
      if (sibling) candidates.push(parent[sibling]);
    }

    return candidates.find((v) => typeof v === "string" && v.trim());
  }

  function walk(node, doc, path, parent, key) {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, doc, `${path}[${i}]`, parent, key));
      return;
    }

    const ref = node.asset?._ref;
    if (ref && String(ref).startsWith("image-")) {
      if (!altFor(node, parent, key)) {
        findings.push({
          type: doc._type,
          id: doc._id,
          path,
          asset: String(ref).replace(/^image-/, "").slice(0, 44),
        });
      }
    }

    for (const [childKey, value] of Object.entries(node)) {
      if (childKey.startsWith("_")) continue;
      walk(value, doc, path ? `${path}.${childKey}` : childKey, node, childKey);
    }
  }

  for (const doc of docs) walk(doc, doc, "", null, null);

  console.log(
    `${docs.length} documents, ${findings.length} image fields with no alt.\n`
  );

  const byType = new Map();
  for (const f of findings) {
    if (!byType.has(f.type)) byType.set(f.type, []);
    byType.get(f.type).push(f);
  }

  for (const [type, list] of [...byType].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type}  (${list.length})`);
    for (const f of list) {
      console.log(`      ${f.id.slice(0, 20).padEnd(22)} ${f.path}`);
    }
  }

  return findings.length;
}

async function main() {
  const count = sanityMode ? await fromSanity() : await rendered();
  if (count) process.exit(1);
  console.log("\nEvery image carries alt text.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
