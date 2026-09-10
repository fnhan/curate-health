const { query } = require("../scripts/lib/sanity-cli");
const fs = require("fs");
(async () => {
  for (const slug of ["custom-foot-orthotics", "compression-stockings"]) {
    const d = await query(`*[_type=="product" && slug.current==$slug][0]{
      "a": seo.socialMeta.ogImage.asset->{url, _id, originalFilename, "w":metadata.dimensions.width, "h":metadata.dimensions.height},
      "crop": seo.socialMeta.ogImage.crop}`, { slug });
    console.log(`${slug}: ${d.a.originalFilename} ${d.a.w}x${d.a.h}  crop=${JSON.stringify(d.crop)}`);
    console.log(`  ${d.a._id}`);
    // full image
    fs.writeFileSync(`full_${slug}.webp`, Buffer.from(await (await fetch(d.a.url + "?w=500&fm=webp&q=80")).arrayBuffer()));
    // what the card shows today
    fs.writeFileSync(`card_${slug}.webp`, Buffer.from(await (await fetch(d.a.url + "?w=600&h=315&fit=crop&fm=webp&q=80")).arrayBuffer()));
  }
})();
