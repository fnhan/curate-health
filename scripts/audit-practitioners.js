/**
 * Acceptance check for CH-104.
 *
 *   node scripts/audit-practitioners.js http://localhost:3000
 *   node scripts/audit-practitioners.js https://www.curatehealth.ca
 *
 * The defect this ticket existed to fix was invisible from the source: the
 * bios were in the markup all along, inside accordions carrying
 * data-state="closed", which left 203 visible words for seven people. So every
 * check here reads the rendered page.
 *
 *   1 Every active practitioner in Sanity has a page that returns 200.
 *   2 The team page links to all of them.
 *   3 Each page carries one h1, a Person node, and the credentials from the
 *     record.
 *   4 Each page carries real visible text, not a heading over a collapsed
 *     bio. The floor is deliberately low: it is catching a page that renders
 *     nothing, not judging how long a bio should be.
 *   5 The booking block matches the record. A Jane URL means a booking
 *     button; no Jane URL and no note and no CTA means no block at all,
 *     rather than a button pointing somewhere generic.
 *   6 An unknown slug is a 404, never a 500. CH-001.
 *   7 Every member listed under Our Team has a practitioner record with the
 *     same name. The team page hides people by matching that name, so a
 *     mismatch would leave "Show on website" switched off to no effect.
 *   8 Anyone with "Show on website" switched off is really gone: the team
 *     page neither links to nor names them, their own page is a 404, the
 *     sitemap does not list it, and site search finds nothing for their name.
 *
 * Exits 1 on any failure.
 */

const { assertChecked } = require("./lib/assert-checked");
const { query } = require("./lib/sanity-cli");

const target = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

/** Low on purpose. A rendered bio is hundreds of words; a broken page is tens. */
const MIN_WORDS = 120;

async function get(path) {
  const res = await fetch(`${target}${path}`, {
    headers: { "user-agent": "curate-practitioners/1.0" },
  });
  return { status: res.status, html: res.ok ? await res.text() : "" };
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleWords(html) {
  return visibleText(html).split(" ").length;
}

function personNode(html) {
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = Array.isArray(data) ? data : [data];
      const person = nodes.find((n) => n && n["@type"] === "Person");
      if (person) return person;
    } catch {
      /* a malformed block is a finding for the schema audit, not this one */
    }
  }
  return null;
}

async function main() {
  const records = await query(
    `*[_type == "practitioner" && defined(slug.current)]
      | order(name asc){
        name,
        "slug": slug.current,
        isActive,
        credentials,
        janeBookingUrl,
        bookingNote,
        bookingCtaLabel,
        "photoWidth": photo.asset->metadata.dimensions.width,
        "photoHeight": photo.asset->metadata.dimensions.height
      }`
  );
  const people = records.filter((p) => p.isActive === true);
  const hidden = records.filter((p) => p.isActive === false);
  const teamNames =
    (await query(
      `*[_type == "ourTeam" && pageActive == true][0].teamMembers[].name`
    )) || [];

  assertChecked({
    label: "active practitioners in Sanity",
    count: people.length,
    atLeast: 5,
    hint: "With none, every check below passes by looking at nothing.",
  });

  const failures = [];

  const team = await get("/about/our-team");
  if (team.status !== 200) {
    failures.push(`/about/our-team returned ${team.status}`);
  }

  const linked = new Set(
    [...team.html.matchAll(/href="\/about\/our-team\/([a-z0-9-]+)"/g)].map(
      (m) => m[1]
    )
  );

  let totalWords = 0;

  for (const person of people) {
    const path = `/about/our-team/${person.slug}`;
    const { status, html } = await get(path);

    if (status !== 200) {
      failures.push(`${path}: HTTP ${status}`);
      continue;
    }

    if (!linked.has(person.slug)) {
      failures.push(`${path}: the team page does not link to it`);
    }

    const h1s = (html.match(/<h1/g) || []).length;
    if (h1s !== 1) failures.push(`${path}: ${h1s} h1 elements, expected 1`);

    const words = visibleWords(html);
    totalWords += words;
    if (words < MIN_WORDS) {
      failures.push(`${path}: only ${words} visible words`);
    }

    const person_ld = personNode(html);
    if (!person_ld) {
      failures.push(`${path}: no Person node in the markup`);
    } else {
      if (person_ld.name !== person.name) {
        failures.push(
          `${path}: markup names "${person_ld.name}", record says "${person.name}"`
        );
      }
      const marked = (person_ld.hasCredential || []).length;
      const stored = (person.credentials || []).length;
      if (marked !== stored) {
        failures.push(
          `${path}: ${marked} credentials in markup, ${stored} on the record`
        );
      }
    }

    /* The booking block has to agree with the record, in all three states. */
    /*
     * React splits an interpolated name into its own text node and separates
     * it with an HTML comment, so the rendered markup reads
     * `Book with <!-- -->Dr. Frank Nhan`. A plain includes() of the sentence
     * finds nothing and reports five working buttons as missing, which is
     * what the first run of this check did.
     */
    const flattened = html.replace(/<!--[\s\S]*?-->/g, "");
    /*
     * The button reads "Book with Ariel", not "Book with Ariel Zohar". The
     * mockup uses the first name, and the honorific is dropped with it, so
     * Dr. Frank Nhan's button says "Book with Frank".
     */
    const given = person.name.replace(/^Dr\.?\s+/i, "").split(/\s+/)[0];
    const hasBookButton = flattened.includes(`Book with ${given}`);
    const hasCtaLabel = person.bookingCtaLabel
      ? flattened.includes(person.bookingCtaLabel)
      : false;

    if (person.janeBookingUrl) {
      if (!hasBookButton) failures.push(`${path}: Jane URL set but no booking button`);
      if (!html.includes(person.janeBookingUrl)) {
        failures.push(`${path}: booking button does not carry the Jane URL`);
      }
    } else if (person.bookingNote || person.bookingCtaLabel) {
      if (hasBookButton) {
        failures.push(`${path}: shows a booking button with no Jane URL`);
      }
      if (person.bookingCtaLabel && !hasCtaLabel) {
        failures.push(`${path}: CTA label "${person.bookingCtaLabel}" is missing`);
      }
    } else if (hasBookButton) {
      failures.push(`${path}: shows a booking button with nothing to back it`);
    }
  }

  /*
   * Every photo is cropped to one 4:5 frame at 800x1000. A source smaller
   * than that in either dimension is upscaled, and upscaling a face is
   * visible. This is a photograph to replace rather than a value to lower,
   * so it is a warning with a name on it rather than a silent pass.
   */
  const soft = people.filter(
    (p) =>
      p.photoWidth &&
      p.photoHeight &&
      (p.photoWidth < 800 || p.photoHeight < 1000)
  );

  const unknown = await get("/about/our-team/definitely-nobody");
  if (unknown.status !== 404) {
    failures.push(`an unknown slug returned ${unknown.status}, expected 404`);
  }

  /*
   * The team page reads the Our Team list, not the practitioner records, and
   * leaves out anyone whose record is switched off by matching the name. A
   * member with no record of the same name can never be hidden, and nothing
   * on the page would show it.
   */
  const recordNames = new Set(records.map((p) => p.name));
  for (const name of teamNames) {
    if (!recordNames.has(name)) {
      failures.push(
        `Our Team lists "${name}", but no practitioner record has that exact name, so "Show on website" cannot hide them`
      );
    }
  }

  if (hidden.length) {
    const sitemap = await get("/sitemap.xml");
    const teamText = visibleText(team.html);
    for (const person of hidden) {
      const path = `/about/our-team/${person.slug}`;
      if (linked.has(person.slug)) {
        failures.push(`${path}: switched off, but the team page still links to it`);
      }
      if (teamText.includes(person.name)) {
        failures.push(`${person.name}: switched off, but still named on the team page`);
      }
      const page = await get(path);
      if (page.status !== 404) {
        failures.push(`${path}: switched off, but returned ${page.status} rather than 404`);
      }
      if (sitemap.html.includes(path)) {
        failures.push(`${path}: switched off, but still listed in the sitemap`);
      }
      const search = await get(`/api/search?q=${encodeURIComponent(person.name)}`);
      let found = 0;
      try {
        found = (JSON.parse(search.html).results || []).length;
      } catch {
        failures.push(`/api/search for ${person.name} did not return JSON`);
      }
      if (found) {
        failures.push(
          `${person.name}: switched off, but site search still finds ${found} result${found === 1 ? "" : "s"} for the name`
        );
      }
    }
  }

  console.log(
    `${people.length} active practitioners, ${linked.size} linked from the team page` +
      (hidden.length
        ? `, ${hidden.length} switched off: ${hidden.map((p) => p.name).join(", ")}.`
        : ".")
  );
  console.log(
    `${totalWords} visible words across the practitioner pages, against 203 ` +
      `on the single team page before this ticket.\n`
  );

  if (failures.length) {
    console.error(`${failures.length} failures:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }

  console.log("Every practitioner has a page, and every page agrees with its record.");
  if (hidden.length) {
    console.log("Everyone switched off is gone from the team page, their own page, the sitemap and site search.");
  }

  if (soft.length) {
    console.log(
      `
${soft.length} photograph${soft.length === 1 ? "" : "s"} below the ` +
        `800x1000 the crop needs, so ${soft.length === 1 ? "it is" : "they are"} ` +
        `upscaled and will look soft:`
    );
    for (const p of soft) {
      console.log(`  ${p.name}: ${p.photoWidth}x${p.photoHeight}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
