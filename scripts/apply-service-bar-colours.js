/**
 * The small colour bar beside each service on the home page.
 *
 *   node scripts/apply-service-bar-colours.js           # dry run
 *   node scripts/apply-service-bar-colours.js --apply
 *
 * Frank asked on 2026-10-18 for Our Services to read as a pair with Our
 * Programs, including "the small color icons to the left of each of the three
 * programs". A programme carries its own `barColor`; a service now does too,
 * and this fills the three that exist.
 *
 * THE PALETTE IS THE PROGRAMMES' OWN
 *
 * #888D76, #AFBD8C and #DBDDD8, read off `ourProgramsSection.programs` rather
 * than picked, so the two sections use one set of colours. The order runs dark
 * to light down the list, as it does there.
 *
 * The field is editable in the Studio, so these are a starting point rather
 * than a decision. A service with the field empty draws no bar, which is the
 * right failure: a bar of no colour is worse than no bar.
 */

const { query, mutate } = require("./lib/sanity-cli");

/** Keyed by title, because a slug can change and a title is what Frank sees. */
const COLOURS = {
  "Clinical Care": "#888D76",
  "Movement & Training": "#AFBD8C",
  "Recovery Sanctuary": "#DBDDD8",
};

async function main() {
  const apply = process.argv.includes("--apply");

  const services = await query(
    `*[_type == "service" && isActive == true]{_id, _rev, title, barColor} | order(title asc)`
  );

  const programmes = await query(
    `*[_type == "ourProgramsSection"][0].programs[]{name, barColor}`
  );

  console.log("The programmes this borrows from");
  for (const p of programmes ?? []) {
    console.log(`  ${(p.name ?? "").padEnd(26)} ${p.barColor}`);
  }

  console.log(`\n${services.length} active services`);
  const mutations = [];
  for (const service of services) {
    const wanted = COLOURS[service.title];
    if (!wanted) {
      console.log(`  ${service.title.padEnd(26)} no colour chosen, left alone`);
      continue;
    }
    if (service.barColor === wanted) {
      console.log(`  ${service.title.padEnd(26)} ${wanted} already`);
      continue;
    }
    console.log(
      `  ${service.title.padEnd(26)} ${service.barColor ?? "(none)"} -> ${wanted}`
    );
    mutations.push({
      patch: {
        id: service._id,
        ifRevisionID: service._rev,
        set: { barColor: wanted },
      },
    });
  }

  if (!mutations.length) {
    console.log("\nNothing to write.");
    return;
  }

  if (!apply) {
    console.log(`\nDry run. ${mutations.length} would be written.`);
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied ${mutations.length}. Transaction ${result.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
