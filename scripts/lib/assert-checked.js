/**
 * Stops an audit reporting success when it looked at nothing.
 *
 * WHY THIS EXISTS
 *
 * Three checks written on 2026-09-12 passed while examining an empty set, and
 * each looked exactly like a clean run:
 *
 *   audit-cafe-accent.js  called walkStrings with a callback, but that helper
 *                         returns its pairs rather than taking one, so the
 *                         callback became the path prefix and the body never
 *                         ran. It reported a clean dataset it never read.
 *
 *   audit-orphans.js      filtered sitemap URLs by origin, but the sitemap
 *                         publishes the production host whatever host served
 *                         it, so every URL was discarded and the crawl
 *                         compared against an empty list.
 *
 *   apply-cafe-copy.js    used a Sanity patch path that matched nothing.
 *                         Sanity accepts those and returns a transaction id,
 *                         so it reported two edits it had not made.
 *
 * The shape is always the same. A check that finds no problems and a check that
 * had no input are indistinguishable from the outside, and the second one is
 * the more dangerous, because it is silent precisely when something upstream
 * has broken.
 *
 * So an audit states what it expected to look at, and fails if it did not.
 *
 * USE
 *
 *   const { assertChecked } = require("./lib/assert-checked");
 *
 *   assertChecked({
 *     label: "sitemap URLs",
 *     count: sitemap.length,
 *     atLeast: 40,
 *     hint: "The sitemap publishes the production host, so filtering by origin discards every URL.",
 *   });
 *
 * Throws rather than returning a boolean, because the one thing that must not
 * happen is a caller carrying on past it.
 */

class NothingCheckedError extends Error {
  constructor(message) {
    super(message);
    this.name = "NothingCheckedError";
  }
}

/**
 * @param {object} options
 * @param {string} options.label   what was being counted, for the message
 * @param {number} options.count   how many were actually found
 * @param {number} [options.atLeast=1]
 *   the floor below which the run is not believable. Set it to a real expected
 *   number where one exists: "at least one" catches a total failure, but a site
 *   with 42 pages that suddenly finds 3 is also broken and 1 will not catch it.
 * @param {string} [options.hint]  the likeliest cause, for whoever reads this
 */
function assertChecked({ label, count, atLeast = 1, hint }) {
  if (typeof count !== "number" || Number.isNaN(count)) {
    throw new NothingCheckedError(
      `Cannot verify how many ${label} were checked: the count was ${JSON.stringify(count)}.`
    );
  }

  if (count >= atLeast) return count;

  throw new NothingCheckedError(
    [
      `Refusing to report a result: found ${count} ${label}, expected at least ${atLeast}.`,
      "",
      "This is not a clean run. An audit that examined nothing passes every",
      "test it was given, which is the failure this guard exists to catch.",
      hint ? `\nLikely cause: ${hint}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
}

module.exports = { assertChecked, NothingCheckedError };
