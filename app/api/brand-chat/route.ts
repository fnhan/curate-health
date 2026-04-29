import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { BASEURL } from "@/app/site-settings";
import { getBrandAiContext } from "@/lib/brand-ai-context";
import {
  type JaneServiceOption,
  getCachedJaneAvailability,
  getCachedJaneServiceOptions,
} from "@/lib/jane-availability";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AvailabilityIntent = {
  wantsAvailability: boolean;
  wantsBooking: boolean;
  serviceCategory?: string;
  serviceName?: string;
  date?: string;
  dates?: string[];
  location?: JaneLocation;
};

type JaneLocation = "eglinton" | "downtown";

const MODEL = "gemini-2.5-flash";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1200;
const INTERNAL_ASSET_URL_PATTERN = /https?:\/\/cdn\.sanity\.io\/[^\s)>"']+/gi;
const CANONICAL_BOOKING_URL = "https://curatehealth.janeapp.com/";
const JANE_LOCATIONS: Record<
  JaneLocation,
  { label: string; bookingUrl: string; address: string }
> = {
  eglinton: {
    label: "Curate Health Eglinton",
    bookingUrl: "https://curatehealth.janeapp.com/locations/curate-health/book",
    address: "989 Eglinton Avenue West",
  },
  downtown: {
    label: "Curate Health Downtown",
    bookingUrl:
      "https://curatehealth.janeapp.com/locations/curate-health-downtown/book",
    address: "777 Bay Street",
  },
};
const LEGACY_PATIENT_PORTAL_URL_PATTERN =
  /https?:\/\/curatehealth\.embodiaapp\.com\/[^\s)>"']*/gi;
const DATE_PATTERN = /\b(\d{4}-\d{2}-\d{2})\b/;

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;

      const role = "role" in message ? message.role : null;
      const content = "content" in message ? message.content : null;

      return (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      );
    })
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

function buildSystemInstruction(context: string) {
  return `You are the Curate Health website assistant.

Answer questions about Curate Health using the provided brand context. Be warm, concise, and practical.

Rules:
- Use only the brand context for factual claims about Curate Health.
- Speak as Curate Health using first-person plural language: "we", "our", and "us". Do not refer to Curate Health as "they" or "their".
- For any booking question, use the canonical Book Now link from the brand context. Do not use patient portal or product portal links.
- For availability questions, ask for the service and date if either is missing. Do not say we have no real-time availability.
- If the answer is not in the context, say you do not have that detail and suggest contacting Curate Health.
- Do not diagnose, prescribe, or replace professional medical advice.
- For urgent or emergency symptoms, advise the user to seek immediate medical care.
- When useful, point users to the most relevant Curate Health page or contact detail from the context.
- Do not expose raw Sanity, CDN, PDF, image, or file asset URLs. Link to public website pages instead. For cafe menu questions, use ${BASEURL}/cafe.

Brand context:
${context}`;
}

function sanitizeAssistantMessage(message: string) {
  return message
    .replace(INTERNAL_ASSET_URL_PATTERN, `${BASEURL}/cafe`)
    .replace(LEGACY_PATIENT_PORTAL_URL_PATTERN, CANONICAL_BOOKING_URL);
}

function todayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseRequestedDate(text: string) {
  const explicitDate = text.match(DATE_PATTERN)?.[1];
  if (explicitDate) return explicitDate;

  const normalized = text.toLowerCase();
  const today = todayAtMidnight();

  if (/\btoday\b/.test(normalized)) return formatDate(today);

  if (/\btomorrow\b/.test(normalized)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  return undefined;
}

function parseRequestedDates(text: string) {
  const normalized = text.toLowerCase();

  if (!/\b(any\s*time\s+)?this week\b/.test(normalized)) {
    const date = parseRequestedDate(text);
    return date ? [date] : undefined;
  }

  const today = todayAtMidnight();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    return formatDate(date);
  });
}

function inferServiceName(conversationText: string) {
  const text = conversationText.toLowerCase();

  if (/(chiro|chiropractic|chiropractor)/.test(text)) {
    if (/(follow|subsequent|return|returning)/.test(text)) {
      return "Subsequent Chiropractic Visits (30-minute)";
    }

    if (/(consult|consultation)/.test(text)) {
      return "Complimentary 15-Minute Chiropractic Consultation";
    }

    if (/(extended|45)/.test(text)) {
      return "Extended Chiropractic Visits (45-minute)";
    }

    if (/(60|hour)/.test(text)) {
      return "Extended Chiropractic Visits (60-minute)";
    }

    return "Chiropractic Initial Assessment";
  }

  if (/(massage|rmt)/.test(text)) {
    if (/\b120\s*-?\s*minute\b/.test(text)) return "Massage Therapy (120-minute)";
    if (/\b90\s*-?\s*minute\b/.test(text)) return "Massage Therapy Session (90-minute)";
    if (/\b45\s*-?\s*minute\b/.test(text)) return "Massage Therapy Session (45-minute)";
    if (/\b30\s*-?\s*minute\b/.test(text)) return "Massage Therapy Session (30-minute)";
    if (/\b60\s*-?\s*minute\b/.test(text)) return "Massage Therapy Session (60-minute)";

    return "Massage Therapy Session (60-minute)";
  }
  if (/(physio|physiotherapy)/.test(text)) return "Physiotherapy Initial Assessment";
  if (/(naturopath|naturopathic)/.test(text)) {
    return "Initial Naturopathic Session (in person)";
  }
  if (/(psychotherapy|therapy|therapist)/.test(text)) {
    return "Individual Psychotherapy Session (60-minute) (in person)";
  }

  return undefined;
}

function inferServiceCategory(conversationText: string) {
  const text = conversationText.toLowerCase();

  if (/(chiro|chiropractic|chiropractor)/.test(text)) return "Chiropractic";
  if (/(massage|rmt)/.test(text)) return "Registered Massage Therapy";
  if (/(physio|physiotherapy)/.test(text)) return "Physiotherapy";
  if (/(naturopath|naturopathic)/.test(text)) return "Naturopathic Medicine";
  if (/(psychotherapy|therapy|therapist)/.test(text)) return "Psychotherapy";

  return undefined;
}

function inferLocation(conversationText: string): JaneLocation | undefined {
  const text = conversationText.toLowerCase();

  if (/\b(downtown|bay|777)\b/.test(text)) return "downtown";
  if (/\b(eglinton|york|989|uptown|main clinic|curate health clinic)\b/.test(text)) {
    return "eglinton";
  }

  return undefined;
}

function serviceIsAvailableAtLocation(
  serviceName: string | undefined,
  location: JaneLocation | undefined
) {
  if (!serviceName || !location) return true;

  // The Downtown Jane location currently exposes chiropractic only.
  if (location === "downtown") {
    return /chiropractic/i.test(serviceName);
  }

  return true;
}

function getSupportedLocationsForService(
  serviceName: string | undefined
): JaneLocation[] {
  if (!serviceName) return ["eglinton", "downtown"];

  // Based on Jane's current public booking listings:
  // Downtown exposes chiropractic; other listed services are under Eglinton.
  if (/chiropractic/i.test(serviceName)) return ["eglinton", "downtown"];

  return ["eglinton"];
}

function formatLocationOptions(locations: JaneLocation[]) {
  return locations
    .map((location) => {
      const config = JANE_LOCATIONS[location];
      return `${config.label} at ${config.address}`;
    })
    .join(", or ");
}

function formatServiceOptionsResponse(
  categoryName: string,
  location: { label: string; bookingUrl: string },
  options: JaneServiceOption[]
) {
  if (!options.length) {
    return `I checked Jane for ${categoryName} at ${location.label}, but I could not find bookable options right now. You can still open the booking page here: ${location.bookingUrl}`;
  }

  const optionLines = options
    .map((option, index) => {
      const details = [option.duration, option.practitioner, option.price]
        .filter(Boolean)
        .join(" · ");

      return `${index + 1}. ${option.name}${details ? ` (${details})` : ""}`;
    })
    .join("\n");

  return [
    `I found these ${categoryName} appointment options at ${location.label}:`,
    optionLines,
    "Which option would you like, and what date should I check?",
  ].join("\n\n");
}

function inferNumberedOptionServiceName(messages: ChatMessage[]) {
  const latest = messages[messages.length - 1]?.content ?? "";
  const optionNumber = Number(latest.match(/^\s*(\d+)[.)]/)?.[1]);

  if (!optionNumber) return undefined;

  const previousOptionsMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        /Which option would you like/i.test(message.content)
    );

  const optionLine = previousOptionsMessage?.content
    .split("\n")
    .find((line) => line.trim().startsWith(`${optionNumber}.`));

  return optionLine
    ?.replace(/^\s*\d+\.\s*/, "")
    .replace(/\s*\(.+$/, "")
    .trim();
}

function getAvailabilityIntent(messages: ChatMessage[]): AvailabilityIntent {
  const latest = messages[messages.length - 1]?.content ?? "";
  const latestDate = parseRequestedDate(latest);
  const latestDates = parseRequestedDates(latest);
  const latestLocation = inferLocation(latest);
  const latestServiceName =
    inferServiceName(latest) ?? inferNumberedOptionServiceName(messages);
  const latestServiceCategory = inferServiceCategory(latest);
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const conversationText = messages.map((message) => message.content).join("\n");
  const conversationServiceName = inferServiceName(conversationText);
  const conversationServiceCategory = inferServiceCategory(conversationText);
  const latestRequestsBooking =
    /\b(book|booking|schedule|appointment|reserve)\b/i.test(latest) &&
    Boolean(latestServiceCategory ?? latestServiceName);
  const latestRequestsAvailability =
    /\b(availability|available|openings?|times?|slots?|appointments?)\b/i.test(latest) &&
    /\b(show|check|see|what|when|any|availability|available|openings?|times?|slots?)\b/i.test(latest);
  const earlierUserRequestedAvailability =
    /\b(availability|available|openings?|times?|slots?)\b/i.test(userText);
  const latestSwitchesServiceInAvailabilityFlow =
    Boolean(latestServiceName) &&
    earlierUserRequestedAvailability &&
    /\b(what about|how about|instead|massage|chiro|physio|naturopath|psychotherapy|therapy|rmt)\b/i.test(
      latest
    );
  const assistantAskedForDate = messages.some(
    (message) =>
      message.role === "assistant" &&
      /what date|which date|send it as yyyy-mm-dd|say today\/tomorrow/i.test(
        message.content
      )
  );
  const assistantAskedForOptionAndDate = messages.some(
    (message) =>
      message.role === "assistant" &&
      /Which option would you like, and what date should I check/i.test(
        message.content
      )
  );
  const assistantAskedForLocation = messages.some(
    (message) =>
      message.role === "assistant" &&
      /which location|eglinton|downtown|777 bay|989 eglinton/i.test(
        message.content
      )
  );
  const latestAnswersPendingAvailabilityDate =
    Boolean(latestDates?.length) &&
    (earlierUserRequestedAvailability || assistantAskedForOptionAndDate) &&
    assistantAskedForDate;
  const latestAnswersPendingOptionAndDate =
    Boolean(latestServiceName) &&
    Boolean(latestDates?.length) &&
    assistantAskedForOptionAndDate;
  const latestAnswersPendingAvailabilityLocation =
    Boolean(latestLocation) &&
    earlierUserRequestedAvailability &&
    assistantAskedForLocation;
  const wantsAvailability =
    latestRequestsAvailability ||
    latestAnswersPendingAvailabilityDate ||
    latestAnswersPendingOptionAndDate ||
    latestAnswersPendingAvailabilityLocation ||
    latestSwitchesServiceInAvailabilityFlow;
  const serviceName = latestServiceName ?? conversationServiceName;
  const location =
    latestLocation ??
    (latestSwitchesServiceInAvailabilityFlow
      ? undefined
      : inferLocation(conversationText));

  return {
    wantsAvailability,
    wantsBooking: latestRequestsBooking,
    serviceCategory: latestServiceCategory ?? conversationServiceCategory,
    serviceName,
    date: latestDate ?? parseRequestedDate(conversationText),
    dates: latestDates ?? parseRequestedDates(conversationText),
    location,
  };
}

function formatSlotsResponse({
  date,
  service,
  location,
  bookingUrl,
  slots,
}: {
  date: string;
  service: string;
  location: string;
  bookingUrl: string;
  slots: string[];
}) {
  if (!slots.length) {
    return `I checked availability for ${service} at ${location} on ${date}, but I do not see any open times for that date. You can try another date, or book directly here: ${bookingUrl}`;
  }

  return [
    `Here are the available times I found for ${service} at ${location} on ${date}:`,
    slots.map((slot) => `- ${slot}`).join("\n"),
    `You can book this service here: ${bookingUrl}`,
  ].join("\n\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = normalizeMessages(body?.messages);
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "Please send a question to chat with Curate Health." },
      { status: 400 }
    );
  }

  try {
    const availabilityIntent = getAvailabilityIntent(messages);

    if (availabilityIntent.wantsBooking && availabilityIntent.serviceCategory) {
      const supportedLocations = getSupportedLocationsForService(
        availabilityIntent.serviceName ?? availabilityIntent.serviceCategory
      );
      const resolvedLocationKey =
        availabilityIntent.location ??
        (supportedLocations.length === 1 ? supportedLocations[0] : undefined);

      if (!resolvedLocationKey) {
        return NextResponse.json({
          message: `Which location would you like to check: ${formatLocationOptions(
            supportedLocations
          )}?`,
        });
      }

      const location = JANE_LOCATIONS[resolvedLocationKey];
      const options = await getCachedJaneServiceOptions({
        bookingUrl: location.bookingUrl,
        categoryName: availabilityIntent.serviceCategory,
        limit: 8,
      });

      return NextResponse.json({
        message: formatServiceOptionsResponse(
          availabilityIntent.serviceCategory,
          location,
          options
        ),
      });
    }

    if (availabilityIntent.wantsAvailability) {
      if (!availabilityIntent.serviceName) {
        return NextResponse.json({
          message:
            "I can check availability for you. Which service would you like to book?",
        });
      }

      const supportedLocations = getSupportedLocationsForService(
        availabilityIntent.serviceName
      );
      const resolvedLocationKey =
        availabilityIntent.location ??
        (supportedLocations.length === 1 ? supportedLocations[0] : undefined);

      if (!resolvedLocationKey) {
        return NextResponse.json({
          message: `Which location would you like to check: ${formatLocationOptions(
            supportedLocations
          )}?`,
        });
      }

      if (
        !serviceIsAvailableAtLocation(
          availabilityIntent.serviceName,
          resolvedLocationKey
        )
      ) {
        return NextResponse.json({
          message: `${availabilityIntent.serviceName} is available through ${formatLocationOptions(
            supportedLocations
          )}. Would you like me to check that location?`,
        });
      }

      const datesToCheck = availabilityIntent.dates?.length
        ? availabilityIntent.dates
        : availabilityIntent.date
          ? [availabilityIntent.date]
          : [];

      if (!datesToCheck.length) {
        return NextResponse.json({
          message:
            "I can check real-time availability for that. What date would you like me to check? Please send it as YYYY-MM-DD, or say today/tomorrow.",
        });
      }

      const location = JANE_LOCATIONS[resolvedLocationKey];
      let availability = await getCachedJaneAvailability({
        bookingUrl: location.bookingUrl,
        serviceName: availabilityIntent.serviceName,
        date: datesToCheck[0],
        limit: 8,
      });

      for (const date of datesToCheck.slice(1)) {
        if (availability.slots.length) break;

        availability = await getCachedJaneAvailability({
          bookingUrl: location.bookingUrl,
          serviceName: availabilityIntent.serviceName,
          date,
          limit: 8,
        });
      }

      return NextResponse.json({
        message: formatSlotsResponse({
          ...availability,
          location: location.label,
          bookingUrl: availability.bookingUrl ?? location.bookingUrl,
        }),
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const context = await getBrandAiContext();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      config: {
        systemInstruction: buildSystemInstruction(context),
        temperature: 0.3,
      },
    });
    const message = response.text?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Curate Assistant could not generate a response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: sanitizeAssistantMessage(message) });
  } catch (error) {
    console.error("Brand chat failed", error);

    return NextResponse.json(
      { error: "Curate Assistant is temporarily unavailable." },
      { status: 500 }
    );
  }
}
