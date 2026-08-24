/**
 * CH-020 acceptance check: audits the production dataset for Format-category
 * (Unicode Cf) characters.
 *
 *   node scripts/audit-unicode.js
 *   node scripts/audit-unicode.js --json
 *
 * Exits 0 when the dataset is clean, 1 when contamination is present, so it can
 * gate a deploy or be run as a plain pass/fail check between sessions.
 *
 * WHY THIS QUERIES SANITY AND NOT THE RENDERED PAGES
 *
 * The obvious check, fetching a page and counting Cf characters in the HTML,
 * under-reports. app/llms.txt/route.ts normalises whitespace, and JavaScript's
 * \s character class matches U+FEFF, so every U+FEFF is silently converted to a
 * space before it reaches the response. On the current data that hides 409 of
 * the 1,906 contaminated characters in the address, and a rendered-output audit
 * would report the address as 79% clean when the stored value is untouched.
 *
 * Counting the source of truth avoids that entirely. It also reports which
 * document and field to fix, which rendered output cannot.
 *
 * Read-only. Uses SANITY_API_READ_TOKEN and issues no mutations.
 */

const {
  annotate,
  codepoint,
  countCf,
  getConfig,
  query,
  walkStrings,
} = require("./lib/sanity-cli");

const CODEPOINT_NAMES = {
  "U+00AD": "SOFT HYPHEN",
  "U+200B": "ZERO WIDTH SPACE",
  "U+200C": "ZERO WIDTH NON-JOINER",
  "U+200D": "ZERO WIDTH JOINER",
  "U+200E": "LEFT-TO-RIGHT MARK",
  "U+200F": "RIGHT-TO-LEFT MARK",
  "U+2060": "WORD JOINER",
  "U+FEFF": "ZERO WIDTH NO-BREAK SPACE (BOM)",
};

const RULE = "=".repeat(74);
const THIN = "-".repeat(74);

async function main() {
  const asJson = process.argv.includes("--json");
  const config = getConfig();

  const documents = await query("*[]");

  const affected = [];
  const codepointTotals = new Map();
  const fieldTotals = new Map();

  for (const document of documents) {
    const fields = [];

    for (const [path, value] of walkStrings(document)) {
      const count = countCf(value);
      if (!count) continue;

      fields.push({ path, count, value });

      for (const character of value.match(/\p{Cf}/gu) || []) {
        const key = codepoint(character);
        codepointTotals.set(key, (codepointTotals.get(key) || 0) + 1);
      }

      const normalised = path.replace(/\[\d+\]/g, "[]");
      fieldTotals.set(normalised, (fieldTotals.get(normalised) || 0) + count);
    }

    if (!fields.length) continue;

    affected.push({
      _id: document._id,
      _type: document._type,
      isDraft: String(document._id).startsWith("drafts."),
      total: fields.reduce((sum, field) => sum + field.count, 0),
      fields: fields.sort((a, b) => b.count - a.count),
    });
  }

  affected.sort((a, b) => b.total - a.total);

  const total = affected.reduce((sum, document) => sum + document.total, 0);
  const contentDocuments = documents.filter(
    (document) => !String(document._type).startsWith("sanity.")
  );

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          dataset: config.dataset,
          documentsScanned: documents.length,
          contentDocuments: contentDocuments.length,
          documentsAffected: affected.length,
          totalCfCharacters: total,
          byCodepoint: Object.fromEntries(codepointTotals),
          byField: Object.fromEntries(fieldTotals),
          affected: affected.map((document) => ({
            ...document,
            fields: document.fields.map(({ path, count }) => ({ path, count })),
          })),
        },
        null,
        2
      )
    );

    process.exit(total === 0 ? 0 : 1);
  }

  console.log(RULE);
  console.log("Unicode Cf audit, Sanity source of truth (CH-020)");
  console.log(RULE);
  console.log(`dataset:             ${config.dataset}`);
  console.log(`documents scanned:   ${documents.length}`);
  console.log(`  content documents: ${contentDocuments.length}`);
  console.log(`  sanity.* system:   ${documents.length - contentDocuments.length}`);
  console.log(`documents affected:  ${affected.length}`);
  console.log(`total Cf chars:      ${total}`);

  if (total === 0) {
    console.log("\nPASS: no Format-category characters in the dataset.");
    process.exit(0);
  }

  console.log(`\n${THIN}\nBy codepoint\n${THIN}`);
  for (const [key, count] of [...codepointTotals].sort((a, b) => b[1] - a[1])) {
    console.log(
      `  ${key}  ${String(count).padStart(7)}   ${CODEPOINT_NAMES[key] || "(other Cf)"}`
    );
  }

  console.log(`\n${THIN}\nBy field path, array indices collapsed\n${THIN}`);
  for (const [path, count] of [...fieldTotals].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(7)}  ${path}`);
  }

  console.log(`\n${THIN}\nBy document\n${THIN}`);
  for (const document of affected) {
    console.log(
      `\n${document.total} chars  ${document._type}  ${document._id}` +
        (document.isDraft ? "  [DRAFT]" : "")
    );

    for (const field of document.fields) {
      console.log(`  ${String(field.count).padStart(6)}  ${field.path}`);
      const shown = annotate(field.value);
      console.log(
        `          ${shown.length > 160 ? shown.slice(0, 160) + " ..." : shown}`
      );
    }
  }

  console.log(`\nFAIL: ${total} Format-category characters remain.`);
  console.log("Run: node scripts/fix-address-unicode.js");
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
