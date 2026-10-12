/**
 * The banned words from CLAUDE.md, as one list both audits read.
 *
 * **There is one.** Frank cleared the rest on 2026-10-11 after reading their
 * real usage: transformative, elevate, unlock, seamless, complimentary and
 * "dive in" are all fine to use. Do not reintroduce them, and do not treat
 * their presence in older copy as a defect.
 *
 * "journey" is not here and must not be added either, cleared 2026-09-10 and
 * widened to "holistic wellness journey" on 2026-09-12.
 *
 * WHY THIS IS STILL SHARED
 *
 * audit-content-rules.js and audit-metadata.js each carried their own copy and
 * the two had already drifted once. A rule enforced in one place and not the
 * other is worse than no rule, because it reads as checked. One entry today is
 * still one entry in two places.
 *
 * WHY A PATTERN AND NOT A WORD
 *
 * Both audits matched a bare prefix, which catches inflections that only add
 * letters and misses any that change the stem. The pattern below covers
 * harness/harnesses/harnessed/harnessing.
 *
 * The heavy rules now live elsewhere: em and en dashes, which Frank confirmed
 * on 2026-10-11 are a hard ban, plus exclamation marks, the cafe accent and
 * "outdoor terrace", are all checked directly in audit-content-rules.js.
 */

/**
 * Each entry is the rule's name, as reported, and the pattern that finds it.
 * Patterns are built without flags; the helpers below add them.
 */
const BANNED_PATTERNS = [
  {
    rule: "harness the power of",
    source: String.raw`harness(?:es|ed|ing)?\s+the\s+power\s+of\b`,
  },
];

/**
 * Every banned-word hit in `text`, as {rule, index, length}, in the order they
 * appear. The leading \b keeps a match inside a longer word from counting.
 */
function findBanned(text) {
  const hits = [];
  for (const { rule, source } of BANNED_PATTERNS) {
    const re = new RegExp(`\\b${source}`, "gi");
    for (const m of text.matchAll(re)) {
      hits.push({ rule, index: m.index, length: m[0].length });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/** True if `text` carries any banned word. For the short metadata fields. */
function hasBanned(text) {
  return findBanned(text || "").length > 0;
}

/**
 * American spellings that must not appear. Canadian English, a hard rule Frank
 * set on 2026-10-11 and asked to hold even against his own later instruction.
 *
 * Deliberately short. Canadian English is not British English: "program",
 * "organize", "analyze" are all correct here, and "practice" and "license"
 * split noun from verb in a way no regex can judge. Flagging those would be a
 * worse error than the one this catches.
 */
const AMERICAN = [
  ["savored", "savoured"],
  ["savoring", "savouring"],
  ["savors", "savours"],
  ["savor", "savour"],
  ["honored", "honoured"],
  ["honoring", "honouring"],
  ["honorable", "honourable"],
  ["honors", "honours"],
  ["honor", "honour"],
  ["colorful", "colourful"],
  ["colorless", "colourless"],
  ["coloring", "colouring"],
  ["colored", "coloured"],
  ["colors", "colours"],
  ["color", "colour"],
  ["flavorful", "flavourful"],
  ["flavored", "flavoured"],
  ["flavors", "flavours"],
  ["flavor", "flavour"],
  ["behavioral", "behavioural"],
  ["behaviors", "behaviours"],
  ["behavior", "behaviour"],
  ["neighborhood", "neighbourhood"],
  ["neighbors", "neighbours"],
  ["neighbor", "neighbour"],
  ["centered", "centred"],
  ["centering", "centring"],
  ["centers", "centres"],
  ["center", "centre"],
  ["fibers", "fibres"],
  ["fiber", "fibre"],
  ["defense", "defence"],
  ["offense", "offence"],
  ["fulfillment", "fulfilment"],
  ["counseling", "counselling"],
  ["counselor", "counsellor"],
  ["traveled", "travelled"],
  ["traveling", "travelling"],
  ["modeling", "modelling"],
  ["labeled", "labelled"],
  ["labeling", "labelling"],
];

/** Every American spelling in `text`, as {rule, index, length}. */
function findAmerican(text) {
  const hits = [];
  for (const [us, ca] of AMERICAN) {
    for (const m of text.matchAll(new RegExp(`\\b${us}\\b`, "gi"))) {
      hits.push({
        rule: `${us}, use ${ca}`,
        index: m.index,
        length: m[0].length,
      });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

module.exports = {
  BANNED_PATTERNS,
  findBanned,
  hasBanned,
  AMERICAN,
  findAmerican,
};
