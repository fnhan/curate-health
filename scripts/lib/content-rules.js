/**
 * The banned words from CLAUDE.md, as one list both audits read.
 *
 * WHY THIS IS SHARED
 *
 * audit-content-rules.js and audit-metadata.js each carried their own copy and
 * the two had already drifted: the first had "dive into" and the second did not,
 * so the same phrase failed in body copy and passed in a meta description. A
 * rule enforced in one place and not the other is worse than no rule, because
 * it reads as checked.
 *
 * WHY PATTERNS AND NOT WORDS
 *
 * Both audits matched a bare prefix at a word boundary, which catches the
 * inflections that only add letters: "unlocking" contains "unlock",
 * "seamlessly" contains "seamless". It misses the ones that change the stem.
 * "elevating" does not contain "elevate", so it passed, and CLAUDE.md has
 * recorded that gap as an undercount since 2026-09-19.
 *
 * WHAT IS DELIBERATELY NOT MATCHED
 *
 * Only inflections of the banned word, never its relatives. "transformation"
 * is not matched by "transformative" and "transform" is not either: they are
 * different words, and one of them is ordinary English a clinic may need.
 *
 * "elevation" is left out on purpose, and so is any attempt at "elevated" in
 * isolation, because this is a clinic. "elevated blood pressure" and "elevated
 * liver enzymes" are the correct clinical terms, and a gastroenterologist's
 * pages will use them. "elevated" is still matched, because it is already
 * matched today and the snippet makes the call obvious, but do not widen this
 * further without reading the hits. A check that cries wolf gets ignored.
 *
 * "journey" is not here and must not be added. Frank cleared it on 2026-09-10
 * and widened that to "holistic wellness journey" on 2026-09-12.
 */

/**
 * Each entry is the rule's name, as reported, and the pattern that finds it.
 * Patterns are built without flags; the helpers below add them.
 */
const BANNED_PATTERNS = [
  { rule: "dive in", source: String.raw`div(?:e|es|ed|ing)\s+in(?:to)?\b` },
  { rule: "unlock", source: String.raw`unlock\w*` },
  { rule: "elevate", source: String.raw`elevat(?:e|es|ed|ing)\b` },
  {
    rule: "harness the power of",
    source: String.raw`harness(?:es|ed|ing)?\s+the\s+power\s+of\b`,
  },
  { rule: "complimentary", source: String.raw`complimentary\b` },
  { rule: "transformative", source: String.raw`transformative\b` },
  { rule: "seamless", source: String.raw`seamless\w*` },
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

module.exports = { BANNED_PATTERNS, findBanned, hasBanned };
