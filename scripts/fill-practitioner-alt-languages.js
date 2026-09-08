/**
 * Fills photo alt text and languages on the practitioner documents.
 *
 *   node scripts/fill-practitioner-alt-languages.js            dry run
 *   node scripts/fill-practitioner-alt-languages.js --apply    writes
 *
 * Frank asked for both on 2026-09-08. Alt text for search and AI results, and
 * languages pre-filled with what he knows, to be confirmed with each
 * practitioner later.
 *
 * ALT TEXT WAS WRITTEN FROM THE PHOTOS, NOT FROM THE BIOS
 *
 * Each image was downloaded and looked at before its description was written.
 * Describing a photo from someone's job title produces text that reads fine
 * and is wrong, which is worse than no alt text: a screen reader user is told
 * something untrue and cannot tell.
 *
 * Written to the house rule in sanity/schema-helpers.ts: 25 to 125 characters,
 * neutral, no subjective language, no repetition of nearby text, ends with a
 * full stop. Each names the practitioner, which is the part that carries
 * weight for image search and for an AI summarising the page.
 *
 * LANGUAGES ARE CLAIMS ABOUT PEOPLE
 *
 * These came from Frank, not from any document, and he said he will confirm
 * them with each practitioner. English is on everyone. Nothing here was
 * inferred from a surname or a photo.
 *
 * "Vietnamese" is written where Frank wrote "Vietnam". The country is not the
 * language, and this list renders on a public clinical page.
 *
 * Rooj has English and Urdu only, not the fuller list Frank gestured at. See
 * the note on her entry.
 *
 * Frank corrected the description of his own photo on 2026-09-08: it is him
 * coaching the cat cow exercise, not performing an adjustment. Worth keeping
 * in mind that a photo can be read wrongly with complete confidence.
 *
 * Patches use `set`, so re-running restores these values if someone clears
 * them, and a deliberate later edit by Frank will be overwritten. That is the
 * intended trade for a field he asked to be pre-filled. Once practitioners
 * confirm their own languages, retire this script rather than re-running it.
 */

const { mutate, query } = require("./lib/sanity-cli");

const PRACTITIONERS = {
  "practitioner-dr-frank-nhan": {
    alt: "Dr. Frank Nhan guiding a patient through the cat cow exercise in the clinic.",
    languages: ["English", "Cantonese", "Vietnamese"],
  },
  "practitioner-safa-karoumi": {
    alt: "Black and white portrait of Safa Karoumi outdoors beneath a leafy tree.",
    languages: ["English", "French", "Spanish", "Darija"],
  },
  "practitioner-dr-david-gabriele": {
    alt: "Dr. David Gabriele in scrubs speaking with a patient at his desk beside a monitor.",
    languages: ["English"],
  },
  "practitioner-dr-eric-leong": {
    alt: "Dr. Eric Leong standing beside a window in a dark shirt with his hands clasped.",
    languages: ["English", "Cantonese"],
  },
  "practitioner-andrew-huynh": {
    alt: "Andrew Huynh applying forearm pressure to a client's back during a massage therapy session.",
    languages: ["English"],
  },
  "practitioner-ariel-zohar": {
    alt: "Headshot of Ariel Zohar smiling in a black shirt against a plain background.",
    languages: ["English", "Hebrew"],
  },
  "practitioner-rooj-hussain": {
    alt: "Rooj Hussain balancing in an arm balance yoga pose on a mat beside a potted palm.",
    // Urdu only. Frank asked for "the typical Pakistani languages", which is a
    // guess at one person's background rather than something she has said.
    // Urdu is the national language and the safe part of that; Punjabi, Pashto,
    // Sindhi and Saraiki are not interchangeable and are not implied by
    // nationality. A patient books expecting to be understood, so the rest
    // waits for her own answer.
    languages: ["English", "Urdu"],
  },
};

/** From the content rules in CLAUDE.md. Alt text is site copy. */
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

const RULE = "=".repeat(78);

function checkAlt(id, alt) {
  const problems = [];

  if (alt.length < 25 || alt.length > 125) {
    problems.push(`length ${alt.length}, wanted 25 to 125`);
  }
  if (!/\.$/.test(alt)) problems.push("does not end with a full stop");
  if (/[—–]/.test(alt)) problems.push("contains a dash used as punctuation");
  if (/!/.test(alt)) problems.push("contains an exclamation mark");
  if (!/^[\x20-\x7E’]+$/.test(alt))
    problems.push("contains an unexpected character");

  for (const word of BANNED) {
    if (new RegExp(`\\b${word}`, "i").test(alt))
      problems.push(`banned word "${word}"`);
  }

  return problems;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const ids = Object.keys(PRACTITIONERS);
  const docs = await query(
    `*[_id in $ids]{_id, _rev, name, "alt": photo.alt, languages, "hasPhoto": defined(photo.asset)}`,
    { ids }
  );
  const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

  const missing = ids.filter((id) => !byId[id]);
  if (missing.length) {
    console.error(`Missing practitioner documents: ${missing.join(", ")}`);
    process.exit(2);
  }

  const mutations = [];
  let problems = 0;

  console.log(RULE);
  console.log("Practitioner photo alt text and languages");
  console.log(RULE);

  for (const id of ids) {
    const doc = byId[id];
    const { alt, languages } = PRACTITIONERS[id];

    const faults = checkAlt(id, alt);
    problems += faults.length;

    console.log(`\n  ${doc.name}`);
    console.log(`    alt (${alt.length} chars): ${JSON.stringify(alt)}`);
    if (doc.alt) console.log(`    was: ${JSON.stringify(doc.alt)}`);
    if (!doc.hasPhoto) console.log("    WARNING: no photo on this document");
    for (const fault of faults) console.log(`    PROBLEM: ${fault}`);
    console.log(`    languages: ${languages.join(", ")}`);
    if (doc.languages?.length) {
      console.log(`    was: ${doc.languages.join(", ")}`);
    }

    mutations.push({
      patch: {
        id,
        set: { "photo.alt": alt, languages },
      },
    });
  }

  console.log(`\n${RULE}`);

  if (problems) {
    console.error(`${problems} problem(s) with the alt text. Nothing written.`);
    process.exit(2);
  }

  console.log(
    "All alt text passes the house rules: length, punctuation, no banned words."
  );

  if (!apply) {
    console.log(
      `Dry run. ${mutations.length} patch(es) prepared, nothing written.`
    );
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_id in $ids]{name, "alt": photo.alt, languages} | order(name asc)`,
    { ids }
  );
  console.log("\nVerified in the dataset:");
  for (const d of after) {
    console.log(
      `  ${String(d.name).padEnd(20)} langs=${(d.languages || []).join(", ")}`
    );
    console.log(`    ${JSON.stringify(d.alt)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
