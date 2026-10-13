/**
 * CH-030: put Claire Kim on the team page and switch her on.
 *
 *   node scripts/switch-claire-on.js            # dry run
 *   node scripts/switch-claire-on.js --apply
 *
 * Her practitioner record has been complete and switched off since 2026-10-13:
 * bio, booking link, languages, class focus, SEO and a photograph. The last
 * missing piece was the `ourTeam.teamMembers` entry, because the hub reads that
 * array rather than the practitioner records and matches on name.
 *
 * **The two names have to agree exactly**, "Claire Kim" in both, or the team
 * page and the Curate Lifestyle page drop her and `audit-practitioners.js`
 * fails. That is the whole reason this is one script rather than two edits.
 *
 * SHE GOES LAST, AFTER ROOJ
 *
 * Order on the hub is the array order, and it runs the regulated clinicians
 * first, then Rooj as the yoga teacher. Claire as the Pilates instructor sits
 * naturally beside her. Masonry lays the cards out column first, so check the
 * result by position on the page rather than by reading the HTML top to bottom.
 *
 * THE ARRAY IS WRITTEN WHOLE
 *
 * Per the CH-028 note: an indexed patch into an array that is also being
 * rewritten in the same transaction is silently lost. There is only one write
 * here, but the habit is the point.
 *
 * NO SEARCH CONSOLE STEP FOR HER
 *
 * The warning on the "Show on website" switch is about somebody who was taken
 * off the site and removed from Google by hand, which is Safa. Claire's page has
 * never been live, so there is no removal request to cancel. It does need
 * telling to the search engines, which the Sanity webhook does for Bing on
 * publish; Google finds it from the sitemap.
 */

const crypto = require("crypto");
const { query, mutate } = require("./lib/sanity-cli");

const key = () => crypto.randomBytes(6).toString("hex");

const NAME = "Claire Kim";
const ROLE = "Pilates Instructor";

/** The role is rich text on this type, one em-marked bullet, as the other seven are. */
const roleBlock = () => [
  {
    _key: key(),
    _type: "block",
    style: "normal",
    level: 1,
    listItem: "bullet",
    markDefs: [],
    children: [{ _key: key(), _type: "span", marks: ["em"], text: ROLE }],
  },
];

async function main() {
  const apply = process.argv.includes("--apply");

  const [p] = await query(
    `*[_type == "practitioner" && name == $name]{
      _id, _rev, name, isActive, credentials,
      "photoRef": photo.asset._ref,
      "photoFile": photo.asset->originalFilename,
      fullBio
    }`,
    { name: NAME }
  );
  if (!p) throw new Error(`no practitioner record named ${NAME}`);
  if (!p.photoRef)
    throw new Error("no photograph on the record, the hub needs one");
  if (!p.fullBio || !p.fullBio.length) throw new Error("no bio on the record");

  const [team] = await query(`*[_type == "ourTeam"]{_id, _rev, teamMembers}`);
  if (!team) throw new Error("no ourTeam document");

  const names = (team.teamMembers || []).map((m) => m.name);
  const already = names.includes(NAME);

  console.log(`Practitioner record`);
  console.log(`  name:        ${p.name}`);
  console.log(`  credentials: ${JSON.stringify(p.credentials)}`);
  console.log(`  photograph:  ${p.photoFile}`);
  console.log(`  bio:         ${p.fullBio.length} blocks`);
  console.log(`  isActive:    ${p.isActive} -> true`);

  console.log(`\nOur Team, ${names.length} members`);
  console.log(`  ${names.join(", ")}`);
  console.log(
    already
      ? `  ${NAME} is already listed, leaving the array alone`
      : `  appending ${NAME} as "${ROLE}", last, beside Rooj`
  );

  // The bio on the card is the same copy as the practitioner page, with fresh
  // keys so the two arrays never share a _key.
  const reKey = (blocks) =>
    blocks.map((b) => ({
      ...b,
      _key: key(),
      children: (b.children || []).map((c) => ({ ...c, _key: key() })),
    }));

  const member = {
    _key: key(),
    _type: "teamMember",
    name: NAME,
    role: roleBlock(),
    bio: reKey(p.fullBio),
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: p.photoRef },
    },
  };

  console.log(`\nWhat this turns on for her`);
  for (const line of [
    "the team page card and its Learn More link",
    "/about/our-team/claire-kim, which is a 404 today",
    "the Outdoor Pilates page, where she is already listed as a provider",
    "the sitemap and llms.txt, within the hour",
    "site search",
  ]) {
    console.log(`  ${line}`);
  }

  if (!apply) {
    console.log("\nDry run. Nothing written.");
    return;
  }

  const mutations = [
    {
      patch: {
        id: p._id,
        ifRevisionID: p._rev,
        set: { isActive: true },
      },
    },
  ];
  if (!already) {
    mutations.push({
      patch: {
        id: team._id,
        ifRevisionID: team._rev,
        set: { teamMembers: (team.teamMembers || []).concat([member]) },
      },
    });
  }

  const r = await mutate(mutations);
  console.log(
    `\nApplied ${mutations.length}. Transaction ${r.transactionId || "(none)"}`
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
