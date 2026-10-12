/**
 * The prose bands on /services and /products.
 *
 *   node scripts/apply-section-intros.js            # dry run
 *   node scripts/apply-section-intros.js --apply
 *
 * Both hubs were a photograph, a menu and a grid of photographs, so the only
 * words a crawler or an answer engine could read off either was the list of
 * names in the grid. /about got a prose band first; Frank asked on 2026-10-12
 * for the three sections to read the same.
 *
 * The /services copy is Frank's own, corrected for grammar and for the tone
 * rule; every change is listed in the pull request. The /products copy is a
 * draft he approved on the same day.
 *
 * THE FIRST PARAGRAPH IS THE HERO'S STANDING LINE
 *
 * One field holds the whole of a page's prose and the page splits it, the way
 * /about already did. So writing this field alone changes nothing on the live
 * site until the code deploys, which is the safe ordering: the content lands
 * where nothing reads it yet.
 *
 * Drafts are patched alongside their published document. An autosaved draft
 * holding the older copy would put it back the moment somebody pressed Publish,
 * which is the hazard recorded under the stale siteSettings draft.
 *
 * TWO PHASES, ONE DEPLOY APART
 *
 *   --phase=1   servicesHeroSection.intro, a field that does not exist in the
 *               deployed code, so nothing reads it and the live site is
 *               unchanged. Safe before the merge.
 *   --phase=2   productsPage.intro, AFTER the merge has deployed. That field
 *               is already live and is read whole as the hero's standing line,
 *               so writing 123 words into it while the old code is serving
 *               would spill three paragraphs over a 400px hero on a public
 *               page. The new code takes only the first paragraph.
 *
 * The phases are refused together for that reason, the same way
 * scripts/dedupe-address.js refuses its two.
 */

const { query, mutate } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const SERVICES_INTRO = [
  "Curate Health is an interdisciplinary clinic in Midtown Toronto. Care is organized into three areas, and most people use more than one.",

  "Clinical Care is where assessment and hands-on treatment happen, and where most people start. It covers chiropractic care, physiotherapy, massage therapy, acupuncture, naturopathy, psychotherapy and nutritional counselling.",

  "Movement and Training is where treatment turns into capacity. We meet you where you are, and take you through the spectrum, from exercise rehab to fitness training and performance training.",

  "The Recovery Sanctuary is our outdoor space, offering a sauna and cold plunge experience along with outdoor yoga therapy, outdoor Pilates, breathwork and meditation. We are also one of the few clinics in Toronto to offer Flowpresso therapy.",

  "What makes this interdisciplinary rather than simply co-located: your practitioners discuss your case with each other. A chiropractor and a physiotherapist working on the same back agree on an approach between them rather than each running a separate plan.",

  "Appointments are booked through Jane, where the fee for each service is listed.",
].join("\n\n");

const PRODUCTS_INTRO = [
  "Curate Health fits and supplies a small range of items that support treatment rather than replace it. Each one is fitted or selected in the clinic at 989 Eglinton Ave W in Midtown Toronto.",

  "Custom foot orthotics and custom knee braces are made to a cast or measurement taken here. Compression stockings are sized in person. TENS machines are demonstrated before you take one home, so you know where the pads go and what settings to start on. Professional grade supplements are stocked in the clinic rather than sold online, so your practitioner knows what you are taking alongside your treatment.",

  "Whether an item is claimable depends on your own plan. Ask your practitioner what you need before you check with your provider.",
].join("\n\n");

const TARGETS = [
  {
    phase: 1,
    type: "servicesHeroSection",
    field: "intro",
    value: SERVICES_INTRO,
  },
  { phase: 2, type: "productsPage", field: "intro", value: PRODUCTS_INTRO },
];

/** The content rules that apply to every word written into the site. */
function check(label, text) {
  const problems = [];
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  for (const m of text.matchAll(/[–—]/g)) {
    problems.push(`dash at ${m.index}`);
  }
  if (text.includes("!")) problems.push("exclamation mark");
  if (/outdoor terrace/i.test(text)) problems.push("outdoor terrace");
  if (/café/i.test(text)) problems.push("accented cafe");
  for (const m of text.matchAll(/\p{Cf}/gu)) problems.push(`Cf at ${m.index}`);
  if (problems.length) {
    console.error(`  ${label}: ${problems.join(", ")}`);
    return false;
  }
  console.log(`  ${label}: content rules pass`);
  return true;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const phaseArg = process.argv.find((a) => a.startsWith("--phase="));
  const phase = phaseArg ? Number(phaseArg.slice("--phase=".length)) : null;

  if (apply && phase !== 1 && phase !== 2) {
    console.error(
      "--apply needs --phase=1 or --phase=2. Phase 2 goes after the deploy, " +
        "see the header for why they cannot run together."
    );
    process.exit(2);
  }

  const targets = phase ? TARGETS.filter((t) => t.phase === phase) : TARGETS;
  let clean = true;

  console.log("Content rules\n");
  for (const t of targets) clean = check(t.type, t.value) && clean;
  if (!clean) {
    console.error("\nRefusing to write copy that breaks the rules.");
    process.exit(1);
  }

  const mutations = [];
  console.log("\nDocuments\n");

  for (const t of targets) {
    // the published document and any draft of it, so a Publish cannot revert
    const docs = await query(
      `*[_type == $type || _id == "drafts." + *[_type == $type][0]._id]{_id, _rev, ${t.field}}`,
      { type: t.type }
    );
    if (!docs.length) throw new Error(`no ${t.type} document`);

    for (const d of docs) {
      const current = d[t.field] ?? "";
      const draft = d._id.startsWith("drafts.") ? "  [DRAFT]" : "";
      if (current === t.value) {
        console.log(`  ${t.type} ${d._id}${draft}: already set`);
        continue;
      }
      console.log(`  ${t.type} ${d._id}${draft}  [phase ${t.phase}]`);
      console.log(
        `    before: ${current ? JSON.stringify(current.slice(0, 90)) : "(empty)"}`
      );
      console.log(`    after:  ${JSON.stringify(t.value.slice(0, 90))}`);
      console.log(
        `    ${t.value.split(/\n{2,}/).length} paragraphs, ${t.value.trim().split(/\s+/).length} words`
      );
      mutations.push({
        patch: { id: d._id, ifRevisionID: d._rev, set: { [t.field]: t.value } },
      });
    }
  }

  if (!mutations.length) {
    console.log("\nNothing to write.");
    return;
  }

  if (!apply) {
    console.log(`\n${mutations.length} patches. Dry run, nothing written.`);
    return;
  }

  const result = await mutate(mutations);
  console.log(
    `\nApplied ${mutations.length} patches. Transaction ${result.transactionId || "(none)"}`
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
