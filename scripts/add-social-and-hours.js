/**
 * CH-008: the social profiles and the Sunday hours.
 *
 *   node scripts/add-social-and-hours.js           # dry run, writes nothing
 *   node scripts/add-social-and-hours.js --apply
 *
 * Two unrelated-looking changes in one script because they are both "the data
 * CH-008 needs before the schema graph can be correct", and both come from the
 * same conversation with Frank on 2026-09-12.
 *
 * THE PROFILES
 *
 * LinkedIn and the clinic Instagram were already stored. TikTok, Facebook and
 * the cafe Instagram were not, so sameAs listed two profiles out of five.
 *
 * The TikTok URL loses its query string. Frank's copy carried
 * ?is_from_webapp=1&sender_device=pc, which describes the browser session it
 * was copied from, not the profile. A sameAs entry is an identity claim, so it
 * should be the canonical address and nothing else.
 *
 * The cafe Instagram is stored with entity "cafe". Every profile renders in the
 * same footer, but sameAs has to describe one entity: telling Google the cafe's
 * Instagram belongs to the clinic muddies both.
 *
 * THE HOURS
 *
 * Frank: Sunday is open 9am to 1pm, Saturday closed and not worth listing.
 *
 * The stored data disagreed. daysOpen held Monday to Friday only, and Sunday
 * existed as an exception with no hours at all, which rendered nothing. So the
 * contact page has been silently saying nothing about a day the clinic is open,
 * and that is a visible bug on the page, not only a schema one.
 *
 * Saturday stays absent, as asked. In schema.org that states nothing rather
 * than asserting closed, which is the weaker of the two but is what was asked
 * for and is not wrong.
 *
 * Patches carry ifRevisionID, so a concurrent Studio edit fails the mutation
 * rather than being overwritten. Re-runnable: it reports what is already in
 * place and only writes what is missing.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/** Verified to resolve 200 on 2026-09-12 before being written. */
const PROFILES = [
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@curatehealth.ca",
    entity: "clinic",
  },
  {
    platform: "Facebook",
    url: "https://www.facebook.com/people/Curate-Health/61558820134153/",
    entity: "clinic",
  },
  {
    platform: "Instagram (Cafe)",
    url: "https://www.instagram.com/curate.cafe/",
    entity: "cafe",
  },
];

const SUNDAY_HOURS = "9:00 AM - 1:00 PM";

const SURVEY = `{
  "site": *[_type == "siteSettings"][0]{
    _id, _rev,
    socialMedia[]{_key, platform, url, isActive, entity}
  },
  "page": *[_type == "contactPage"][0]{
    _id, _rev,
    businessHours{standardHours, customStandardHours, daysOpen, exceptions[]{_key, day, hours, message}}
  }
}`;

/** Sanity array items need a _key. Stable, readable, and unique per platform. */
const keyFor = (platform) =>
  "social-" + platform.toLowerCase().replace(/[^a-z0-9]+/g, "-");

async function main() {
  const data = await query(SURVEY);
  const site = data.site;
  const page = data.page;

  if (!site) throw new Error("No siteSettings document found.");
  if (!page) throw new Error("No contactPage document found.");

  console.log(`siteSettings ${site._id} rev ${site._rev}`);
  console.log(`contactPage  ${page._id} rev ${page._rev}\n`);

  const mutations = [];

  // ---- profiles ----
  const existing = site.socialMedia ?? [];
  const existingUrls = new Set(existing.map((s) => s.url));

  console.log("Social profiles already stored:");
  for (const s of existing) {
    console.log(
      `  ${String(s.platform).padEnd(18)} entity=${s.entity ?? "(unset, counts as clinic)"}  ${s.url}`
    );
  }

  const toAdd = PROFILES.filter((p) => !existingUrls.has(p.url));

  console.log("\nTo add:");
  if (!toAdd.length) {
    console.log("  (none, all three are already stored)");
  }
  for (const p of toAdd) {
    console.log(`  ${p.platform.padEnd(18)} entity=${p.entity}  ${p.url}`);
    mutations.push({
      patch: {
        id: site._id,
        // setIfMissing so the first insert works on a document that has never
        // had the array, rather than failing on an undefined path.
        setIfMissing: { socialMedia: [] },
        insert: {
          after: "socialMedia[-1]",
          items: [
            {
              _key: keyFor(p.platform),
              _type: "socialLink",
              platform: p.platform,
              url: p.url,
              isActive: true,
              entity: p.entity,
            },
          ],
        },
      },
    });
  }

  // Profiles stored before the entity field existed. Left unset they still
  // read as the clinic, so this is tidying rather than a fix, but an explicit
  // value is what makes the Studio show the right radio button.
  const needEntity = existing.filter((s) => !s.entity && s._key);
  for (const s of needEntity) {
    console.log(`  backfill entity=clinic on existing ${s.platform}`);
    mutations.push({
      patch: {
        id: site._id,
        set: { [`socialMedia[_key=="${s._key}"].entity`]: "clinic" },
      },
    });
  }

  // ---- hours ----
  const hours = page.businessHours ?? {};
  const daysOpen = (hours.daysOpen ?? []).map((d) => d.toLowerCase());
  const sundayException = (hours.exceptions ?? []).find(
    (e) => (e.day ?? "").toLowerCase() === "sunday"
  );

  console.log("\nHours as stored:");
  console.log(`  daysOpen        ${daysOpen.join(", ") || "(none)"}`);
  console.log(
    `  standard        ${hours.standardHours === "custom" ? hours.customStandardHours : hours.standardHours}`
  );
  console.log(
    `  sunday exception ${sundayException ? `hours=${sundayException.hours ?? "(none)"}` : "(absent)"}`
  );

  const hourFixes = [];

  if (!daysOpen.includes("sunday")) {
    hourFixes.push("add sunday to daysOpen");
    mutations.push({
      patch: {
        id: page._id,
        setIfMissing: { "businessHours.daysOpen": [] },
        insert: {
          after: "businessHours.daysOpen[-1]",
          items: ["sunday"],
        },
      },
    });
  }

  if (sundayException && sundayException.hours !== SUNDAY_HOURS) {
    hourFixes.push(`set the sunday exception hours to "${SUNDAY_HOURS}"`);
    mutations.push({
      patch: {
        id: page._id,
        set: {
          [`businessHours.exceptions[_key=="${sundayException._key}"].hours`]:
            SUNDAY_HOURS,
        },
      },
    });
  } else if (!sundayException) {
    hourFixes.push(`add a sunday exception of "${SUNDAY_HOURS}"`);
    mutations.push({
      patch: {
        id: page._id,
        setIfMissing: { "businessHours.exceptions": [] },
        insert: {
          after: "businessHours.exceptions[-1]",
          items: [
            { _key: "exception-sunday", day: "sunday", hours: SUNDAY_HOURS },
          ],
        },
      },
    });
  }

  console.log("\nHour changes:");
  if (!hourFixes.length) console.log("  (none, already correct)");
  hourFixes.forEach((f) => console.log("  " + f));

  if (!mutations.length) {
    console.log("\nNothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`\nDry run. ${mutations.length} mutation(s) would be sent.`);
    console.log("Re-run with --apply to write.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
