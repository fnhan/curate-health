/**
 * CH-025, part one: retire the closed downtown location.
 *
 *   node scripts/retire-second-location.js            dry run, writes nothing
 *   node scripts/retire-second-location.js --apply    submits the mutations
 *
 * The second location, "Curate Health - Downtown" at 777 Bay St inside the
 * Centre for Sport and Recreational Medicine, is closed. This removes
 * contactInfo2 from siteSettings, its draft, and contactPage, and branchName2
 * from contactPage.
 *
 * THE DIRECTIONS LINK HAS TO MOVE FIRST
 *
 * contactPage carries two map values and both are wrong for the element that
 * uses them:
 *
 *   contactInfo.mapLink   a Google Maps *embed* URL, byte-identical to mapURL.
 *                         Rendered as <a href> at app/contact/page.tsx:74 and
 *                         :186, so the main "Get Directions" button currently
 *                         opens a bare embed frame rather than directions.
 *
 *   contactInfo2.mapLink  the only real directions URL in the document, with a
 *                         daddr parameter, and it points at 989 Eglinton, the
 *                         main location, not at 777 Bay. It sits inside the
 *                         object being deleted.
 *
 * So the working link for the main location is inside the object we are about
 * to remove. This script rescues it: the daddr is retyped to the CH-021
 * address, and the result is written to contactInfo.mapLink, which is the field
 * the two anchors already read. No code change is needed for the wiring.
 *
 * Everything else in the URL is preserved byte for byte, including the geocode
 * parameter, which pins the Google place id and is what actually determines the
 * destination.
 */

const { countCf, mutate, query } = require("./lib/sanity-cli");

const SITE_SETTINGS_ID = "731dc48e-5025-4709-8a00-aaa49f84812c";
const CONTACT_PAGE_ID = "ba90a190-6e64-4230-b483-7134689d667d";
const DRAFT_SITE_SETTINGS_ID = `drafts.${SITE_SETTINGS_ID}`;

const TARGET_IDS = [SITE_SETTINGS_ID, CONTACT_PAGE_ID, DRAFT_SITE_SETTINGS_ID];

/**
 * Replacement daddr, typed by hand to match the CH-021 address. The previous
 * value read "989+Eglinton+Ave+W+Suite+2,+York,+ON+M6C+2C6".
 */
const CORRECTED_DADDR = "989+Eglinton+Ave+W,+Suite+2,+Toronto,+ON+M6C+2C6";

const RULE = "=".repeat(96);
const THIN = "-".repeat(96);

function shortId(id) {
  const isDraft = String(id).startsWith("drafts.");
  return String(id).replace(/^drafts\./, "").slice(0, 8) + (isDraft ? " (draft)" : "");
}

function row(cells, widths) {
  return cells
    .map((cell, index) => String(cell).padEnd(widths[index]))
    .join("  ");
}

function table(head, rows) {
  const widths = head.map((title, index) =>
    Math.max(title.length, ...rows.map((cells) => String(cells[index]).length))
  );

  console.log("\n" + row(head, widths));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of rows) console.log(row(cells, widths));
  if (!rows.length) console.log("(nothing)");
}

/** Swaps only the daddr parameter, leaving the rest of the URL untouched. */
function correctDaddr(url) {
  if (!/[?&]daddr=/.test(url)) return null;

  return url.replace(/([?&]daddr=)[^&]*/, `$1${CORRECTED_DADDR}`);
}

function describeAddress(address) {
  if (!address) return "(no address)";

  return ["street", "city", "state", "zip"]
    .map((field) => address[field])
    .filter(Boolean)
    .join(" / ");
}

async function main() {
  if (countCf(CORRECTED_DADDR) > 0) {
    throw new Error("CORRECTED_DADDR contains Format-category characters.");
  }
  if (CORRECTED_DADDR.includes("York")) {
    throw new Error("CORRECTED_DADDR still reads York.");
  }
  if (!CORRECTED_DADDR.includes("Toronto")) {
    throw new Error("CORRECTED_DADDR does not read Toronto.");
  }

  const apply = process.argv.includes("--apply");
  const documents = await query("*[_id in $ids]", { ids: TARGET_IDS });

  if (documents.length !== TARGET_IDS.length) {
    const found = documents.map((document) => document._id);
    console.error(
      `Expected ${TARGET_IDS.length} documents, found ${documents.length}. ` +
        `Missing: ${TARGET_IDS.filter((id) => !found.includes(id)).join(", ")}`
    );
    process.exit(2);
  }

  const byId = Object.fromEntries(documents.map((doc) => [doc._id, doc]));
  const contactPage = byId[CONTACT_PAGE_ID];

  // ------------------------------------------------ section 1, directions link

  const rescueSource =
    contactPage.contactInfo2 && contactPage.contactInfo2.mapLink;
  const currentLink = contactPage.contactInfo && contactPage.contactInfo.mapLink;
  const correctedLink = rescueSource ? correctDaddr(rescueSource) : null;

  if (!correctedLink) {
    console.error(
      "Could not find a daddr URL in contactPage.contactInfo2.mapLink. " +
        "Refusing to delete it, because that would destroy the only " +
        "directions link without a replacement."
    );
    process.exit(2);
  }

  console.log(RULE);
  console.log(
    apply
      ? "CH-025 RETIRE SECOND LOCATION, APPLY"
      : "CH-025 RETIRE SECOND LOCATION, DRY RUN, nothing will be written"
  );
  console.log(RULE);

  console.log("\nSECTION 1, DIRECTIONS LINK: rescued before the deletion");
  console.log(THIN);
  console.log(`\nfield        contactPage.contactInfo.mapLink`);
  console.log(`             read by app/contact/page.tsx:74 and :186`);
  console.log(`\ncurrent      ${currentLink}`);
  console.log(`             ^ an embed URL, wrong for an <a href>`);
  console.log(`\nrescued from contactPage.contactInfo2.mapLink`);
  console.log(`             ${rescueSource}`);
  console.log(`\nnew value    ${correctedLink}`);
  console.log(
    `             ^ daddr retyped, reads Toronto: ${correctedLink.includes("Toronto")}, reads York: ${correctedLink.includes("York")}`
  );

  const preservedGeocode = /[?&]geocode=([^&]*)/.exec(rescueSource);
  const geocodeValue = preservedGeocode ? preservedGeocode[1] : null;
  console.log(
    `\ngeocode      ${geocodeValue ?? "(none)"} preserved: ${
      geocodeValue !== null && correctedLink.includes(geocodeValue)
    }`
  );

  // ------------------------------------------------------- section 2, deletions

  console.log(`\n${RULE}`);
  console.log("SECTION 2, DELETIONS: fields removed from each document");
  console.log(RULE);

  const deletionRows = [];
  const deletions = [];

  for (const id of TARGET_IDS) {
    const document = byId[id];
    const unset = [];

    if (document.contactInfo2 !== undefined) {
      unset.push("contactInfo2");
      deletionRows.push([
        shortId(id),
        document._type,
        "contactInfo2",
        document.contactInfo2.brandName || "(no brandName)",
        describeAddress(document.contactInfo2.address),
      ]);
    }

    if (document.branchName2 !== undefined) {
      unset.push("branchName2");
      deletionRows.push([
        shortId(id),
        document._type,
        "branchName2",
        JSON.stringify(document.branchName2),
        "(no address)",
      ]);
    }

    if (unset.length) deletions.push({ id, unset, rev: document._rev });
  }

  table(
    ["document", "type", "field", "value / brandName", "address being destroyed"],
    deletionRows
  );

  console.log(`\n${THIN}`);
  console.log("Effect on the rendered page");
  console.log(THIN);
  console.log(
    "\n  The second-location section at app/contact/page.tsx:225-297 stops"
  );
  console.log("  rendering, taking with it the blank heading, the");
  console.log('  "undefined, undefined, undefined undefined" address line, its');
  console.log("  Get Directions button, and the empty iframe fed by the null");
  console.log("  mapURL2.");
  console.log(
    "\n  The main Get Directions button at :186 keeps working and starts"
  );
  console.log("  pointing at real directions for the first time.");

  // ------------------------------------------------------------------ mutating

  const mutations = [
    {
      patch: {
        id: CONTACT_PAGE_ID,
        ifRevisionID: contactPage._rev,
        set: { "contactInfo.mapLink": correctedLink },
      },
    },
    ...deletions.map(({ id, unset, rev }) => ({
      patch: { id, ifRevisionID: rev, unset },
    })),
  ];

  if (!apply) {
    console.log(`\n${RULE}`);
    console.log(
      `DRY RUN COMPLETE. ${mutations.length} patches prepared, none sent.`
    );
    console.log("Re-run with --apply to write.");
    console.log(RULE);
    return;
  }

  console.log(`\nSubmitting ${mutations.length} patches...`);
  const result = await mutate(mutations);
  console.log(`Done. ${result.results.length} documents patched.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
