/**
 * Creates the aboutIndexPage document. CH-009 groundwork.
 *
 *   node scripts/create-about-page.js           # dry run, writes nothing
 *   node scripts/create-about-page.js --apply
 *
 * Copy approved by Frank on 2026-09-12, after his edits to the draft.
 *
 * NO COUNT OF PRACTITIONERS, ON PURPOSE
 *
 * The draft said "Seven practitioners work here". Frank's objection is the
 * right one: the roster changes, this text does not follow it, and a number
 * that quietly goes stale on the page a search engine reads for trust is worse
 * than no number. Same reasoning behind "and more" after the disciplines.
 *
 * Every discipline is capitalised as house style. Only Pilates was capitalised
 * in the draft, because it is named after Joseph Pilates and is a proper noun
 * where the others are not. Consistency wins over that distinction here.
 *
 * createIfNotExists, so running this where somebody has already written the
 * page does not overwrite their words. The route carries fallbacks either way.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const INTRO = [
  "A curated health and wellness destination at 989 Eglinton Ave W in Midtown Toronto.",
  "Our practitioners work across Chiropractic, Physiotherapy, Massage Therapy, Naturopathic Medicine, Psychotherapy, Lifestyle Medicine, Pilates, and more. The practice is built around evidence-based interdisciplinary care, which in practice means your practitioners talk to each other about your case rather than treating it separately.",
  "There is also a cafe, a Recovery Sanctuary, and a set of programs that run over months rather than appointments.",
].join("\n\n");

const DOC = {
  _id: "aboutIndexPage",
  _type: "aboutIndexPage",
  title: "About Curate Health",
  intro: INTRO,
  seo: {
    _type: "seo",
    pageTitle: "About Curate Health",
    pageDescription:
      "An interdisciplinary health and wellness practice at 989 Eglinton Ave W in Midtown Toronto. Meet the team, the programs and what the practice is built around.",
  },
};

async function main() {
  const existing = await query(`*[_type == "aboutIndexPage"][0]{_id, title}`);

  if (existing) {
    console.log(`Already exists: ${existing._id} (${existing.title})`);
    console.log("Nothing to do. Edit it in the Studio rather than here.");
    return;
  }

  console.log("Will create aboutPage:\n");
  console.log(`  title ${DOC.title}\n`);
  INTRO.split("\n\n").forEach((p) => console.log(`  ${p}\n`));
  console.log(`  seo.pageTitle       ${DOC.seo.pageTitle}`);
  console.log(`  seo.pageDescription ${DOC.seo.pageDescription}`);

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  const result = await mutate([{ createIfNotExists: DOC }]);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_type == "aboutIndexPage"][0]{_id, title, intro}`
  );
  if (!after?.intro) {
    console.error(
      "\nWrote, but no aboutIndexPage document reads back with copy."
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `Verified: ${after._id}, ${after.intro.length} characters of intro.`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
