const { query } = require("../scripts/lib/sanity-cli");

/** Every image reference on a document, with the path that reaches it. */
function* images(node, trail = []) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* images(node[i], [...trail, i]);
    return;
  }
  if (node && typeof node === "object") {
    if (node._type === "reference" && /^image-/.test(node._ref || "")) {
      yield [trail.join("."), node._ref];
      return;
    }
    for (const [k, v] of Object.entries(node)) yield* images(v, [...trail, k]);
  }
}

(async () => {
  for (const type of ["ourStory", "pillarsOfHealth"]) {
    const doc = await query(`*[_type==$type && !(_id in path("drafts.**"))][0]`, { type });
    console.log(`\n### ${type}`);
    const refs = [...images(doc)];
    const ids = refs.map(r => r[1]);
    const assets = await query(`*[_id in $ids]{_id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height}`, { ids });
    const byId = Object.fromEntries(assets.map(a => [a._id, a]));
    for (const [path, ref] of refs) {
      const a = byId[ref] || {};
      console.log(`  ${(a.w + "x" + a.h).padEnd(12)} ${String(a.originalFilename).padEnd(46)} ${path}`);
    }
  }

  // The services hub lists the categories, each with its own photo.
  const cats = await query(`*[_type=="service" && isActive==true && !(_id in path("drafts.**"))]{
    title, "slug": slug.current,
    "hero": hero_image.asset->{_id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height},
    "content": content_image.asset->{_id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height}
  } | order(title asc)`);
  console.log("\n### live service categories (for the collage)");
  for (const c of cats) {
    console.log(`  ${c.title}  /${c.slug}`);
    if (c.hero) console.log(`      hero    ${(c.hero.w+"x"+c.hero.h).padEnd(12)} ${c.hero.originalFilename}  ${c.hero._id}`);
    if (c.content) console.log(`      content ${(c.content.w+"x"+c.content.h).padEnd(12)} ${c.content.originalFilename}`);
  }
})();
