/**
 * Tai Chi's new Jane class and second weekly session, and the share card
 * copy Frank approved. 2026-10-31.
 *
 *   node scripts/apply-tai-chi-and-share-copy.js
 *   node scripts/apply-tai-chi-and-share-copy.js --apply
 *
 * TAI CHI
 *
 * Frank rebuilt the Recovery Sanctuary in Jane. Read in a browser on
 * 2026-10-31 with every "Show more Sessions" opened, the section now holds:
 *
 *   42   Flowpresso
 *   80   Yoga Class with Rooj              115  Private Yoga Session
 *   78   Mat Pilates Class with Claire     118  Private Pilates Session
 *   119  Tai Chi Class with Dr. Gabriele   113  Private Tai Chi Session
 *   81, 120, 121, 122  Cold Plunge & Sauna, individual and groups of 2 to 4
 *
 * **Every treatment page already pointed at a live entry except Tai Chi**,
 * whose link was treatment 112. 112 no longer exists: opened on 2026-10-31 it
 * bounces to Jane's front page, so the Book button on the Tai Chi page and on
 * /classes was going nowhere. The class is 119.
 *
 * **The class-level override is removed rather than repointed.** Yoga and
 * Pilates on /classes already fall back to their treatment page's link; Tai
 * Chi carried its own only because it had no treatment page when CH-107 was
 * built. With one, keeping a second copy is how the two came to disagree, so
 * the link now lives in one place.
 *
 * **It meets twice a week.** Jane's own booking labels, the aria-label on each
 * opening, read "9:00 AM EST on Sunday November 1" and "12:00 PM EST on
 * Friday November 6". Sunday stays the main session and Friday goes in "Also
 * runs on".
 *
 * THE SHARE CARDS, FRANK'S WORDS
 *
 * Applied exactly as he wrote them on 2026-10-31. Two of the proposals he
 * declined are simply absent: the homepage description and the Our Story
 * description stay as they were.
 *
 * **The cafe card is not here, deliberately.** His line reads "Local, seasonal
 * ingredients without refined sugars, no industrial seed oils, and plastic
 * takeout containers", which can be read as saying the cafe USES plastic
 * takeout containers, and the page never mentions takeout containers at all;
 * what it says is that plastic is kept out of preparation and storage
 * "wherever there is a workable alternative". Held for his word.
 *
 * Every change states the value it expects and the run is refused whole if
 * one no longer matches, so a Studio edit since cannot be overwritten.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

const TAI_CHI_CLASS =
  "https://curatehealth.janeapp.com/#/discipline/22/treatment/119";

/** Simple field replacements on whole documents. */
const FIELDS = [
  {
    label: "Tai Chi page Book button",
    id: "treatment-tai-chi",
    path: "janeBookingUrl",
    from: "https://curatehealth.janeapp.com/#/discipline/22/treatment/112",
    to: TAI_CHI_CLASS,
  },
  {
    label: "Homepage title, search and share",
    id: "94349ad8-f99c-45f9-8cfd-e1a7f48a63c4",
    path: "homePageTitle",
    from: "Curate Health | Health Curated For You",
    to: "Health, Curated for You | Curate Health",
    copy: true,
  },
  {
    label: "/products share title",
    id: "productsPage",
    path: "seo.socialMeta.title",
    from: "Fitted by a Practitioner, custom and curated just for you.",
    to: "Fitted by a Practitioner, Custom and Curated Just For You.",
    copy: true,
  },
  {
    label: "/about/mission-and-values share description",
    id: "7db7d7c6-4c8e-4e7f-81a6-48d077504e90",
    path: "seo.socialMeta.description",
    from: "Discover the mission behind Curate Health. We provide evidence-based interdisciplinary care, and sustainable wellness services in Midtown Toronto.",
    to: "Evidence-based, interdisciplinary care. The thinking behind how Curate Health works.",
    copy: true,
  },
  {
    label: "/classes share description",
    id: "classSchedule",
    path: "seo.socialMeta.description",
    from: "Yoga, Pilates and Tai Chi, outdoors in Midtown Toronto. Small groups, one place at a time, no term to commit to.",
    to: "Yoga, Pilates and Tai Chi outdoors in Midtown Toronto. Small groups with no term to commit to.",
    copy: true,
  },
];

/** Read a dotted path off a document. */
function at(doc, path) {
  return path.split(".").reduce((v, k) => (v == null ? v : v[k]), doc);
}

(async () => {
  const problems = [];
  const patches = new Map();
  const patchFor = (id, rev) => {
    if (!patches.has(id)) patches.set(id, { id, ifRevisionID: rev, set: {}, unset: [] });
    return patches.get(id);
  };

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

    const doc = await query(`*[_id == $id][0]`, { id: field.id });
    if (!doc) {
      problems.push(`${field.label}: no document ${field.id}`);
      continue;
    }

    const current = at(doc, field.path);
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
    patchFor(doc._id, doc._rev).set[field.path] = field.to;
  }

  /* The Tai Chi entry on the schedule: drop the override, add Friday. */
  const schedule = await query(
    `*[_type == "classSchedule"][0]{
      _id, _rev,
      classes[]{ _key, "name": coalesce(treatment->title, name), bookingUrl, moreSessions }
    }`
  );
  const tai = (schedule?.classes ?? []).filter((c) => /tai chi/i.test(c.name || ""));

  if (tai.length !== 1) {
    problems.push(`Tai Chi matches ${tai.length} classes on the schedule, expected exactly 1`);
  } else {
    const entry = tai[0];
    const where = `classes[_key=="${entry._key}"]`;
    const patch = patchFor(schedule._id, schedule._rev);

    if (entry.bookingUrl) {
      console.log("  /classes Tai Chi Book button");
      console.log(`    was  ${JSON.stringify(entry.bookingUrl)}`);
      console.log("    now  (the Tai Chi page's own link, the class at 119)");
      console.log();
      patch.unset.push(`${where}.bookingUrl`);
    } else {
      console.log("  /classes Tai Chi Book button  already falls back to the page's link");
    }

    const hasFriday = (entry.moreSessions ?? []).some(
      (s) => s.dayOfWeek === "Friday" && s.startTime === "12:00"
    );
    if (hasFriday) {
      console.log("  Tai Chi Friday session  already there");
    } else {
      console.log("  Tai Chi second session");
      console.log("    adds Friday, 12:00, beside Sunday, 09:00");
      console.log();
      patch.set[`${where}.moreSessions`] = [
        { _key: "friday-noon", _type: "session", dayOfWeek: "Friday", startTime: "12:00" },
      ];
    }
  }

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  const mutations = [...patches.values()]
    .filter((p) => Object.keys(p.set).length || p.unset.length)
    .map((p) => ({
      patch: {
        id: p.id,
        ifRevisionID: p.ifRevisionID,
        ...(Object.keys(p.set).length ? { set: p.set } : {}),
        ...(p.unset.length ? { unset: p.unset } : {}),
      },
    }));

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
