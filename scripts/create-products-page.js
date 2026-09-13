/**
 * Creates the productsPage document, seeded with the copy /products shipped
 * with. CH-010.
 *
 *   node scripts/create-products-page.js           # dry run, writes nothing
 *   node scripts/create-products-page.js --apply
 *
 * The page was built before this document type existed, so its heading, intro
 * and metadata lived in app/products/page.tsx and needed a deploy to reword.
 * This puts the same words into Sanity so an editor owns them.
 *
 * Uses createIfNotExists, so running it against a dataset where somebody has
 * already written the page does not overwrite their words. The route keeps its
 * fallbacks either way, which is what lets this document be optional rather
 * than load-bearing.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const DOC_ID = "productsPage";

const DOC = {
  _id: DOC_ID,
  _type: "productsPage",
  title: "Products",
  intro:
    "Braces, orthotics and clinical supplies fitted at the practice in Midtown Toronto. Each one is assessed and sized by a practitioner rather than sold off a shelf.",
  seo: {
    _type: "seo",
    pageTitle: "Products",
    pageDescription:
      "Custom foot orthotics, knee braces, compression stockings, TENS machines and professional grade supplements, fitted at Curate Health in Midtown Toronto.",
  },
};

async function main() {
  const existing = await query(
    `*[_type == "productsPage"][0]{_id, title, "hasSeo": defined(seo.pageTitle)}`
  );

  if (existing) {
    console.log(`Already exists: ${existing._id}`);
    console.log(`  title ${JSON.stringify(existing.title)}`);
    console.log(`  seo   ${existing.hasSeo ? "set" : "empty"}`);
    console.log("\nNothing to do. Edit it in the Studio rather than here.");
    return;
  }

  console.log("Will create productsPage:");
  console.log(`  title ${JSON.stringify(DOC.title)}`);
  console.log(`  intro ${JSON.stringify(DOC.intro)}`);
  console.log(`  seo.pageTitle ${JSON.stringify(DOC.seo.pageTitle)}`);
  console.log(
    `  seo.pageDescription ${JSON.stringify(DOC.seo.pageDescription)}`
  );

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  const result = await mutate([{ createIfNotExists: DOC }]);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  // Sanity reports mutations that changed nothing as applied, so confirm the
  // document is actually readable before saying it worked.
  const after = await query(
    `*[_type == "productsPage"][0]{_id, title, "seo": seo.pageTitle}`
  );

  if (!after?.title) {
    console.error("\nWrote, but no productsPage document can be read back.");
    process.exitCode = 1;
    return;
  }

  console.log(`Verified: ${after._id} titled ${JSON.stringify(after.title)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
