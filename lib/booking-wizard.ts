import {
  JANE_EGLINTON_OFFERINGS_BY_CATEGORY,
  isExactJaneOfferingName,
} from "@/lib/jane-service-catalog";

export type BookingPickerStep = "location" | "modality" | "session" | "date";

export type BookingPickerChoice = { id: string; label: string };

export type BookingPickerPayload = {
  step: BookingPickerStep;
  choices: BookingPickerChoice[];
  modalityLabel?: string;
};

const MODALITY_ORDER = [
  "Chiropractic",
  "Registered Massage Therapy",
  "Physiotherapy",
  "Naturopathic Medicine",
  "Psychotherapy",
  "Personal Training",
  "Recovery Sanctuary Classes",
  "Custom Products",
  "Flowpresso",
] as const;

export const BOOKING_MODALITY_CHOICES: BookingPickerChoice[] = MODALITY_ORDER.map(
  (name) => ({
    id: `modality:${name}`,
    label: name,
  })
);

function normalizeUserLineForOfferingMatch(line: string): string {
  return line
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/^\s*[•·]\s*/, "")
    .trim();
}

/** Last user message that exactly matches a canonical Jane session title (after light cleanup). */
export function inferExactJaneOfferingFromMessages(
  messages: { role: string; content: string }[]
): string | undefined {
  const userContents = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .reverse();

  for (const block of userContents) {
    for (const line of block.split("\n")) {
      const cleaned = normalizeUserLineForOfferingMatch(line);
      if (cleaned && isExactJaneOfferingName(cleaned)) return cleaned;
    }
  }

  return undefined;
}

export function assistantPromptedBookingWizardDate(
  messages: { role: string; content: string }[]
): boolean {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  return Boolean(
    lastAssistant &&
      /\bpick a date for your visit\b|\bwhen would you like to come in\b/i.test(
        lastAssistant.content
      )
  );
}

export function threadIncludesBookingLikeIntent(messages: {
  role: string;
  content: string;
}[]): boolean {
  const userCombined = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  return /\b(book(?:ing)?|schedule|make an appointment|book an appointment)\b/i.test(
    userCombined
  );
}

type JaneLocation = "eglinton" | "downtown";

type AvailabilitySlice = {
  wantsBooking: boolean;
  wantsAvailability: boolean;
  serviceCategory?: string;
  serviceName?: string;
  date?: string;
  dates?: string[];
  location?: JaneLocation;
};

function categoryForOffering(offering: string): string | undefined {
  for (const [cat, list] of Object.entries(JANE_EGLINTON_OFFERINGS_BY_CATEGORY)) {
    if (list.includes(offering)) return cat;
  }
  return undefined;
}

function downtownNonChiroConflict(
  loc: JaneLocation,
  category: string | undefined
): boolean {
  return loc === "downtown" && Boolean(category && category !== "Chiropractic");
}

/** Offer session chips whenever the category has variants and we do not already have a canonical row. */
function shouldOfferSessionChipPicker(input: {
  category: string;
  messages: { role: string; content: string }[];
  routedJaneServiceName?: string | null;
  numberedPickName?: string | undefined;
}): boolean {
  const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY[input.category];
  if (!offerings?.length || offerings.length < 2) return false;

  if (inferExactJaneOfferingFromMessages(input.messages)) return false;

  const trimmed = input.routedJaneServiceName?.trim();
  if (trimmed && isExactJaneOfferingName(trimmed)) return false;

  const pick = input.numberedPickName?.trim();
  if (pick && isExactJaneOfferingName(pick)) return false;

  return true;
}

export function buildBookingWizardReply(input: {
  messages: { role: string; content: string }[];
  availabilityIntent: AvailabilitySlice;
  routedLocation?: JaneLocation | null;
  inferLocationFromUserMessages: (
    messages: { role: string; content: string }[]
  ) => JaneLocation | undefined;
  mergedCategory: string | undefined;
  mergedServiceName: string | undefined;
  mergedDates: string[] | undefined;
  inferNumberedOptionServiceName: (
    messages: { role: string; content: string }[]
  ) => string | undefined;
  routedJaneServiceName?: string | null;
}): { message: string; bookingPicker: BookingPickerPayload } | null {
  const {
    messages,
    availabilityIntent,
    inferLocationFromUserMessages,
    mergedCategory,
    mergedServiceName,
    mergedDates,
    inferNumberedOptionServiceName,
    routedJaneServiceName,
  } = input;

  const inFlow =
    availabilityIntent.wantsBooking ||
    availabilityIntent.wantsAvailability ||
    threadIncludesBookingLikeIntent(messages);
  if (!inFlow) return null;

  const loc =
    inferLocationFromUserMessages(messages) ??
    (input.routedLocation as JaneLocation | undefined) ??
    availabilityIntent.location;

  const category = mergedCategory;
  const exactOffering =
    (mergedServiceName && isExactJaneOfferingName(mergedServiceName)
      ? mergedServiceName
      : undefined) ?? inferExactJaneOfferingFromMessages(messages);

  const dates =
    mergedDates?.length ? mergedDates : availabilityIntent.dates?.length
      ? availabilityIntent.dates
      : availabilityIntent.date
        ? [availabilityIntent.date]
        : [];

  const hasDate = Boolean(dates.length);

  // 0) Downtown + non-chiro modality from thread
  if (loc && downtownNonChiroConflict(loc, category)) {
    return {
      message: `${category} is booked at our Eglinton clinic. Downtown (777 Bay) is chiropractic-only. Choose how you would like to continue:`,
      bookingPicker: {
        step: "location",
        choices: [
          {
            id: "continue-eglinton",
            label: `Book ${category} at Curate Health Eglinton (989 Eglinton Ave W)`,
          },
          {
            id: "downtown-chiro",
            label: "Book Chiropractic at Curate Health Downtown (777 Bay St)",
          },
        ],
      },
    };
  }

  // 1) Location first
  if (!loc) {
    return {
      message: "Choose a location to continue booking:",
      bookingPicker: {
        step: "location",
        choices: [
          {
            id: "loc-eglinton",
            label: "Curate Health Eglinton — 989 Eglinton Ave W",
          },
          {
            id: "loc-downtown",
            label: "Curate Health Downtown — 777 Bay St (chiropractic only)",
          },
        ],
      },
    };
  }

  // 2) Modality
  if (!category) {
    const choices =
      loc === "downtown"
        ? BOOKING_MODALITY_CHOICES.filter((c) => c.label === "Chiropractic")
        : BOOKING_MODALITY_CHOICES;

    return {
      message:
        loc === "downtown"
          ? "Downtown offers chiropractic visits. Choose a session type, or book other services at Eglinton."
          : "What type of appointment are you booking?",
      bookingPicker: { step: "modality", choices },
    };
  }

  // 3) Specific session row (Eglinton catalog)
  if (
    loc === "eglinton" &&
    shouldOfferSessionChipPicker({
      category,
      messages,
      routedJaneServiceName: routedJaneServiceName ?? null,
      numberedPickName: inferNumberedOptionServiceName(messages),
    })
  ) {
    const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY[category];
    if (!offerings?.length) return null;

    if (offerings.length < 2) {
      return null;
    }

    return {
      message: `Pick the exact ${category} session you want:`,
      bookingPicker: {
        step: "session",
        modalityLabel: category,
        choices: offerings.map((name) => ({
          id: `session:${name}`,
          label: name,
        })),
      },
    };
  }

  // Downtown: chiropractic-only; still offer length variants from the same catalog list.
  if (
    loc === "downtown" &&
    category === "Chiropractic" &&
    shouldOfferSessionChipPicker({
      category: "Chiropractic",
      messages,
      routedJaneServiceName: routedJaneServiceName ?? null,
      numberedPickName: inferNumberedOptionServiceName(messages),
    })
  ) {
    const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY.Chiropractic;
    return {
      message: "Pick the chiropractic visit type:",
      bookingPicker: {
        step: "session",
        modalityLabel: "Chiropractic",
        choices: offerings.map((name) => ({
          id: `session:${name}`,
          label: name,
        })),
      },
    };
  }

  // 4) Date — exact session + location, booking flow, no date yet
  if (
    (availabilityIntent.wantsBooking ||
      threadIncludesBookingLikeIntent(messages)) &&
    exactOffering &&
    loc &&
    !hasDate
  ) {
    return {
      message:
        "Pick a date for your visit. Use the quick buttons, calendar, or type today, tomorrow, YYYY-MM-DD, or flexible this week.",
      bookingPicker: {
        step: "date",
        choices: [
          { id: "date-today", label: "Today" },
          { id: "date-tomorrow", label: "Tomorrow" },
          { id: "date-flex", label: "Flexible this week" },
        ],
      },
    };
  }

  return null;
}

export { categoryForOffering };
