const { query } = require("../scripts/lib/sanity-cli");
(async () => {
  const d = await query(`*[_type=="pillarsOfHealth" && !(_id in path("drafts.**"))][0]{
    "heroTitle": heroSection.heroTitle,
    "pillars": pillars[]{pillarName, pillarDescription}
  }`);
  console.log("hero:", JSON.stringify(d.heroTitle));
  (d.pillars || []).forEach((p, i) => console.log(`  ${i}. ${p.pillarName}`));
})();
