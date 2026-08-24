/**
 * CH-020 and CH-021 in one pass, scoped to the three documents that actually
 * carry contamination.
 *
 *   node scripts/fix-address-unicode.js            dry run, writes nothing
 *   node scripts/fix-address-unicode.js --apply    submits the mutations
 *
 * SCOPE
 *
 * scripts/audit-unicode.js established that Cf contamination in production is
 * confined to three documents and two fields, address.street and address.zip.
 * The original CH-020 brief called for walking all 680 documents and rewriting
 * every string field. That is a far larger blast radius than the data warrants:
 * the trim step alone would rewrite legitimate values across 556 image assets
 * and every content document in the dataset. This patches the three known
 * documents instead. Re-run scripts/audit-unicode.js afterwards to confirm
 * nothing else is contaminated.
 *
 * The dry run prints two independently reviewable sections:
 *
 *   Section A, mechanical: strip Cf, then trim, within contactInfo.address only.
 *   No human judgement, and it only ever removes invisible characters and outer
 *   whitespace.
 *
 *   Section B, editorial: changes to the meaning of a value, currently
 *   addressLocality to Toronto and addressCountry to CA. These need sign-off.
 *
 * Patches carry ifRevisionID, so a concurrent edit in the Studio makes the
 * mutation fail rather than silently overwrite someone's work.
 */

const { countCf, mutate, query, walkStrings } = require("./lib/sanity-cli");

/** The three documents the audit found. Nothing else is touched. */
const TARGET_IDS = [
  "731dc48e-5025-4709-8a00-aaa49f84812c",
  "ba90a190-6e64-4230-b483-7134689d667d",
  "drafts.731dc48e-5025-4709-8a00-aaa49f84812c",
];

/**
 * CH-021 target address. Typed by hand, not pasted, per the working rules.
 * Keys are the Sanity field names; the schema.org name each maps to is in the
 * comment, because buildPostalAddress() in lib/structured-data.tsx renames them.
 */
const TARGET_ADDRESS = {
  street: "989 Eglinton Ave W, Suite 2", // streetAddress
  city: "Toronto", // addressLocality
  state: "ON", // addressRegion
  zip: "M6C 2C6", // postalCode
  country: "CA", // addressCountry
};

/** Section A never reaches outside this object. See the comment at its loop. */
const MECHANICAL_SCOPE_ROOT = "contactInfo";
const MECHANICAL_SCOPE_LEAF = "address";

const RULE = "=".repeat(96);
const THIN = "-".repeat(96);

/** Short id for tabular output. Full ids are in the header. */
function shortId(id) {
  const isDraft = String(id).startsWith("drafts.");
  const bare = String(id).replace(/^drafts\./, "");

  return bare.slice(0, 8) + (isDraft ? " (draft)" : "");
}

function row(cells, widths, aligns) {
  return cells
    .map((cell, index) => {
      const text = String(cell);
      return aligns[index] === "r"
        ? text.padStart(widths[index])
        : text.padEnd(widths[index]);
    })
    .join("  ");
}

/** Guards against this file itself becoming contaminated by a future paste. */
function assertTargetsAreClean() {
  for (const [field, value] of Object.entries(TARGET_ADDRESS)) {
    if (countCf(value) > 0) {
      throw new Error(
        `TARGET_ADDRESS.${field} contains Format-category characters. ` +
          `Retype it by hand.`
      );
    }

    if (value !== value.trim()) {
      throw new Error(`TARGET_ADDRESS.${field} has untrimmed whitespace.`);
    }
  }
}

function clean(value) {
  return value.replace(/\p{Cf}/gu, "").trim();
}

function setAtPath(document, path, value) {
  const segments = path.split(".");
  let node = document;

  for (const segment of segments.slice(0, -1)) {
    node = node[segment];
  }

  node[segments[segments.length - 1]] = value;
}

async function main() {
  assertTargetsAreClean();

  const apply = process.argv.includes("--apply");

  const documents = await query(
    "*[_id in $ids]",
    { ids: TARGET_IDS }
  );

  if (documents.length !== TARGET_IDS.length) {
    const found = documents.map((document) => document._id);
    const missing = TARGET_IDS.filter((id) => !found.includes(id));
    console.error(
      `Expected ${TARGET_IDS.length} documents, found ${documents.length}.\n` +
        `Missing: ${missing.join(", ")}\n` +
        `Re-run scripts/audit-unicode.js: the affected documents may have changed.`
    );
    process.exit(2);
  }

  const plan = [];

  for (const document of documents) {
    const mechanical = [];
    const editorial = [];

    // Section A: strip and trim, scoped to the address object only.
    //
    // An earlier revision walked every string field on these three documents.
    // The survey shows contamination is limited to two address fields, so the
    // wider walk bought nothing and pulled five unrelated content fields into
    // the patch: contactInfo2's second address, howToGetHere, parking and
    // branchName2, all of them whitespace-only trims. Trimming is the part of
    // this script that can change a value nobody asked to change, so it stays
    // inside the object the survey bounds.
    const addressNode =
      document[MECHANICAL_SCOPE_ROOT] &&
      document[MECHANICAL_SCOPE_ROOT][MECHANICAL_SCOPE_LEAF];

    for (const [suffix, value] of walkStrings(addressNode || {})) {
      const path = `${MECHANICAL_SCOPE_ROOT}.${MECHANICAL_SCOPE_LEAF}.${suffix}`;
      if (suffix.startsWith("_")) continue; // never touch system fields

      const next = clean(value);
      if (next === value) continue;

      mechanical.push({
        path,
        from: value,
        to: next,
        cfRemoved: countCf(value),
        trimmed: value.replace(/\p{Cf}/gu, "") !== next,
      });
    }

    // Apply Section A to a working copy so Section B compares post-strip values.
    const projected = JSON.parse(JSON.stringify(document));
    for (const change of mechanical) {
      setAtPath(projected, change.path, change.to);
    }

    // Section B: whatever still differs from the CH-021 target is editorial.
    const address = projected.contactInfo && projected.contactInfo.address;

    if (address) {
      for (const [field, target] of Object.entries(TARGET_ADDRESS)) {
        const current = address[field];
        if (current === target) continue;

        editorial.push({
          path: `contactInfo.address.${field}`,
          from: current === undefined ? null : current,
          to: target,
        });
      }
    }

    plan.push({ document, mechanical, editorial });
  }

  // ---------------------------------------------------------------- reporting

  console.log(RULE);
  console.log(
    apply
      ? "CH-020 + CH-021 APPLY"
      : "CH-020 + CH-021 DRY RUN, nothing will be written"
  );
  console.log(RULE);
  console.log(`documents in scope: ${plan.length}`);
  console.log(
    `mechanical changes: ${plan.reduce((n, entry) => n + entry.mechanical.length, 0)}`
  );
  console.log(
    `editorial changes:  ${plan.reduce((n, entry) => n + entry.editorial.length, 0)}`
  );

  console.log("\ndocuments:");
  for (const { document } of plan) {
    console.log(
      `  ${shortId(document._id).padEnd(18)} ${String(document._type).padEnd(14)} ${document._id}`
    );
  }

  // Current values are never printed. The street field holds 1,906 invisible
  // characters, which makes a before/after diff unreadable in a terminal and
  // unsafe to copy out of one. Lengths and Cf counts describe the input; only
  // the cleaned output, which is by definition free of Cf characters, is shown.

  console.log(`\n${RULE}`);
  console.log("SECTION A, MECHANICAL (CH-020): strip Cf characters, then trim");
  console.log(`Scoped to ${MECHANICAL_SCOPE_ROOT}.${MECHANICAL_SCOPE_LEAF}.* on the documents above.`);
  console.log("No change to meaning. Current values omitted, see note in source.");
  console.log(RULE);

  const A_HEAD = ["document", "field", "cur len", "Cf", "resulting value", "len"];
  const A_ALIGN = ["l", "l", "r", "r", "l", "r"];
  const aRows = [];

  for (const { document, mechanical } of plan) {
    for (const change of mechanical) {
      aRows.push([
        shortId(document._id),
        change.path.replace(`${MECHANICAL_SCOPE_ROOT}.${MECHANICAL_SCOPE_LEAF}.`, ""),
        change.from.length,
        change.cfRemoved,
        JSON.stringify(change.to),
        change.to.length,
      ]);
    }
  }

  const aWidths = A_HEAD.map((head, index) =>
    Math.max(head.length, ...aRows.map((cells) => String(cells[index]).length))
  );

  console.log("\n" + row(A_HEAD, aWidths, A_ALIGN));
  console.log(aWidths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of aRows) {
    console.log(row(cells, aWidths, A_ALIGN));
  }
  if (!aRows.length) console.log("(no mechanical changes)");

  console.log(`\n${RULE}`);
  console.log("SECTION B, EDITORIAL (CH-021): value changes needing sign-off");
  console.log("Compared against the post-strip value from Section A, so nothing");
  console.log("here is an artefact of the cleanup.");
  console.log(RULE);

  const B_HEAD = ["document", "field", "current value", "target value"];
  const B_ALIGN = ["l", "l", "l", "l"];
  const bRows = [];

  for (const { document, editorial } of plan) {
    for (const change of editorial) {
      bRows.push([
        shortId(document._id),
        change.path.replace(`${MECHANICAL_SCOPE_ROOT}.${MECHANICAL_SCOPE_LEAF}.`, ""),
        change.from === null ? "(null)" : JSON.stringify(change.from),
        JSON.stringify(change.to),
      ]);
    }
  }

  const bWidths = B_HEAD.map((head, index) =>
    Math.max(head.length, ...bRows.map((cells) => String(cells[index]).length))
  );

  console.log("\n" + row(B_HEAD, bWidths, B_ALIGN));
  console.log(bWidths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of bRows) {
    console.log(row(cells, bWidths, B_ALIGN));
  }
  if (!bRows.length) console.log("(no editorial changes)");

  console.log(`\n${THIN}`);
  console.log("Resulting address, all three documents, against the CH-021 target");
  console.log(THIN);

  const C_HEAD = ["document", ...Object.keys(TARGET_ADDRESS), "matches target"];
  const C_ALIGN = C_HEAD.map(() => "l");
  const cRows = [];

  for (const { document, mechanical, editorial } of plan) {
    const final = JSON.parse(JSON.stringify(document));
    for (const change of [...mechanical, ...editorial]) {
      setAtPath(final, change.path, change.to);
    }

    const address = final.contactInfo.address;
    const fields = Object.keys(TARGET_ADDRESS);
    const matches = fields.every(
      (field) => address[field] === TARGET_ADDRESS[field]
    );

    cRows.push([
      shortId(document._id),
      ...fields.map((field) => String(address[field])),
      matches ? "yes" : "NO",
    ]);
  }

  const cWidths = C_HEAD.map((head, index) =>
    Math.max(head.length, ...cRows.map((cells) => String(cells[index]).length))
  );

  console.log("\n" + row(C_HEAD, cWidths, C_ALIGN));
  console.log(cWidths.map((width) => "-".repeat(width)).join("  "));
  for (const cells of cRows) {
    console.log(row(cells, cWidths, C_ALIGN));
  }

  // ----------------------------------------------------------------- mutating

  const mutations = plan
    .filter((entry) => entry.mechanical.length || entry.editorial.length)
    .map((entry) => ({
      patch: {
        id: entry.document._id,
        ifRevisionID: entry.document._rev,
        set: Object.fromEntries(
          [...entry.mechanical, ...entry.editorial].map((change) => [
            change.path,
            change.to,
          ])
        ),
      },
    }));

  if (!apply) {
    console.log(`\n${RULE}`);
    console.log(`DRY RUN COMPLETE. ${mutations.length} patches prepared, none sent.`);
    console.log("Re-run with --apply to write. Export the dataset first:");
    console.log("  npx sanity dataset export production ./backup-<date>.tar.gz");
    console.log(RULE);
    return;
  }

  console.log(`\nSubmitting ${mutations.length} patches...`);
  const result = await mutate(mutations);
  console.log(`Done. ${result.results.length} documents patched.`);
  console.log("Now run: node scripts/audit-unicode.js");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
