/**
 * Step 4 of the restructure: move practitioners and programs into their own
 * documents.
 *
 *   node scripts/migrate-practitioners-programs.js            dry run
 *   node scripts/migrate-practitioners-programs.js --apply    writes
 *
 * ADDITIVE ONLY. Nothing existing is deleted or rewritten. The team page keeps
 * its embedded teamMembers, and the four program documents keep their content,
 * because the pages that render them have not been rewired yet. Retiring the
 * old shapes is a later step.
 *
 * Safe to re-run. Documents use deterministic ids and createIfNotExists, so a
 * second run adds nothing and overwrites nothing that has been edited since.
 *
 * WHAT IS COPIED VERBATIM
 *
 * Bios move across untouched, as portable text, keys and all. Credentials come
 * from the existing `role` field, which stores one credential per block, so
 * each block becomes one string. Nothing is reworded and nothing is invented.
 *
 * THE COLUMN ORDER TRAP
 *
 * threePaths.tableContent stores `extras` and `pricing` keyed by program name,
 * but `approach`, `focus` and `bestFor` as bare three item arrays. The two are
 * NOT in the same order. components/layout/our-programs-page/three-paths.tsx
 * renders the arrays in column order, which is:
 *
 *   [0] Essential Series
 *   [1] Curate Lifestyle
 *   [2] Master Health Blueprint
 *
 * while the keyed fields happen to read curateLifestyle, essentialSeries,
 * masterHealthBlueprint. Mapping the arrays by the keyed order would give
 * Curate Lifestyle the Essential Series approach and vice versa. The indices
 * below are taken from the rendered column order and cross-checked against the
 * text: index 0 reads "Self-led, flexible use", which is the self-directed
 * program, not the physician-led one.
 *
 * WHAT IS LEFT EMPTY, DELIBERATELY
 *
 *   photo.alt          No alt text exists for any staff photo. CH-028 covers
 *                      this and says Frank approves alt text before it lands.
 *                      Left unset, so the Studio flags it rather than shipping
 *                      an empty string that looks filled in.
 *   bookingNote        Dr. Leong's explanation is drafted in the mockup, but it
 *                      states a referral policy and needs sign-off as copy.
 *   program.body       No source. The program pages do not exist yet.
 *   program.faq        The hub FAQ is not split per program.
 *   languages          New fields. Frank and the practitioners fill these in.
 *   commonlyTreats     Clinical claims. Practitioner sign-off required.
 *   seo                Written when the pages are built.
 */

const { mutate, query } = require("./lib/sanity-cli");

/** Jane staff ids, from the restructure brief, verified against the booking site. */
const JANE = {
  "Dr. Frank Nhan": 1,
  "Safa Karoumi": 3,
  "Dr. David Gabriele": 7,
  "Andrew Huynh": 14,
  "Ariel Zohar": 17,
};

/**
 * Dr. Leong is deliberately absent from JANE. He is not publicly bookable,
 * confirmed by Frank on 2026-09-08, so his page carries a referral form button
 * instead of a booking button.
 */
const NOT_BOOKABLE = {
  "Dr. Eric Leong": {
    bookingCtaLabel: "Curate Lifestyle Referral Form",
    bookingCtaTarget: "curateLifestyleReferralForm",
  },
};

/** Team page order, from section 5.3 of the brief. Rooj added per Frank, 2026-09-08. */
const TEAM_ORDER = [
  "Dr. Frank Nhan",
  "Safa Karoumi",
  "Dr. David Gabriele",
  "Dr. Eric Leong",
  "Andrew Huynh",
  "Ariel Zohar",
  "Rooj Hussain",
];

/** Column index in threePaths.tableContent's bare arrays. See the header. */
const PROGRAMS = [
  {
    key: "essentialSeries",
    title: "Essential Series",
    slug: "essential-series",
    columnIndex: 0,
  },
  {
    key: "curateLifestyle",
    title: "Curate Lifestyle",
    slug: "curate-lifestyle",
    columnIndex: 1,
  },
  {
    key: "masterHealthBlueprint",
    title: "Master Health Blueprint",
    slug: "master-health-blueprint",
    columnIndex: 2,
  },
];

/** Sanity-safe id from a display name. */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** One credential per portable text block, trimmed. */
function blocksToStrings(blocks) {
  return (blocks || [])
    .map((block) =>
      (block.children || [])
        .map((child) => child.text || "")
        .join("")
        .trim()
    )
    .filter(Boolean);
}

function plain(value) {
  return typeof value === "string" ? value.trim() : undefined;
}

const RULE = "=".repeat(78);
const THIN = "-".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");

  const team = await query(
    `*[_type == "ourTeam" && !(_id in path("drafts.**"))][0]`
  );
  if (!team?.teamMembers?.length) {
    console.error("No team members found. Nothing to migrate.");
    process.exit(2);
  }

  const hub = await query(`*[_type == "ourPrograms"][0]`);
  if (!hub) {
    console.error("No ourPrograms document found.");
    process.exit(2);
  }

  const mutations = [];
  const warnings = [];

  console.log(RULE);
  console.log("PRACTITIONERS");
  console.log(RULE);

  const byName = new Map();

  for (const member of team.teamMembers) {
    const name = plain(member.name);
    if (!name) {
      warnings.push("A team member has no name and was skipped.");
      continue;
    }

    const slug = slugify(name);
    const id = `practitioner-${slug}`;
    byName.set(name, id);

    const credentials = blocksToStrings(member.role);
    const bioBlocks = member.bio || [];
    const jane = JANE[name];
    const special = NOT_BOOKABLE[name];

    const doc = {
      _id: id,
      _type: "practitioner",
      name,
      slug: { _type: "slug", current: slug },
      isActive: true,
      credentials,
    };

    if (member.image?.asset?._ref) {
      // alt deliberately absent, see the header.
      doc.photo = {
        _type: "image",
        asset: { _type: "reference", _ref: member.image.asset._ref },
      };
    } else {
      warnings.push(`${name} has no photo in Sanity.`);
    }

    if (bioBlocks.length) doc.fullBio = bioBlocks;
    else warnings.push(`${name} has no bio.`);

    if (jane) {
      doc.janeBookingUrl = `https://curatehealth.janeapp.com/#/staff_member/${jane}`;
    } else if (special) {
      Object.assign(doc, special);
    }

    console.log(`\n  ${name}`);
    console.log(`    id:          ${id}`);
    console.log(`    slug:        /about/our-team/${slug}`);
    console.log(
      `    credentials: ${credentials.length} -> ${JSON.stringify(credentials)}`
    );
    console.log(`    bio:         ${bioBlocks.length} block(s)`);
    console.log(
      `    photo:       ${doc.photo ? "linked, alt not set" : "MISSING"}`
    );
    console.log(
      `    booking:     ${
        doc.janeBookingUrl
          ? doc.janeBookingUrl
          : special
            ? `no Jane link, button "${special.bookingCtaLabel}"`
            : "none, no Jane profile"
      }`
    );

    if (!jane && !special) {
      warnings.push(
        `${name} has no Jane profile, so that page has no booking button.`
      );
    }

    mutations.push({ createIfNotExists: doc });
  }

  console.log(`\n${THIN}`);
  console.log("TEAM PAGE ORDER");
  console.log(THIN);

  const missing = TEAM_ORDER.filter((name) => !byName.has(name));
  if (missing.length) {
    console.error(
      `\nREFUSING: ordered names not found in Sanity: ${missing.join(", ")}`
    );
    process.exit(2);
  }

  const unordered = [...byName.keys()].filter(
    (name) => !TEAM_ORDER.includes(name)
  );
  if (unordered.length) {
    warnings.push(
      `Not in the ordered list, so absent from the team page: ${unordered.join(", ")}`
    );
  }

  const references = TEAM_ORDER.map((name) => ({
    _type: "reference",
    _key: byName.get(name).replace(/^practitioner-/, ""),
    _ref: byName.get(name),
  }));

  TEAM_ORDER.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  console.log(
    "\n  Written with setIfMissing, so a later drag-reorder is never clobbered."
  );

  mutations.push({
    patch: {
      id: team._id,
      setIfMissing: { practitioners: references },
    },
  });

  console.log(`\n${RULE}`);
  console.log("PROGRAMS");
  console.log(RULE);

  const table = hub.threePaths?.tableContent || {};

  for (const program of PROGRAMS) {
    const source = hub[program.key] || {};
    const id = `program-${program.slug}`;

    const doc = {
      _id: id,
      _type: "program",
      title: program.title,
      slug: { _type: "slug", current: program.slug },
      isActive: true,
    };

    const summary = plain(source.description);
    if (summary) doc.summary = summary;
    else
      warnings.push(`${program.title} has no description to use as a summary.`);

    const approach = plain(table.approach?.[program.columnIndex]);
    const focus = plain(table.focus?.[program.columnIndex]);
    const whoItIsFor = plain(table.bestFor?.[program.columnIndex]);

    if (approach) doc.approach = approach;
    if (focus) doc.focus = focus;
    if (whoItIsFor) doc.whoItIsFor = whoItIsFor;

    console.log(`\n  ${program.title}`);
    console.log(`    id:      ${id}`);
    console.log(`    slug:    /our-programs/${program.slug}`);
    console.log(`    summary: ${JSON.stringify((summary || "").slice(0, 90))}`);
    console.log(
      `    approach [col ${program.columnIndex}]: ${JSON.stringify(approach)}`
    );
    console.log(
      `    focus    [col ${program.columnIndex}]: ${JSON.stringify(focus)}`
    );
    console.log(
      `    whoFor   [col ${program.columnIndex}]: ${JSON.stringify(whoItIsFor)}`
    );
    console.log(`    body, faq, practitioners: left empty`);

    mutations.push({ createIfNotExists: doc });
  }

  // Migrated copy is existing approved copy, but it predates the content rules.
  const BANNED = [
    "journey",
    "dive in",
    "unlock",
    "elevate",
    "harness the power of",
    "complimentary",
    "transformative",
    "seamless",
  ];
  const copyFields = [];
  for (const m of mutations) {
    const d = m.createIfNotExists;
    if (!d) continue;
    for (const field of ["summary", "approach", "focus", "whoItIsFor"]) {
      if (typeof d[field] === "string")
        copyFields.push([d.title || d.name, field, d[field]]);
    }
  }
  for (const [owner, field, value] of copyFields) {
    for (const word of BANNED) {
      if (new RegExp(`\\b${word}`, "i").test(value)) {
        warnings.push(
          `${owner}.${field} carries the banned word "${word}", migrated as-is.`
        );
      }
    }
  }

  console.log(`\n${THIN}`);
  console.log("NEEDS FRANK");
  console.log(THIN);
  if (warnings.length) warnings.forEach((w) => console.log(`  - ${w}`));
  else console.log("  nothing");

  console.log(`\n${RULE}`);
  console.log(
    `${mutations.length} mutation(s): ${mutations.filter((m) => m.createIfNotExists).length} documents created, 1 patch`
  );

  if (!apply) {
    console.log("Dry run. Nothing written.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);

  const practitioners = await query(
    `*[_type == "practitioner"]{"slug": slug.current, name, "creds": count(credentials), "bio": count(fullBio), janeBookingUrl} | order(name asc)`
  );
  const programs = await query(
    `*[_type == "program"]{"slug": slug.current, title, summary} | order(title asc)`
  );
  const ordered = await query(
    `*[_id == $id][0]{"names": practitioners[]->name}`,
    { id: team._id }
  );

  console.log(`\nVerified in the dataset:`);
  console.log(`  practitioner documents: ${practitioners.length}`);
  for (const p of practitioners) {
    console.log(
      `    ${String(p.slug).padEnd(20)} creds=${p.creds} bioBlocks=${p.bio} ${p.janeBookingUrl ? "jane" : "no jane"}`
    );
  }
  console.log(`  program documents: ${programs.length}`);
  for (const p of programs) console.log(`    ${p.slug}`);
  console.log(`  team page order: ${JSON.stringify(ordered?.names)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
