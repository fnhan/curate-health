/**
 * Canonical "Book by Session" titles scraped from Jane (Eglinton). Used when we need a
 * specific offering + duration before live availability scraping.
 */

export const JANE_EGLINTON_OFFERINGS_BY_CATEGORY: Record<string, string[]> = {
  Chiropractic: [
    "Chiropractic Initial Assessment",
    "Subsequent Chiropractic Visits (30-minute)",
    "Extended Chiropractic Visits (45-minute)",
    "Extended Chiropractic Visits (60-minute)",
    "Complimentary 15-Minute Chiropractic Consultation",
    "Chiropractic Assessment (45-minute)",
    "Subsequent Chiropractic Visits (30-minute) (virtual)",
  ],
  "Registered Massage Therapy": [
    "Massage Therapy Session (30-minute)",
    "Massage Therapy Session (45-minute)",
    "Massage Therapy Session (60-minute)",
    "Massage Therapy Session (90-minute)",
    "Massage Therapy (120-minute)",
    "Aromatherapy Session (30-minute Session)",
    "Aromatherapy Session (45-minute)",
    "Aromatherapy Session (60-minute Session)",
    "Aromatherapy Session (90-minute Session)",
    "Aromatherapy Session (120-minute Session)",
  ],
  "Naturopathic Medicine": [
    "Complimentary 15-Minute Discovery Call",
    "Initial Naturopathic Session (in person)",
    "Naturopathic Follow Up (30-minute) (in person)",
    "Naturopathic Follow Up (45-minute) (in person)",
    "Naturopathic Follow Up (60-minute) (in person)",
    "Initial Naturopathic Session (virtual)",
    "Naturopathic Follow Up (30-minute) (virtual)",
    "Naturopathic Follow Up (45-minute) (virtual)",
    "Naturopathic Follow Up (60-minute) (virtual)",
  ],
  "Personal Training": [
    "Fitness Assessment",
    "Fitness Training (45-minute)",
    "Fitness Training (30-minute)",
    "Fitness Training (60-minute)",
  ],
  Physiotherapy: [
    "Physiotherapy Initial Assessment",
    "Subsequent Physiotherapy Visits (30-minute)",
    "Extended Physiotherapy Visits (45-minute)",
    "Extended Physiotherapy Visits (60-minute)",
  ],
  Psychotherapy: [
    "Individual Psychotherapy Session (30-minute) (in person)",
    "Individual Psychotherapy Session (60-minute) (in person)",
    "Couples Therapy (60-minute) (in person)",
    "Couples Therapy (90-minute) (in person)",
    "Complimentary 15-Minute Discovery Call (15-minute)",
    "Individual Psychotherapy Session (30-minute) (virtual)",
    "Individual Psychotherapy Session (60-minute) (virtual)",
    "Couples Therapy (60-minute) (virtual)",
    "Couples Therapy (90-minute) (virtual)",
  ],
  "Recovery Sanctuary Classes": [
    "Cold Plunge & Sauna (Individual)",
    "Cold Plunge & Sauna (Group of 2)",
    "Mat Pilates Class with Claire Kim",
    "Cold Plunge & Sauna (Group of 3)",
    "Yoga Class with Rooj",
    "Cold Plunge & Sauna (Group of 4)",
  ],
  "Custom Products": [
    "New Patient - Custom Foot Orthotics Assessment",
    "Recasting Custom Foot Orthotics",
    "Compression Stocking Assessment & Fitting",
    "Compression Stocking Reorder",
    "Customized Orthotics Fitting",
  ],
  Flowpresso: ["Flowpresso"],
};

const DURATION_REGEX =
  /\b(15|30|45|50|60|75|90|120)\s*-?\s*(min|minute|minutes|mins?|hrs?|hours?)\b|\b(one|two|\d+)\s*-?\s*hour\b|\bhalf\b/i;

/** User text suggests they pinned a variant we can scrape without guessing defaults. */
export function userChoseConcreteJaneSession(userTextCombined: string): boolean {
  const t = userTextCombined.toLowerCase();

  if (DURATION_REGEX.test(userTextCombined)) return true;

  if (
    /\b(aromatherapy|essential oil|essential oils)\b/.test(t) ||
    /\b(couples therapy|individual psychotherapy|psychotherapy|cbt|mental health session)\b/.test(t) ||
    /\b(initial|first|subsequent|extended|follow\s*ups?|consultation)\b/i.test(userTextCombined) ||
    /\b(complementary|complimentary)\b|\bfree\b.*\b(consult|discovery|chat)\b/.test(t) ||
    /\b(virtual)\b|\b(on-?line|zoom)\b/.test(t) ||
    /\b(cold plunge|sauna)\b|\brecovery sanctuary\b|\bmat pilates|pilates\b|\byoga\b/.test(t) ||
    /\b(orthotic|orthotics|compression stocking|compression stock)\b/i.test(userTextCombined) ||
    /\b(flowpresso)\b|\b(fit(?:ness|\s*sess)|fitness assessment|training session)\b/.test(t) ||
    /\b(naturopath|discovery)\b|\bnaturopathic follow\b/i.test(userTextCombined) ||
    /\bcupping|\bfascial\b|\bdeep tissue\b|\bswedish\b|\bprenatal\b/i.test(userTextCombined)
  ) {
    return true;
  }

  return false;
}

export function canonicalJaneOfferingNames(): Set<string> {
  const set = new Set<string>();

  for (const names of Object.values(JANE_EGLINTON_OFFERINGS_BY_CATEGORY)) {
    for (const name of names) set.add(name);
  }

  return set;
}

const CANONICAL_OFFERINGS = canonicalJaneOfferingNames();

export function isExactJaneOfferingName(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return CANONICAL_OFFERINGS.has(text.trim());
}

export function sessionClarificationMessage(category: string): string | null {
  const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY[category];

  if (!offerings || offerings.length < 2) return null;

  const bullets = offerings.map((name) => `• ${name}`).join("\n");

  return [
    `Before we check live openings, which session are you booking in ${category}? You can paste the Jane title verbatim, or describe it clearly ("60-minute massage", "initial chiro", "couples therapy 90", "cold plunge singles", etc.).`,

    "",
    `Sessions listed in Jane (${category}):`,
    bullets,
    "",
    "At Bay / Downtown, chiropractic still has multiple visit lengths—tell us initial vs subsequent vs extended if relevant.",
  ].join("\n");
}

/** Reference block for Gemini (routing + conversational answers). Compact but authoritative. */
export function janeBookingCatalogMarkdown(): string {
  const blocks = Object.entries(JANE_EGLINTON_OFFERINGS_BY_CATEGORY).map(
    ([heading, sessions]) =>
      `### ${heading}\n${sessions.map((session) => `- ${session}`).join("\n")}`
  );

  return [
    "## Curate Health (Eglinton) — Jane sessions (canonical names)",
    "Whenever someone names only a modality (e.g. 'massage', 'chiro'), ask which **exact session row** (treatment type + duration) mapped to these names before discussing availability.",
    ...blocks,
  ].join("\n\n");
}

/** True when we should pause and prompt for a Jane row before scraping options or slots. */
export function needsJaneSessionPick(input: {
  category: string | null | undefined;
  userMessagesCombined: string;
  routerJaneServiceName?: string | null;
  numberedPickName?: string | null | undefined;
}): boolean {
  const category = input.category?.trim();

  if (!category) return false;

  const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY[category];

  if (!offerings?.length || offerings.length < 2) return false;

  if (
    input.routerJaneServiceName &&
    isExactJaneOfferingName(input.routerJaneServiceName)
  ) {
    return false;
  }

  if (
    input.numberedPickName &&
    isExactJaneOfferingName(input.numberedPickName)
  ) {
    return false;
  }

  return !userChoseConcreteJaneSession(input.userMessagesCombined);
}
