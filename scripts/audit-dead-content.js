/**
 * Finds content and schema that nothing uses.
 *
 * Written after the aboutPage/aboutPages finding: ten documents nobody could
 * open in the Studio, five of them read by a query that was never imported.
 * That was found by hand. This looks for the rest of the class.
 *
 * Five checks, each answering a different question:
 *
 *   1 Dataset types the Studio does not register. Nobody can edit these,
 *     whether or not the site renders them. This is the one that bites: a
 *     document that renders and cannot be corrected.
 *   2 Registered types with no documents. A schema someone built and never
 *     filled in, which shows in the Studio as an empty list.
 *   3 Schema files on disk that schema.ts never imports. Started, not wired.
 *   4 Exported GROQ queries nothing imports. Dead code that still reads as
 *     evidence a type is in use, which is exactly how the aboutPage documents
 *     looked for as long as they lasted.
 *   5 Documents no live query selects and nothing references.
 *
 * Read-only. Exits 0 whatever it finds: this reports, it does not gate a
 * build. Deleting anything it names is a separate, signed-off decision.
 */

const fs = require("fs");
const path = require("path");

const { query } = require("./lib/sanity-cli");

const ROOT = path.join(__dirname, "..");
const SCHEMA_DIR = path.join(ROOT, "sanity", "schemas");
const SCHEMA_INDEX = path.join(ROOT, "sanity", "schema.ts");
const QUERIES = path.join(ROOT, "sanity", "lib", "queries.ts");

/**
 * Source trees that ship to a visitor. scripts/ is deliberately excluded: an
 * audit script mentioning a type is not the site using it, and counting it
 * would let this file keep its own findings alive.
 */
const APP_DIRS = ["app", "components", "lib", "sanity"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const appFiles = APP_DIRS.flatMap((dir) =>
  fs.existsSync(path.join(ROOT, dir)) ? walk(path.join(ROOT, dir)) : []
);

/**
 * Comments are stripped before anything is matched against a file.
 *
 * Without this the audit credits its own documentation. The comment in
 * aboutIndexPage.ts explaining that ABOUT_PAGES_QUERY reads those five
 * documents was enough to make this script report that query as imported, so
 * the first run called five dead documents live. A note about a thing is not
 * a use of it.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const sourceOf = new Map(
  appFiles.map((f) => [f, stripComments(fs.readFileSync(f, "utf8"))])
);
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");

/* ------------------------------------------------------------------ *
 * The schema on disk, and the subset schema.ts registers.
 * ------------------------------------------------------------------ */

/**
 * A schema file's type name is the `name:` it declares, not its filename.
 * Eight of these disagree: services.ts declares "service", treatment.ts
 * declares "treatments", clinicSection.ts declares "clinic". Matching on
 * filenames would report all eight as missing from the dataset.
 */
function declaredName(file) {
  const src = fs.readFileSync(file, "utf8");
  const name = src.match(/name:\s*"([^"]+)"/);
  const kind = src.match(/type:\s*"([^"]+)"/);
  return name ? { name: name[1], kind: kind ? kind[1] : "?" } : null;
}

const schemaFiles = fs
  .readdirSync(SCHEMA_DIR)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => ({
    file: f,
    base: f.replace(/\.ts$/, ""),
    ...declaredName(path.join(SCHEMA_DIR, f)),
  }));

const indexSrc = fs.readFileSync(SCHEMA_INDEX, "utf8");
const importedBases = new Set(
  [...indexSrc.matchAll(/from\s+"\.\/schemas\/([^"]+)"/g)].map((m) => m[1])
);

const registered = schemaFiles.filter((s) => importedBases.has(s.base));
const registeredTypes = new Set(registered.map((s) => s.name));
const registeredDocTypes = new Set(
  registered.filter((s) => s.kind === "document").map((s) => s.name)
);
const unregisteredFiles = schemaFiles.filter((s) => !importedBases.has(s.base));

/* ------------------------------------------------------------------ *
 * Which queries select which types, and whether anything imports them.
 * ------------------------------------------------------------------ */

const querySrc = stripComments(fs.readFileSync(QUERIES, "utf8"));
const queryBlocks = querySrc.split(/(?=export const \w+\s*=\s*groq)/);
const queryNames = [...querySrc.matchAll(/export const (\w+)\s*=\s*groq/g)].map(
  (m) => m[1]
);

/** A query is live only if a file other than queries.ts names it. */
const liveQueries = new Set(
  queryNames.filter((name) =>
    appFiles.some(
      (f) => f !== QUERIES && new RegExp(`\\b${name}\\b`).test(sourceOf.get(f))
    )
  )
);
const deadQueries = queryNames.filter((n) => !liveQueries.has(n));

/**
 * Every `_type == "x"` and `_type in ["x", "y"]` in a piece of source.
 * Inline GROQ in a route counts, not only queries.ts.
 */
function typesMentionedIn(src) {
  const found = new Set();
  for (const m of src.matchAll(/_type\s*==\s*"([^"]+)"/g)) found.add(m[1]);
  for (const m of src.matchAll(/_type\s+in\s+\[([^\]]+)\]/g)) {
    for (const q of m[1].matchAll(/"([^"]+)"/g)) found.add(q[1]);
  }
  return found;
}

const selectedTypes = new Set();
const selectedBy = new Map();

function note(type, where) {
  selectedTypes.add(type);
  if (!selectedBy.has(type)) selectedBy.set(type, new Set());
  selectedBy.get(type).add(where);
}

for (const f of appFiles) {
  if (f === QUERIES) continue;
  for (const t of typesMentionedIn(sourceOf.get(f))) note(t, rel(f));
}

/**
 * queries.ts is credited per export rather than as one file, so a type
 * selected only by a query nothing imports is not counted as in use. This is
 * the check that would have caught ABOUT_PAGES_QUERY on the day it was
 * written.
 */
for (const block of queryBlocks) {
  const name = block.match(/export const (\w+)\s*=\s*groq/);
  if (!name || !liveQueries.has(name[1])) continue;
  for (const t of typesMentionedIn(block)) note(t, `queries.ts ${name[1]}`);
}

/* ------------------------------------------------------------------ *
 * The dataset.
 * ------------------------------------------------------------------ */

async function main() {
  /**
   * Drafts are excluded because they autosave and are not a separate thing to
   * retire. The three namespace prefixes are infrastructure owned by Sanity
   * and by the Mux plugin: image assets, the Studio's own task and release
   * groups, the retention record, the Mux API key. None of them is content
   * and none is editable by design, so listing them as findings would bury
   * the ones that are.
   */
  const rows = await query(
    `*[!(_id in path("drafts.**")) && !(_type match "sanity.*")
       && !(_type match "system.*") && !(_type match "mux.*")]{
      _type, _id, _updatedAt
    }`
  );

  const byType = new Map();
  for (const doc of rows) {
    if (!byType.has(doc._type)) byType.set(doc._type, []);
    byType.get(doc._type).push(doc);
  }

  const datasetTypes = [...byType.keys()].sort();

  console.log(
    `Dataset: ${rows.length} content documents across ${datasetTypes.length} types\n`
  );

  const notEditable = datasetTypes.filter((t) => !registeredTypes.has(t));
  console.log("1. Types in the dataset the Studio does not register");
  if (!notEditable.length) {
    console.log("   none\n");
  } else {
    for (const t of notEditable) {
      const live = selectedTypes.has(t);
      console.log(
        `   ${t.padEnd(20)} ${String(byType.get(t).length).padStart(3)} docs   ` +
          (live ? "RENDERS, and cannot be edited" : "read by nothing")
      );
      if (live) for (const w of selectedBy.get(t)) console.log(`        read by ${w}`);
    }
    console.log();
  }

  const emptyTypes = [...registeredDocTypes].filter((t) => !byType.has(t)).sort();
  console.log("2. Registered document types with no documents");
  console.log(emptyTypes.length ? `   ${emptyTypes.join("\n   ")}\n` : "   none\n");

  console.log("3. Schema files schema.ts never imports");
  if (!unregisteredFiles.length) {
    console.log("   none\n");
  } else {
    for (const s of unregisteredFiles) {
      const n = byType.has(s.name) ? byType.get(s.name).length : 0;
      console.log(
        `   sanity/schemas/${s.file.padEnd(18)} declares "${s.name}"` +
          `${"".padEnd(Math.max(0, 18 - s.name.length))} ${n} docs`
      );
    }
    console.log();
  }

  console.log("4. Exported queries nothing imports");
  if (!deadQueries.length) {
    console.log("   none\n");
  } else {
    for (const q of deadQueries) {
      const block = queryBlocks.find((b) => b.includes(`export const ${q} `));
      const types = block ? [...typesMentionedIn(block)] : [];
      console.log(`   ${q.padEnd(32)} selects ${types.join(", ") || "-"}`);
    }
    console.log();
  }

  console.log("5. Documents no live query selects and nothing references");
  const suspects = datasetTypes.filter((t) => !selectedTypes.has(t));
  if (!suspects.length) {
    console.log("   none\n");
  } else {
    for (const t of suspects) {
      for (const doc of byType.get(t)) {
        /**
         * A document reached through a reference is in use even though no
         * query names its type: practitioners are selected by dereferencing
         * them off a program, authors off a post. Counting incoming
         * references is what separates those from a genuine orphan.
         */
        const refs = await query(`count(*[references($id)])`, { id: doc._id });
        if (refs > 0) continue;
        console.log(
          `   ${t.padEnd(18)} ${doc._id.slice(0, 22).padEnd(24)} ` +
            `updated ${doc._updatedAt.slice(0, 10)}` +
            (registeredTypes.has(t) ? "" : "   not editable either")
        );
      }
    }
    console.log();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
