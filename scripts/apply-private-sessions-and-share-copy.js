/**
 * Private session buttons, and the rest of the share card sweep. Frank,
 * 2026-11-01.
 *
 *   node scripts/apply-private-sessions-and-share-copy.js
 *   node scripts/apply-private-sessions-and-share-copy.js --apply
 *
 * PRIVATE SESSIONS
 *
 * Frank asked for a second button on the Yoga, Pilates and Tai Chi pages for
 * one-on-one bookings. Each address was opened in Jane on 2026-11-01 and read
 * back as the session it should be, rather than typed from an id:
 *
 *   115  Private Yoga Session with Rooj, 50 minutes, $95
 *   118  Private Pilates Session with Claire, 50 minutes, $175
 *   113  Private Tai Chi Session with Dr. Dave Gabriele, 50 minutes
 *
 * The field is new, `privateSessionUrl`, and the button only renders once the
 * code that reads it is deployed. Until then the Studio shows "Unknown field"
 * on these three treatments. **Do not press Remove field**: it deletes the
 * link. It clears itself on the deploy.
 *
 * THE SHARE CARDS
 *
 * "All other suggestions you made earlier which I've never commented on are
 * acceptable." So every proposal he did not answer goes in as proposed, plus
 * the cafe line he wrote, with one exception and one small fix.
 *
 * **The exception is the Curate Lifestyle Program, and it is my own error.**
 * The description I proposed read "A physician-led program for reversing the
 * drivers of chronic disease". That is an outcome claim about a medical
 * program, and the content rules require the practitioner's sign-off for one,
 * which a blanket approval of copy is not. It goes in without the claim, as
 * a statement of what the program is and who runs it. Dr. Leong can widen it.
 * It is written to the search description as well as the share one, since
 * both held the same 24 character placeholder and the house shape is that
 * the two match.
 *
 * **The small fix is an article.** Frank wrote "and microplastic-conscious
 * kitchen"; it reads "and a microplastic-conscious kitchen" here. Nothing
 * else in his line is changed.
 *
 * Every change states the value it expects and the run is refused whole if
 * one no longer matches, so a Studio edit since cannot be overwritten.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

const JANE = "https://curatehealth.janeapp.com/#/discipline/22/treatment";

const FIELDS = [
  /* Private session buttons. */
  {
    label: "Outdoor Yoga private session",
    id: "a9160435-fd57-4822-a51e-33a34a3ae813",
    path: "privateSessionUrl",
    from: null,
    to: `${JANE}/115`,
  },
  {
    label: "Outdoor Pilates private session",
    id: "f665b175-6b04-4335-9252-eb32a67f575b",
    path: "privateSessionUrl",
    from: null,
    to: `${JANE}/118`,
  },
  {
    label: "Tai Chi private session",
    id: "treatment-tai-chi",
    path: "privateSessionUrl",
    from: null,
    to: `${JANE}/113`,
  },

  /* The share cards. */
  {
    label: "Chiropractic share title",
    id: "3b50bddd-ebf2-468e-bdca-9a8bd3de58a7",
    path: "seo.socialMeta.title",
    from: "Chiropractic That Looks Past the Sore Spot",
    to: "Chiropractic That Treats More Than the Sore Spot",
    copy: true,
  },
  {
    label: "Curate Lifestyle Program share description",
    id: "e3d64833-60b1-4f54-bbdb-bda7ce9106fb",
    path: "seo.socialMeta.description",
    from: "Curate Lifestyle Program",
    to: "A physician-led lifestyle medicine program with Dr. Eric Leong at Curate Health in Midtown Toronto.",
    copy: true,
  },
  {
    label: "Curate Lifestyle Program search description",
    id: "e3d64833-60b1-4f54-bbdb-bda7ce9106fb",
    path: "seo.pageDescription",
    from: "Curate Lifestyle Program",
    to: "A physician-led lifestyle medicine program with Dr. Eric Leong at Curate Health in Midtown Toronto.",
    copy: true,
  },
  {
    label: "/about share title",
    id: "aboutIndexPage",
    path: "seo.socialMeta.title",
    from: "A Curated Health and Wellness Destination in Midtown Toronto",
    to: "A Health and Wellness Destination in Midtown Toronto",
    copy: true,
  },
  {
    label: "Fitness Training share title",
    id: "fbaa0e8a-8c01-485a-b18b-6cb1a35f956e",
    path: "seo.socialMeta.title",
    from: "Training With a Clinician as your coach",
    to: "Training With a Clinician as Your Coach",
    copy: true,
  },
  {
    label: "Tai Chi share title",
    id: "treatment-tai-chi",
    path: "seo.socialMeta.title",
    from: "Tai Chi",
    to: "Tai Chi, Taught Slowly and Properly",
    copy: true,
  },
  {
    label: "Outdoor Yoga share title",
    id: "a9160435-fd57-4822-a51e-33a34a3ae813",
    path: "seo.socialMeta.title",
    from: "Yoga Outdoors",
    to: "Yoga Therapy in the Open Air",
    copy: true,
  },
  {
    label: "Mission and Values share title",
    id: "7db7d7c6-4c8e-4e7f-81a6-48d077504e90",
    path: "seo.socialMeta.title",
    from: "Mission and Values",
    to: "What We Will Not Compromise On",
    copy: true,
  },
  {
    label: "/classes share title",
    id: "classSchedule",
    path: "seo.socialMeta.title",
    from: "Weekly Classes in the Recovery Sanctuary",
    to: "Classes in the Recovery Sanctuary",
    copy: true,
  },
  {
    label: "/cafe share description",
    id: "8a5abd5e-c23c-4023-b8b2-a23574871ab5",
    path: "seo.socialMeta.description",
    from: "Local, seasonal ingredients when possible. No refined sugars or seed oils. Microplastic-conscious.",
    to: "Local, seasonal ingredients, with no refined sugars or industrial seed oils, and a microplastic-conscious kitchen.",
    copy: true,
  },
];

function at(doc, path) {
  return path.split(".").reduce((v, k) => (v == null ? v : v[k]), doc);
}

(async () => {
  const problems = [];
  const patches = new Map();
  const docs = new Map();

  console.log();

  for (const field of FIELDS) {
    if (field.copy) {
      if (/[—–]/.test(field.to)) problems.push(`${field.label} carries a dash`);
      if (/!/.test(field.to)) problems.push(`${field.label} carries an exclamation mark`);
      if (/\p{Cf}/u.test(field.to)) problems.push(`${field.label} carries invisible characters`);
      const banned = findBanned(field.to);
      if (banned.length) problems.push(`${field.label} uses ${JSON.stringify(banned)}`);
      const american = findAmerican(field.to);
      if (american.length) problems.push(`${field.label} spells ${JSON.stringify(american)}`);
    }

    if (!docs.has(field.id)) {
      docs.set(field.id, await query(`*[_id == $id][0]`, { id: field.id }));
    }
    const doc = docs.get(field.id);
    if (!doc) {
      problems.push(`${field.label}: no document ${field.id}`);
      continue;
    }

    const current = at(doc, field.path) ?? null;
    if (current === field.to) {
      console.log(`  ${field.label}  already reads the new value`);
      continue;
    }
    if (current !== field.from) {
      problems.push(
        `${field.label} reads ${JSON.stringify(current)}, expected ${JSON.stringify(field.from)}`
      );
      continue;
    }

    console.log(`  ${field.label}`);
    console.log(`    was  ${JSON.stringify(field.from)}`);
    console.log(`    now  ${JSON.stringify(field.to)}`);
    console.log();

    if (!patches.has(doc._id)) {
      patches.set(doc._id, { id: doc._id, ifRevisionID: doc._rev, set: {} });
    }
    patches.get(doc._id).set[field.path] = field.to;
  }

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  const mutations = [...patches.values()].map((p) => ({ patch: p }));
  if (!mutations.length) {
    console.log("  Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`  Dry run. ${mutations.length} documents would change. Re-run with --apply.`);
    return;
  }

  const result = await mutate(mutations);
  console.log(`  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
