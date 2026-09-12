/**
 * CH-025 survey and acceptance check: is there one address in the dataset, and
 * does the contact page still have everything it needs to render?
 *
 *   node scripts/audit-address-duplication.js
 *
 * Read-only. Exits 0 when both phases of scripts/dedupe-address.js have landed:
 * contactPage carries no copy of contactInfo, siteSettings carries both the
 * place link and a directions link with a daddr. Exits 1 otherwise, naming
 * which phase is outstanding.
 *
 * WHAT THIS FOUND, AND WHY THE TICKET CHANGED SHAPE
 *
 * contactPage.contactInfo looks like a straight duplicate of
 * siteSettings.contactInfo. Every address field matches byte for byte, as do
 * email and phone. One field does not:
 *
 *   siteSettings  maps.app.goo.gl/...      the Curate Health listing
 *   contactPage   ...?daddr=989+Eglinton   directions, starts navigation
 *
 * Two different links sharing one field name, not a duplicate. The directions
 * one is the URL rescued out of the retired second location in 2026-08-18 and
 * it is the only working Get Directions URL on the site, so deleting the
 * contactPage copy outright would have taken it with it. That is why the schema
 * now has mapLink and directionsLink as separate fields.
 *
 * None of that is visible in the schema. It is a question about stored values,
 * so it gets asked of the dataset.
 */

const { query } = require("./lib/sanity-cli");

const QUERY = `{
  "siteSettings": *[_type == "siteSettings"][0]{
    _id, _rev, brandName,
    contactInfo{email, phone, mapLink, directionsLink, address},
    "hasContactInfo2": defined(contactInfo2)
  },
  "contactPage": *[_type == "contactPage"][0]{
    _id, _rev, branchName,
    contactInfo{email, phone, mapLink, address},
    mapURL,
    "hasContactInfo2": defined(contactInfo2),
    "hasBranchName2": defined(branchName2),
    "hasMapURL2": defined(mapURL2),
    "hasBusinessHours2": defined(businessHours2)
  }
}`;

/** The fields that exist on both and therefore can disagree. */
const SHARED = ["email", "phone"];
const ADDRESS = ["street", "city", "state", "zip", "country", "locationInfo"];

const show = (v) =>
  v === undefined
    ? "(absent)"
    : v === null
      ? "(null)"
      : typeof v === "string"
        ? JSON.stringify(v.length > 72 ? v.slice(0, 69) + "..." : v)
        : JSON.stringify(v);

/** A Google Maps URL is only a directions link if it carries a daddr. */
const kindOfMapUrl = (url) => {
  if (!url) return "absent";
  if (url.includes("daddr=")) return "DIRECTIONS, carries a daddr";
  if (url.includes("/maps/embed")) return "embed frame, NOT directions";
  return "other";
};

async function main() {
  const data = await query(QUERY);
  const site = data.siteSettings;
  const page = data.contactPage;

  if (!site || !page) {
    console.error("Could not read both documents.");
    process.exitCode = 2;
    return;
  }

  console.log(`siteSettings ${site._id} rev ${site._rev}`);
  console.log(`contactPage  ${page._id} rev ${page._rev}\n`);

  const disagreements = [];
  const onlyOnPage = [];

  const compare = (label, a, b) => {
    const same = (a ?? null) === (b ?? null);
    console.log(
      `  ${label.padEnd(24)} site=${show(a).padEnd(40)} page=${show(b)}${same ? "" : "   <-- DIFFERS"}`
    );
    if (!same) {
      disagreements.push(label);
      // A value on the page that siteSettings does not have is not a conflict,
      // it is content that would be destroyed by the delete.
      if ((a ?? null) === null && (b ?? null) !== null) onlyOnPage.push(label);
    }
  };

  console.log("contactInfo:");
  for (const f of SHARED) {
    compare(f, site.contactInfo?.[f], page.contactInfo?.[f]);
  }

  console.log("\ncontactInfo.address:");
  for (const f of ADDRESS) {
    compare(
      `address.${f}`,
      site.contactInfo?.address?.[f],
      page.contactInfo?.address?.[f]
    );
  }

  console.log("\nmapLink, by kind:");
  console.log(`  siteSettings  ${kindOfMapUrl(site.contactInfo?.mapLink)}`);
  console.log(`  contactPage   ${kindOfMapUrl(page.contactInfo?.mapLink)}`);

  console.log("\nSecond-location leftovers, retired 2026-08-18:");
  for (const [label, present] of [
    ["siteSettings.contactInfo2", site.hasContactInfo2],
    ["contactPage.contactInfo2", page.hasContactInfo2],
    ["contactPage.branchName2", page.hasBranchName2],
    ["contactPage.mapURL2", page.hasMapURL2],
    ["contactPage.businessHours2", page.hasBusinessHours2],
  ]) {
    console.log(
      `  ${label.padEnd(30)} ${present ? "STILL PRESENT" : "absent"}`
    );
  }

  console.log("");

  // ---- the two phases of CH-025 ----
  const duplicateGone = !page.contactInfo;
  const hasPlaceLink = Boolean(site.contactInfo?.mapLink);
  const hasDirections = Boolean(site.contactInfo?.directionsLink);
  const directionsValid =
    hasDirections && site.contactInfo.directionsLink.includes("daddr=");

  const problems = [];

  if (!hasPlaceLink) {
    problems.push(
      "siteSettings.contactInfo.mapLink is empty, so the footer link and hasMap have nothing to point at"
    );
  }
  if (!hasDirections) {
    problems.push(
      'siteSettings.contactInfo.directionsLink is empty, so the Get Directions button renders href="" (phase 1 not applied)'
    );
  } else if (!directionsValid) {
    problems.push(
      "siteSettings.contactInfo.directionsLink carries no daddr, so it will not start navigation"
    );
  }
  if (!duplicateGone) {
    problems.push("contactPage.contactInfo still exists (phase 2 not applied)");
  }

  // Only meaningful while there are still two copies to compare. Once phase 2
  // has run, every field "differs" because the contactPage side is absent,
  // which is the goal rather than a fault. An earlier version of this check
  // reported the finished state as seven disagreements.
  if (!duplicateGone) {
    if (onlyOnPage.length) {
      problems.push(
        `${onlyOnPage.length} value(s) exist only on contactPage and would be destroyed by phase 2: ${onlyOnPage.join(", ")}`
      );
    }

    if (disagreements.length) {
      problems.push(
        `${disagreements.length} shared field(s) disagree, so the two copies are not interchangeable: ${disagreements.join(", ")}`
      );
    }
  }

  if (problems.length) {
    console.log("Not done:");
    problems.forEach((x) => console.log("  " + x));
    process.exitCode = 1;
    return;
  }

  console.log(
    "One address in the dataset. contactPage carries no copy, siteSettings " +
      "carries both links, and the directions one starts navigation."
  );
}

// process.exitCode rather than process.exit(): exiting while a fetch handle is
// still closing crashes libuv on Windows with an assertion, which buries the
// real exit code under a stack trace.
main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
