/**
 * The class schedule's Event markup, against what Google actually requires.
 *
 *   node scripts/audit-class-schedule.js http://localhost:3000
 *   node scripts/audit-class-schedule.js https://www.curatehealth.ca
 *
 * WHY THIS EXISTS
 *
 * CH-107 shipped /classes with `eventSchedule` and no `startDate`, on a
 * reading of the documentation that was simply wrong: Google requires
 * `startDate` on an Event and documents no recurrence field at all. Nothing
 * in this repository looked at Event markup, so the defect sat live from
 * 2026-10-20 until Google emailed Search Console about it on 2026-10-29.
 *
 * Every other kind of markup on this site has a check. This is that check.
 *
 * WHAT IT HOLDS THEM TO
 *
 * `name`, `startDate` and `location` are Google's required fields. A missing
 * one is an error, which is what Search Console reported.
 *
 * `endDate`, `image`, `description`, `offers`, `performer` and
 * `eventAttendanceMode` are its recommended ones. A missing one is reported
 * and does not fail: `performer` is genuinely absent on a class whose teacher
 * is switched off, and that is correct behaviour rather than a defect.
 *
 * ON TOP OF GOOGLE'S LIST, AND THE REAL REASON TO RUN THIS
 *
 * **A `startDate` in the past is worse than no `startDate`.** It is also the
 * one failure here that cannot be found by reading the source, because the
 * date is computed at render time: the markup is correct on the day it ships
 * and wrong a week later if the computation is wrong. So the date is checked
 * against the clock, and against the day the page itself prints.
 *
 * The visible day and time are compared with the markup for the same reason
 * breadcrumbs are: Google checks structured data against what a reader can
 * see, and a schedule that disagrees with itself is worse than either half.
 */
const BASE = process.argv[2] || "http://localhost:3000";
const PAGE = "/classes";

const REQUIRED = ["name", "startDate", "location"];
const RECOMMENDED = [
  "endDate",
  "image",
  "description",
  "offers",
  "performer",
  "eventAttendanceMode",
];

const DAYS = new Set([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

const failures = [];
const notes = [];

function jsonLdNodes(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  const nodes = [];
  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      failures.push("a JSON-LD block does not parse");
      continue;
    }
    nodes.push(...(parsed["@graph"] || [parsed]));
  }
  return nodes;
}

/** The visible text, with tags and script bodies out of the way. */
function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function report() {
  console.log();
  if (notes.length) {
    console.log("  Recommended fields not set, which may be correct:");
    notes.forEach((n) => console.log(`    ${n}`));
    console.log();
  }
  if (failures.length) {
    console.error(`  FAIL, ${failures.length}:`);
    failures.forEach((f) => console.error(`    ${f}`));
    process.exitCode = 1;
    return;
  }
  console.log("  Every Event node is complete, dated and agrees with the page.");
}

(async () => {
  const url = `${BASE}${PAGE}`;
  const res = await fetch(url, { redirect: "manual" });

  console.log();
  console.log(`  ${url}  ${res.status}`);

  /*
   * A 404 is a legitimate state: CH-107 gates the route on the schedule
   * document having at least one active class, so with every class switched
   * off the page is meant to be gone. There is then nothing to audit.
   */
  if (res.status === 404) {
    console.log();
    console.log("  The page is switched off, so there is no markup to check.");
    return;
  }
  if (res.status !== 200) {
    failures.push(`${PAGE} answered ${res.status}`);
    report();
    return;
  }

  const html = await res.text();
  const text = visible(html);
  const events = jsonLdNodes(html).filter((n) => n["@type"] === "Event");

  if (!events.length) {
    failures.push("the page is live and carries no Event node");
    report();
    return;
  }

  console.log();
  const now = Date.now();

  for (const event of events) {
    const label = event.name || "an unnamed Event";
    console.log(`  ${label}`);

    for (const field of REQUIRED) {
      if (!event[field]) failures.push(`${label} has no ${field}`);
    }
    const absent = RECOMMENDED.filter((field) => !event[field]);
    if (absent.length) notes.push(`${label} has no ${absent.join(", ")}`);

    if (!event.startDate) continue;

    /*
     * The offset is required, not optional. Without one Google reads the time
     * in the searcher's own zone, so a 9:00 AM Toronto class shows as 9:00 AM
     * wherever the reader happens to be. CH-107 is explicit about this, and it
     * is the one thing a bare date would silently get wrong.
     */
    const shape = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
    if (!shape.test(event.startDate)) {
      failures.push(
        `${label} startDate is ${JSON.stringify(event.startDate)}, which is not a dated local time carrying an offset`
      );
      continue;
    }

    const start = new Date(event.startDate);
    const ahead = (start.getTime() - now) / 86_400_000;

    console.log(
      `    startDate  ${event.startDate}   in ${ahead.toFixed(1)} days`
    );

    if (ahead < 0) failures.push(`${label} startDate is in the past`);

    /*
     * These are weekly, so the next one is normally inside seven days, and
     * further out used to be read as a skipped week outright.
     *
     * **A class on a break is the legitimate case, and it is why this is not
     * simply a failure.** Instructors take holidays: Pilates is away until
     * December, so its next date is a month out and correct. What is not
     * acceptable is the markup quietly carrying a far-off date while the page
     * still reads as though the class runs this week, which is exactly the
     * shape of the defect that started all this.
     *
     * So the far date has to be ON THE PAGE. The page prints the day and the
     * date it is back, and that string is what is looked for here, which also
     * means the two cannot drift apart without this noticing.
     */
    if (ahead > 7.05) {
      const printed = start.toLocaleDateString("en-CA", {
        timeZone: "America/Toronto",
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      if (!text.includes(printed)) {
        failures.push(
          `${label} startDate is ${ahead.toFixed(1)} days out and the page never says "${printed}", so either a week has been skipped or a break is not shown`
        );
      } else {
        notes.push(`${label} is on a break and the page says it is back ${printed}`);
      }
    }

    if (event.endDate) {
      const end = new Date(event.endDate);
      if (!(end.getTime() > start.getTime())) {
        failures.push(`${label} endDate is not after its startDate`);
      } else {
        const minutes = (end.getTime() - start.getTime()) / 60_000;
        console.log(`    endDate    ${event.endDate}   ${minutes} minutes`);
      }
    }

    /* The markup, the computed date and the page all have to name one day. */
    const byDay = String(event.eventSchedule?.byDay || "").split("/").pop();
    if (byDay) {
      if (!DAYS.has(byDay)) {
        failures.push(`${label} byDay is ${JSON.stringify(byDay)}`);
      }
      const dated = start.toLocaleDateString("en-CA", {
        weekday: "long",
        timeZone: "America/Toronto",
      });
      if (dated !== byDay) {
        failures.push(
          `${label} recurs on ${byDay} and its startDate is a ${dated}`
        );
      }
      if (!text.includes(byDay)) {
        failures.push(`${label} recurs on ${byDay}, which the page never says`);
      }
    }

    /*
     * The page prints its times in 12 hour form, so the markup's 24 hour
     * startTime is converted before looking for it.
     */
    const hhmm = event.eventSchedule?.startTime;
    if (hhmm && /^\d{2}:\d{2}$/.test(hhmm)) {
      const [h, m] = hhmm.split(":").map(Number);
      const suffix = h < 12 ? "AM" : "PM";
      const twelve = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
      if (!text.includes(twelve)) {
        failures.push(`${label} starts at ${twelve}, which the page never says`);
      }
    }
  }

  report();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
