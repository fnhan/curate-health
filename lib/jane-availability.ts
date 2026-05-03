import { type Browser, type Locator, type Page, chromium } from "playwright";

import { canonicalJaneOfferingNames } from "./jane-service-catalog";

export type CheckJaneAvailabilityInput = {
  bookingUrl: string;
  serviceName: string;
  practitionerName?: string;
  date: string;
  limit?: number;
};

export type CheckJaneAvailabilityResult = {
  date: string;
  service: string;
  practitioner?: string;
  bookingUrl?: string;
  slots: string[];
};

export type JaneServiceOption = {
  name: string;
  bookingUrl: string;
  practitioner?: string;
  duration?: string;
  price?: string;
};

export type GetJaneServiceOptionsInput = {
  bookingUrl: string;
  categoryName: string;
  limit?: number;
};

type CacheEntry = {
  expiresAt: number;
  value: CheckJaneAvailabilityResult;
};

type ServiceOptionsCacheEntry = {
  expiresAt: number;
  value: JaneServiceOption[];
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 15_000;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const TIME_PATTERN = /\b(\d{1,2})(?::(\d{2}))?\s*([AP])\.?M\.?\b/gi;

/** Jane SPA discipline ids for Curate Health Eglinton (shared book SPA); treatment id is resolved per offering. */
const JANE_BOOKING_HASH_BY_MODALITY: Readonly<{ id: number; pattern: RegExp }[]> =
  [
    { id: 10, pattern: /\b(massage|registered\s+massage|\brmt\b)/i },
    { id: 12, pattern: /\b(naturopath|naturopathic)/i },
    { id: 13, pattern: /\b(personal\s+training|personal\s+trainer|fitness\s+(training|assessment))\b/i },
    { id: 16, pattern: /\b(physio|physiotherapy)\b/i },
    {
      id: 19,
      pattern:
        /\b(psychotherapy|psychotherapist|counse?l(?:l)?ing|cognitive\s+behav(?:iour|ior)al)\b/i,
    },
    { id: 22, pattern: /\b(recovery\s+sanctuary|sanctuary\s+class|cold\s+plunge|sauna|\bpilates\b|\byoga\s+class)\b/i },
    { id: 23, pattern: /\b(custom\s+products?|orthotic|compression\s+stocking)\b/i },
    { id: 24, pattern: /\bflowpresso\b/i },
    {
      id: 1,
      pattern: /\b(chiro|chiropractic|chiropractor|spinal\b)/i,
    },
  ];

function stripJaneHash(bookingUrl: string) {
  const hashStart = bookingUrl.indexOf("#");
  return hashStart < 0 ? bookingUrl.trim() : bookingUrl.slice(0, hashStart).trim();
}

/** Resolve Jane `#/discipline/:id` for a service label; null if unknown — stay on landing book URL. */
export function disciplineHashForJaneService(serviceLabel: string): number | null {
  for (const { id, pattern } of JANE_BOOKING_HASH_BY_MODALITY) {
    if (pattern.test(serviceLabel)) return id;
  }

  return null;
}

export function bookingUrlWithJaneDiscipline(
  bookingUrl: string,
  serviceLabel: string
) {
  const id = disciplineHashForJaneService(serviceLabel);
  if (id == null) return bookingUrl.trim();

  return `${stripJaneHash(bookingUrl)}#/discipline/${id}`;
}

const cache = new Map<string, CacheEntry>();
const serviceOptionsCache = new Map<string, ServiceOptionsCacheEntry>();

declare global {
  // Keep one browser alive across hot reloads and repeated API calls.
  // eslint-disable-next-line no-var
  var janeAvailabilityBrowserPromise: Promise<Browser> | undefined;
}

function getBrowser() {
  if (!globalThis.janeAvailabilityBrowserPromise) {
    console.info("[jane-availability] Launching Chromium");
    globalThis.janeAvailabilityBrowserPromise = chromium.launch({
      headless: true,
    });
  }

  return globalThis.janeAvailabilityBrowserPromise;
}

function buildCacheKey(input: CheckJaneAvailabilityInput) {
  return JSON.stringify({
    bookingUrl: input.bookingUrl.trim(),
    serviceName: input.serviceName.trim().toLowerCase(),
    practitionerName: input.practitionerName?.trim().toLowerCase() ?? "",
    date: input.date,
    limit: input.limit ?? null,
  });
}

function buildServiceOptionsCacheKey(input: GetJaneServiceOptionsInput) {
  return JSON.stringify({
    bookingUrl: input.bookingUrl.trim(),
    categoryName: input.categoryName.trim().toLowerCase(),
    limit: input.limit ?? null,
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("date must use YYYY-MM-DD format");
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("date is invalid");
  }

  return date;
}

function normalizeTime(value: string) {
  const match = value.match(/\b(\d{1,2})(?::(\d{2}))?\s*([AP])\.?M\.?\b/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12) return null;

  return `${hour}:${minute.padStart(2, "0")} ${period}M`;
}

async function waitAfterInteraction(page: Page) {
  await dismissOverlays(page);
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  await dismissOverlays(page);
}

async function dismissOverlays(page: Page) {
  const overlayButtons = [
    page.getByRole("button", { name: /essential only|save & accept|allow all|close/i }),
    page.getByRole("link", { name: /close/i }),
  ];

  for (const locator of overlayButtons) {
    const count = Math.min(await locator.count().catch(() => 0), 5);

    for (let index = 0; index < count; index += 1) {
      const button = locator.nth(index);
      if (!(await button.isVisible().catch(() => false))) continue;

      await button.click({ timeout: 2_000 }).catch(() => undefined);
      await page.waitForTimeout(250);
      return;
    }
  }
}

/** Jane SPA often opens promotional / onboarding modals (`Modal__*`) that intercept pointer events. */
async function dismissBlockingModals(page: Page) {
  for (let round = 0; round < 6; round += 1) {
    await dismissOverlays(page);

    const namedClose = page.getByRole("button", {
      name: /close|dismiss|got it|continue to|accept all|accept|ok\b|sure|maybe later|not now|i understand/i,
    });

    const namedCount = Math.min(await namedClose.count().catch(() => 0), 12);

    for (let index = 0; index < namedCount; index += 1) {
      const btn = namedClose.nth(index);
      if (!(await btn.isVisible().catch(() => false))) continue;

      await btn.click({ timeout: 2_000 }).catch(() => undefined);
      await page.waitForTimeout(350);
    }

    const ariaClose = page.locator(
      '[aria-label="Close" i], [aria-label*="close" i]'
    );

    const acCount = Math.min(await ariaClose.count().catch(() => 0), 8);

    for (let index = 0; index < acCount; index += 1) {
      const btn = ariaClose.nth(index);
      if (!(await btn.isVisible().catch(() => false))) continue;

      await btn.click({ timeout: 1_500 }).catch(() => undefined);
      await page.waitForTimeout(300);
    }

    const modalFooters = page.locator('div[class*="Modal__"] button');
    const mfCount = Math.min(await modalFooters.count().catch(() => 0), 15);

    for (let index = 0; index < mfCount; index += 1) {
      const btn = modalFooters.nth(index);
      if (!(await btn.isVisible().catch(() => false))) continue;

      const label =
        `${(await btn.getAttribute("aria-label")) ?? ""} ${(await btn.innerText()).trim()}`.trim();

      if (
        /^×$|^✕$/i.test(label) ||
        /close|dismiss|continue|got it|accept|^(ok)$|i understand/i.test(label)
      ) {
        await btn.click({ timeout: 2_000 }).catch(() => undefined);
        await page.waitForTimeout(350);
        break;
      }
    }

    await page.keyboard.press("Escape").catch(() => undefined);
    await page.waitForTimeout(200);

    const blocking = await page
      .locator('div[class*="Modal__"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!blocking) return;
  }
}

async function expandShowMoreSessions(page: Page) {
  const candidates = [
    page.getByRole("button", { name: /show more sessions/i }),
    page.getByRole("button", { name: /show more/i }),
    page.getByRole("button", { name: /more sessions/i }),
    page.getByRole("button", { name: /view more/i }),
    page.getByRole("button", { name: /see more/i }),
    page.getByRole("button", { name: /load more/i }),
  ];

  for (let round = 0; round < 4; round += 1) {
    await dismissBlockingModals(page);
    let clickedAny = false;

    for (const locator of candidates) {
      const count = Math.min(await locator.count().catch(() => 0), 6);
      for (let index = 0; index < count; index += 1) {
        const button = locator.nth(index);
        if (!(await button.isVisible().catch(() => false))) continue;
        if (!(await button.isEnabled().catch(() => false))) continue;

        console.info("[jane-availability] Expanding: show more sessions");
        await button.scrollIntoViewIfNeeded().catch(() => undefined);
        await button.click({ timeout: 5_000 }).catch(() => undefined);
        await waitAfterInteraction(page);
        clickedAny = true;
      }
    }

    if (!clickedAny) return;
  }
}

async function clickFirstVisible(locator: Locator) {
  const count = Math.min(await locator.count().catch(() => 0), 10);

  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    if (await item.isVisible().catch(() => false)) {
      await item.scrollIntoViewIfNeeded().catch(() => undefined);
      try {
        await item.click({ timeout: 5_000 });
      } catch {
        await item.click({ timeout: 5_000, force: true });
      }
      return true;
    }
  }

  return false;
}

async function selectOptionByLabel(page: Page, text: string) {
  const selects = page.locator("select");
  const count = await selects.count().catch(() => 0);

  for (let index = 0; index < count; index += 1) {
    const select = selects.nth(index);
    if (!(await select.isVisible().catch(() => false))) continue;

    try {
      await select.selectOption({ label: text }, { timeout: 3_000 });
      return true;
    } catch {
      // Keep trying text/role selectors below.
    }
  }

  return false;
}

async function clickByVisibleText(page: Page, text: string, label: string) {
  console.info(`[jane-availability] Selecting ${label}: ${text}`);

  if (await selectOptionByLabel(page, text)) {
    await waitAfterInteraction(page);
    return;
  }

  const exact = new RegExp(`^\\s*${escapeRegex(text)}\\s*$`, "i");
  const contains = new RegExp(escapeRegex(text), "i");
  const candidates = [
    page.getByRole("button", { name: exact }),
    page.getByRole("link", { name: exact }),
    page.getByRole("option", { name: exact }),
    page.getByRole("button", { name: contains }),
    page.getByRole("link", { name: contains }),
    page.getByText(exact),
    page.getByText(contains),
  ];

  for (const locator of candidates) {
    if (await clickFirstVisible(locator)) {
      await waitAfterInteraction(page);
      return;
    }
  }

  throw new Error(`Could not select ${label}: ${text}`);
}

async function getExactServiceBookingUrl(page: Page, serviceName: string) {
  const normalizedServiceName = serviceName.toLowerCase();
  const needle = compactLetters(serviceName);
  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      text: (anchor.textContent || "").replace(/\s+/g, " ").trim(),
      href: (anchor as HTMLAnchorElement).href,
    }))
  );

  const treatmentLinks = links.filter(
    (link) => link.href.includes("/treatment/") && Boolean(link.text)
  );

  // 1) Exact-ish prefix match (original behavior).
  const prefixMatch = treatmentLinks.find((link) =>
    link.text.toLowerCase().startsWith(normalizedServiceName)
  );
  if (prefixMatch?.href) return prefixMatch.href;

  // 2) Canonical title mapping: if the link text can be normalized to a canonical offering,
  // use it when it equals the requested serviceName.
  for (const link of treatmentLinks) {
    const canon = matchCanonicalJaneOfferingTitle(link.text);
    if (canon && canon === serviceName) return link.href;
  }

  // 3) Fuzzy match: compare compacted strings (handles missing punctuation / parens).
  const fuzzy = treatmentLinks.find((link) => {
    const hay = compactLetters(link.text);
    if (needle.length > 10 && hay.includes(needle)) return true;
    if (hay.length > 10 && needle.includes(hay)) return true;
    return false;
  });

  return fuzzy?.href;
}

function compactLetters(value: string) {
  return value.replace(/[\s()'".·:]+/g, "").toLowerCase();
}

const CANONICAL_JANE_TITLE_PREFIXES_DESC = [...canonicalJaneOfferingNames()].sort(
  (a, b) => compactLetters(b).length - compactLetters(a).length
);

/** Resolve noisy Jane anchor text onto a catalogue title when marketing prose is welded to the anchor label. */
function matchCanonicalJaneOfferingTitle(blob: string): string | undefined {
  let cropped = blob.replace(/\s+/g, " ").trim();

  const readMoreIndex = cropped.search(/\bread\s+more\b/i);
  if (readMoreIndex > 10) cropped = cropped.slice(0, readMoreIndex).trim();

  const offeredIndex = cropped.search(/\bOffered by\b/i);
  if (offeredIndex > 10) cropped = cropped.slice(0, offeredIndex).trim();

  const haystack = compactLetters(cropped);

  for (const title of CANONICAL_JANE_TITLE_PREFIXES_DESC) {
    const prefix = compactLetters(title);
    if (prefix.length > 8 && haystack.startsWith(prefix)) return title;

    const loose = cropped.replace(/\s+/g, "");
    const looseCanon = title.replace(/\s+/g, "");
    if (
      looseCanon.length > 12 &&
      loose.toLowerCase().startsWith(looseCanon.toLowerCase())
    ) {
      return title;
    }
  }

  return undefined;
}

function truncateOfferNoise(text: string) {
  if (text.length <= 88) return text;
  const space = text.lastIndexOf(" ", 88);

  return `${(space > 40 ? text.slice(0, space) : text.slice(0, 88)).trim()} …`;
}

function extractJaneServiceOption(text: string, bookingUrl: string): JaneServiceOption {
  const normalized = text.replace(/\s+/g, " ").trim();
  const canon = matchCanonicalJaneOfferingTitle(normalized);
  let name = canon ?? truncateOfferNoise(normalized);
  const offeredByIndex = name.search(/\bOffered by\b/i);
  if (offeredByIndex > 10) name = name.slice(0, offeredByIndex).trim();

  const practitionerMatch = normalized.match(
    /\bOffered by\s+(.+?)(?=\s+\d+\s+minutes\b|\$\d+)/i
  );
  const duration = normalized.match(/\b(\d+\s+minutes)\b/i)?.[1];
  const priceMatches = [...normalized.matchAll(/\$\d+(?:\.\d{2})?/g)];
  const price = priceMatches[priceMatches.length - 1]?.[0];

  return {
    name,
    bookingUrl,
    ...(practitionerMatch?.[1]?.trim()
      ? { practitioner: practitionerMatch[1].trim().replace(/\s+/g, " ") }
      : {}),
    ...(duration ? { duration } : {}),
    ...(price ? { price } : {}),
  };
}

function serviceOptionMatchesCategory(option: JaneServiceOption, categoryName: string) {
  const category = categoryName.toLowerCase();
  const name = option.name.toLowerCase();

  if (category.includes("massage") || category.includes("registered massage"))
    return /massage|aromatherapy|\brmt\b/.test(name);
  if (category.includes("chiro")) return /chiro/.test(name);
  if (category.includes("physio")) return /physio/.test(name);
  if (category.includes("naturopath")) return /naturopath|discovery call/i.test(name);
  if (
    category.includes("recovery") ||
    category.includes("sanctuary classes")
  ) {
    return (
      /cold plunge|pilates|yoga class|sauna|mat pilates|group of/i.test(name) &&
      !/orthotic/i.test(name)
    );
  }
  if (category.includes("custom products"))
    return (
      /orthotic|compression stocking|recasting|customized orthotics fitting/i.test(name)
    );
  if (category.includes("flowpresso")) return /flowpresso/i.test(name);
  if (
    category.includes("personal training") ||
    category.includes("fitness")
  ) {
    return /fitness training|fitness assessment/i.test(name);
  }
  if (category.includes("psychotherapy")) {
    return (
      /\bpsychotherapy\b|\bcouples therapy\b|\bdiscovery call\b/i.test(name) &&
      !/massage|physio|occupational|\brmt\b|naturopath/i.test(name)
    );
  }

  return name.includes(category.replace(/\s+/g, " "));
}

async function scrapeJaneServiceOptions(
  input: GetJaneServiceOptionsInput
): Promise<JaneServiceOption[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

  try {
    const entryUrl = bookingUrlWithJaneDiscipline(
      input.bookingUrl.trim(),
      input.categoryName
    );

    console.info(
      `[jane-availability] Scraping service options for ${input.categoryName} at ${entryUrl}`
    );
    await page.goto(entryUrl, {
      waitUntil: "domcontentloaded",
      timeout: DEFAULT_TIMEOUT_MS,
    });
    await waitAfterInteraction(page);

    const links = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        text: (anchor.textContent || "").replace(/\s+/g, " ").trim(),
        href: (anchor as HTMLAnchorElement).href,
      }))
    );
    const seen = new Set<string>();
    const options = links
      .filter((link) => link.href.includes("/treatment/") && link.text)
      .map((link) => extractJaneServiceOption(link.text, link.href))
      .filter((option) => serviceOptionMatchesCategory(option, input.categoryName))
      .filter((option) => {
        const key = `${option.name}:${option.bookingUrl}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return typeof input.limit === "number" ? options.slice(0, input.limit) : options;
  } finally {
    await context.close().catch(() => undefined);
  }
}

async function tryFillDateInput(page: Page, date: string) {
  const candidates = [
    page.locator('input[type="date"]'),
    page.locator('input[aria-label*="date" i]'),
    page.locator('input[placeholder*="date" i]'),
  ];

  for (const locator of candidates) {
    const count = Math.min(await locator.count().catch(() => 0), 5);

    for (let index = 0; index < count; index += 1) {
      const input = locator.nth(index);
      if (!(await input.isVisible().catch(() => false))) continue;

      try {
        await input.fill(date, { timeout: 3_000 });
        await input.press("Enter").catch(() => undefined);
        await waitAfterInteraction(page);
        return true;
      } catch {
        // Try the next candidate.
      }
    }
  }

  return false;
}

function dateLabels(date: Date) {
  const monthName = MONTH_NAMES[date.getUTCMonth()];
  const shortMonth = monthName.slice(0, 3);
  const day = String(date.getUTCDate());
  const year = String(date.getUTCFullYear());

  return [
    `${monthName} ${day}, ${year}`,
    `${shortMonth} ${day}, ${year}`,
    `${monthName} ${day}`,
    `${shortMonth} ${day}`,
    day,
  ];
}

async function clickDateCell(page: Page, date: Date) {
  for (const label of dateLabels(date)) {
    const regex = new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, "i");
    const contains = new RegExp(escapeRegex(label), "i");
    const candidates = [
      page.getByRole("button", { name: regex }),
      page.getByRole("link", { name: regex }),
      page.getByRole("button", { name: contains }),
      page.getByRole("link", { name: contains }),
    ];

    for (const locator of candidates) {
      if (await clickFirstVisible(locator)) {
        await waitAfterInteraction(page);
        return true;
      }
    }
  }

  return false;
}

async function getDisplayedMonth(page: Page) {
  const bodyText = await page.locator("body").innerText({ timeout: 5_000 });
  const monthPattern = new RegExp(
    `\\b(${MONTH_NAMES.join("|")})\\s+(\\d{4})\\b`,
    "i"
  );
  const match = bodyText.match(monthPattern);

  if (!match) return null;

  return {
    monthIndex: MONTH_NAMES.findIndex(
      (month) => month.toLowerCase() === match[1].toLowerCase()
    ),
    year: Number(match[2]),
  };
}

async function clickCalendarNavigation(page: Page, direction: "next" | "previous") {
  const label =
    direction === "next"
      ? /next|forward|following|later|›|»|>/i
      : /previous|prev|back|earlier|‹|«|</i;
  const candidates = [
    page.getByRole("button", { name: label }),
    page.getByRole("link", { name: label }),
    page.locator(`button[aria-label*="${direction}" i]`),
    page.locator(`a[aria-label*="${direction}" i]`),
  ];

  for (const locator of candidates) {
    if (await clickFirstVisible(locator)) {
      await waitAfterInteraction(page);
      return true;
    }
  }

  return false;
}

function monthDelta(
  from: { monthIndex: number; year: number },
  to: { monthIndex: number; year: number }
) {
  return (to.year - from.year) * 12 + (to.monthIndex - from.monthIndex);
}

async function navigateToDate(page: Page, dateString: string) {
  const targetDate = validateDate(dateString);
  console.info(`[jane-availability] Navigating to date: ${dateString}`);

  if (await tryFillDateInput(page, dateString)) {
    return;
  }

  if (await clickDateCell(page, targetDate)) {
    return;
  }

  const displayedMonth = await getDisplayedMonth(page);
  const targetMonth = {
    monthIndex: targetDate.getUTCMonth(),
    year: targetDate.getUTCFullYear(),
  };
  const startingMonth =
    displayedMonth ?? {
      monthIndex: new Date().getMonth(),
      year: new Date().getFullYear(),
    };
  const delta = monthDelta(startingMonth, targetMonth);
  const direction = delta >= 0 ? "next" : "previous";

  for (let step = 0; step < Math.min(Math.abs(delta), 24); step += 1) {
    const navigated = await clickCalendarNavigation(page, direction);
    if (!navigated) break;
  }

  if (!(await clickDateCell(page, targetDate))) {
    console.info(
      `[jane-availability] Could not click date cell for ${dateString}; continuing to slot extraction`
    );
  }
}

async function waitForSlotsOrEmptyState(page: Page) {
  try {
    await page.waitForFunction(
      () => {
        const text = document.body?.innerText ?? "";
        return (
          /\b\d{1,2}(?::\d{2})?\s*[AP]\.?M\.?\b/i.test(text) ||
          /no\s+(appointments|availability|times|slots)/i.test(text)
        );
      },
      undefined,
      { timeout: DEFAULT_TIMEOUT_MS }
    );
  } catch {
    console.info("[jane-availability] Timed out waiting for slots; returning empty list if none are visible");
  }
}

function sortSlotsChronologically(slots: string[]) {
  const toMinutes = (value: string) => {
    const match = value.match(/\b(\d{1,2}):(\d{2})\s*([AP])M\b/i);
    if (!match) return Number.POSITIVE_INFINITY;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();
    if (hour === 12) hour = 0;
    const base = hour * 60 + minute;
    return period === "P" ? base + 12 * 60 : base;
  };

  return [...slots].sort((a, b) => toMinutes(a) - toMinutes(b));
}

async function extractSlotsForDate(page: Page, dateIso: string, limit?: number) {
  await waitForSlotsOrEmptyState(page);

  // Prefer structured extraction from the week view, keyed by the day header's href:
  // `#/treatments/<treatmentId>/YYYY-MM-DD`.
  const daySlots = await page.evaluate((dateString) => {
    const result: string[] = [];

    const dayComponents = Array.from(
      document.querySelectorAll('[data-testid="day-component"]')
    );

    const matchingDay = dayComponents.find((day) => {
      const link = day.querySelector<HTMLAnchorElement>(
        '.day-header a[href*="/treatments/"]'
      );
      if (!link?.getAttribute("href")) return false;
      return link.getAttribute("href")!.includes(`/${dateString}`);
    });

    if (!matchingDay) return { found: false as const, slots: result };

    const openings = Array.from(
      matchingDay.querySelectorAll<HTMLElement>(
        '[data-testid="positioned-opening-li"], [data-testid="item_opening"]'
      )
    );

    for (const opening of openings) {
      const aria = opening.getAttribute("aria-label") ?? "";
      // Many Jane nodes have the time in aria-label, but also in text.
      const text = (opening.textContent ?? "").replace(/\s+/g, " ").trim();
      const merged = `${aria} ${text}`.trim();
      if (merged) result.push(merged);
    }

    return { found: true as const, slots: result };
  }, dateIso);

  const slots = new Set<string>();

  if (daySlots.found) {
    for (const blob of daySlots.slots) {
      for (const match of blob.matchAll(TIME_PATTERN)) {
        const normalized = normalizeTime(match[0]);
        if (normalized) slots.add(normalized);
      }
    }
  } else {
    // Fallback: scan visible clickable text (less accurate date-wise).
    const visibleTexts: string[] = [];
    const clickable = page.locator('button, a, [role="button"], [role="link"]');
    const count = Math.min(await clickable.count().catch(() => 0), 250);

    for (let index = 0; index < count; index += 1) {
      const item = clickable.nth(index);
      if (!(await item.isVisible().catch(() => false))) continue;

      const text = await item.innerText().catch(() => "");
      if (text) visibleTexts.push(text);
    }

    if (!visibleTexts.length) {
      visibleTexts.push(await page.locator("body").innerText().catch(() => ""));
    }

    for (const text of visibleTexts) {
      for (const match of text.matchAll(TIME_PATTERN)) {
        const normalized = normalizeTime(match[0]);
        if (normalized) slots.add(normalized);
      }
    }
  }

  const allSlots = sortSlotsChronologically([...slots]);
  return typeof limit === "number" ? allSlots.slice(0, limit) : allSlots;
}

async function extractSlots(page: Page, limit?: number) {
  await waitForSlotsOrEmptyState(page);

  const visibleTexts: string[] = [];
  const clickable = page.locator('button, a, [role="button"], [role="link"]');
  const count = Math.min(await clickable.count().catch(() => 0), 250);

  for (let index = 0; index < count; index += 1) {
    const item = clickable.nth(index);
    if (!(await item.isVisible().catch(() => false))) continue;

    const text = await item.innerText().catch(() => "");
    if (text) visibleTexts.push(text);
  }

  if (!visibleTexts.length) {
    visibleTexts.push(await page.locator("body").innerText().catch(() => ""));
  }

  const slots = new Set<string>();

  for (const text of visibleTexts) {
    for (const match of text.matchAll(TIME_PATTERN)) {
      const normalized = normalizeTime(match[0]);
      if (normalized) slots.add(normalized);
    }
  }

  const allSlots = sortSlotsChronologically([...slots]);
  return typeof limit === "number" ? allSlots.slice(0, limit) : allSlots;
}

export async function checkJaneAvailability(
  input: CheckJaneAvailabilityInput
): Promise<CheckJaneAvailabilityResult> {
  const bookingUrl = input.bookingUrl.trim();
  const serviceName = input.serviceName.trim();
  const practitionerName = input.practitionerName?.trim();

  if (!bookingUrl) throw new Error("bookingUrl is required");
  if (!serviceName) throw new Error("serviceName is required");
  validateDate(input.date);

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

  try {
    const entryUrl = bookingUrlWithJaneDiscipline(bookingUrl, serviceName);

    console.info(`[jane-availability] Opening ${entryUrl}`);
    await page.goto(entryUrl, {
      waitUntil: "domcontentloaded",
      timeout: DEFAULT_TIMEOUT_MS,
    });
    await waitAfterInteraction(page);
    await dismissBlockingModals(page);
    await expandShowMoreSessions(page);

    const exactServiceBookingUrl = await getExactServiceBookingUrl(
      page,
      serviceName
    );

    if (exactServiceBookingUrl && /\/treatment\/\d+/i.test(exactServiceBookingUrl)) {
      console.info(
        `[jane-availability] Navigating to treatment (skip click): ${exactServiceBookingUrl}`
      );
      await page.goto(exactServiceBookingUrl, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT_MS,
      });
      await waitAfterInteraction(page);
      await dismissBlockingModals(page);
      await expandShowMoreSessions(page);
    } else {
      await dismissBlockingModals(page);
      await expandShowMoreSessions(page);
      await clickByVisibleText(page, serviceName, "service");
    }

    if (practitionerName) {
      await clickByVisibleText(page, practitionerName, "practitioner");
    }

    await navigateToDate(page, input.date);

    const slots = await extractSlotsForDate(page, input.date, input.limit);
    console.info(
      `[jane-availability] Found ${slots.length} slot(s) for ${serviceName} on ${input.date}`
    );

    return {
      date: input.date,
      service: serviceName,
      ...(practitionerName ? { practitioner: practitionerName } : {}),
      ...(exactServiceBookingUrl ? { bookingUrl: exactServiceBookingUrl } : {}),
      slots,
    };
  } catch (error) {
    console.error("[jane-availability] Scrape failed", {
      bookingUrl,
      serviceName,
      practitionerName,
      date: input.date,
      error,
    });
    throw error;
  } finally {
    await context.close().catch(() => undefined);
  }
}

export async function getCachedJaneAvailability(
  input: CheckJaneAvailabilityInput
) {
  const key = buildCacheKey(input);
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    console.info("[jane-availability] Returning cached availability");
    return cached.value;
  }

  const value = await checkJaneAvailability(input);
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}

export async function getCachedJaneServiceOptions(
  input: GetJaneServiceOptionsInput
) {
  const key = buildServiceOptionsCacheKey(input);
  const cached = serviceOptionsCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    console.info("[jane-availability] Returning cached service options");
    return cached.value;
  }

  const value = await scrapeJaneServiceOptions(input);
  serviceOptionsCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}
