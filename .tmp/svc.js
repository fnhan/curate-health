const { query } = require("../scripts/lib/sanity-cli");
(async () => {
  const q = await query(`*[_type=="service" && isActive==true && !(_id in path("drafts.**"))]{
    title, "slug": slug.current, displayOrder,
    "hero": hero_image.asset->{_id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height},
    "heroAlt": hero_image.alt,
    "content": content_image.asset->{_id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height},
    "contentAlt": content_image.alt
  } | order(displayOrder asc, title asc)`);
  for (const c of q) {
    console.log(`\n${c.title}  (order ${c.displayOrder})`);
    console.log(`  hero    ${c.hero ? c.hero.originalFilename + "  " + c.hero.w + "x" + c.hero.h : "-"}`);
    console.log(`          ${c.hero ? c.hero._id : ""}`);
    console.log(`  content ${c.content ? c.content.originalFilename + "  " + c.content.w + "x" + c.content.h : "-"}`);
    console.log(`          ${c.content ? c.content._id : ""}`);
  }
})();
