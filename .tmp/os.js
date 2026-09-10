const { query } = require("../scripts/lib/sanity-cli");
const fs = require("fs");
const files = ["043cf8e17015386312d73dd263c1ff7f.jfif", "ec08b5c7649286a5e80bac36ae6c5d85.jfif",
  "88dcbcec437b1f4c5d4afb7e2a8ae3a7.png", "a1b32a7a80b1b58a58bf93dbe7b7373c.jfif", "Copy of _MG_9359.jpg"];
(async () => {
  for (const n of files) {
    const a = await query(`*[_type=="sanity.imageAsset" && originalFilename==$n][0]{url,_id,"w":metadata.dimensions.width,"h":metadata.dimensions.height}`, { n });
    if (!a) { console.log("miss", n); continue; }
    const r = await fetch(a.url + "?w=520&fm=webp&q=70");
    fs.writeFileSync("os_" + n.replace(/[^a-z0-9]/gi, "_").slice(0, 20) + ".webp", Buffer.from(await r.arrayBuffer()));
    console.log(n.padEnd(48), a.w + "x" + a.h, a._id);
  }
})();
