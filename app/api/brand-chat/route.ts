import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { BASEURL } from "@/app/site-settings";
import { getBrandAiContext } from "@/lib/brand-ai-context";
import { groqChatCompletion } from "@/lib/groq";
import {
  assistantPromptedBookingWizardDate,
  buildBookingWizardReply,
  categoryForOffering,
  inferExactJaneOfferingFromMessages,
} from "@/lib/booking-wizard";
import {
  isExactJaneOfferingName,
  janeBookingCatalogMarkdown,
  needsJaneSessionPick,
  sessionClarificationMessage,
} from "@/lib/jane-service-catalog";
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

const ROUTER_PROMPT = `You route the latest user intent for Curate Health (Toronto integrative clinic, books via Jane).

Respond with ONLY a single JSON object. No markdown, no code fences. No extra prose.

intent (required):
- general — greetings, café/menu, practitioners, pricing info, directions, cancellations/rescheduling questions, unrelated chat, vague questions with no scheduling signal, FAQs.
- booking_options — user wants to start booking or see what appointment types exist (e.g. "book", "schedule", name a service without asking for specific times/slots yet).
- check_availability — user wants concrete times/slots/calendar/openings for a service (e.g. "availability", "when can I", "openings tomorrow", "what times").

service_category: one of these exact strings or null if unknown. Must match the modality the USER actually asked for (e.g. massage/RMT → "Registered Massage Therapy", never infer Chiropractic from generic clinic wording):
"Chiropractic", "Registered Massage Therapy", "Physiotherapy", "Naturopathic Medicine", "Psychotherapy", "Personal Training", "Recovery Sanctuary Classes", "Custom Products", "Flowpresso"

jane_service_name: exact canonical title from the catalog appendix when the user pinned a specific row (quoted name, numbered option, or phrasing that maps to one row). Otherwise null—never guess a duration.

location: "eglinton", "downtown", or null. Eglinton = 989 Eglinton Ave W, Midtown, "the one on Eglinton". Downtown = 777 Bay St, Bay, financial district.
Downtown Jane currently lists chiropractic only — if location is downtown and service is non-chiropractic, still set fields honestly; downstream may correct.

date_iso: YYYY-MM-DD in Toronto (America/Toronto) calendar if user (or assistant) anchored a calendar day ("today", "tomorrow", weekday, or numeric date); else null.

prefer_this_week: true only if user asked for openings any time soon / flexible this week — not tied to one day.

Prefer the MOST RECENT user message; resolve pronouns ("there", "that one") against prior turns.

JSON shape:
{"intent":"general|booking_options|check_availability","service_category":string|null,"jane_service_name":string|null,"location":"eglinton"|"downtown"|null,"date_iso":string|null,"prefer_this_week":boolean}`;

const AiRoutingSchema = z.object({
  intent: z.enum(["general", "booking_options", "check_availability"]),
  service_category: z.string().nullable().optional(),
  jane_service_name: z.string().nullable().optional(),
  location: z.enum(["eglinton", "downtown"]).nullable().optional(),
  date_iso: z.string().nullable().optional(),
  prefer_this_week: z.boolean().optional(),
});

type AiRouting = z.infer<typeof AiRoutingSchema>;

const MODEL = "gemini-2.5-flash";
const GROQ_DEFAULT_MODEL = "llama-3.1-70b-versatile";
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
const RESTART_BOOKING_PATTERN =
  /\b(start over|restart|reset)\b|\b(another|different|new)\s+(service|appointment|booking)\b|\b(change|switch)\s+(service|appointment|booking)\b|\blet'?s\s+try\s+another\s+service\b|\btry\s+another\s+service\b/i;

/** User-facing fallback when the model tier throttles; warm tone, no quotas or vendors named. */
const QUOTA_FRIENDLY_CHAT_MESSAGE =
  `Curate Assistant didn't finish that reply just now—sorry about that.

Please try again in a moment. Whenever you're ready, you can book through Jane (${CANONICAL_BOOKING_URL}) or reach the team using the contacts on ${BASEURL}.`;

function friendlyBrandChatFailure(error: unknown): {
  status: number;
  errorBody: string;
} {
  let combined = "";

  if (typeof error === "object" && error !== null && "message" in error) {
    const raw = (error as { message: unknown }).message;
    combined =
      typeof raw === "string" ? raw : JSON.stringify(raw);
  } else {
    combined = String(error ?? "");
  }

  const quotaLimited =
    /429|RESOURCE_EXHAUSTED|"code"\s*:\s*429|quota\s+exceeded|generate_content_free_tier|GenerateRequestsPerDay|rate\s*limits?/i.test(
      combined
    );

  if (quotaLimited) {
    return {
      status: 429,
      errorBody: QUOTA_FRIENDLY_CHAT_MESSAGE,
    };
  }

  return {
    status: 500,
    errorBody:
      "Curate Assistant bumped into something unexpected on our side. Please try again in a moment—we're grateful for your patience.",
  };
}

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
- Do not reply with only the Jane booking portal link when the user says they want to book, reschedule, schedule, or get an appointment: they need guiding questions first (handled by structured booking); only add that link alongside helpful next steps after service and location are clarified.
- For availability questions, ask for the service and date if either is missing. Do not say we have no real-time availability.
- If the user's message implies booking or scheduling and they already stated a preferred date or location, defer to structured booking flow; never replace it with generic portal directions only.
- If the answer is not in the context, say you do not have that detail and suggest contacting Curate Health.
- Do not diagnose, prescribe, or replace professional medical advice.
- For urgent or emergency symptoms, advise the user to seek immediate medical care.
- When useful, point users to the most relevant Curate Health page or contact detail from the context.
- Do not expose raw Sanity, CDN, PDF, image, or file asset URLs. Link to public website pages instead. For cafe menu questions, use ${BASEURL}/cafe.
- Booking: when someone mentions only a broad modality (massage, chiro, etc.), ask which exact Jane offering (specific treatment plus duration variant) matches their goal before implying live availability—the canonical appendix lists valid titles.

Jane session appendix (canonical Eglinton book-by-session offerings):
${janeBookingCatalogMarkdown()}

Brand context:
${context}`;
}

function sanitizeAssistantMessage(message: string) {
  return message
    .replace(INTERNAL_ASSET_URL_PATTERN, `${BASEURL}/cafe`)
    .replace(LEGACY_PATIENT_PORTAL_URL_PATTERN, CANONICAL_BOOKING_URL);
}

function shouldFallbackToGroq(error: unknown) {
  const msg =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");

  return /429|RESOURCE_EXHAUSTED|quota\s+exceeded|rate\s*limits?|timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND|socket|503|502|504/i.test(
    msg
  );
}

async function generateTextWithGeminiOrGroq(input: {
  ai: GoogleGenAI;
  geminiModel: string;
  geminiContents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"];
  geminiConfig?: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"];
  groqSystemInstruction?: string;
  groqMessages: Array<{ role: "user" | "assistant"; content: string }>;
  groqTemperature?: number;
  groqMaxTokens?: number;
  groqJsonMode?: boolean;
}) {
  try {
    const response = await input.ai.models.generateContent({
      model: input.geminiModel,
      contents: input.geminiContents,
      ...(input.geminiConfig ? { config: input.geminiConfig } : {}),
    });
    const text = response.text?.trim();
    if (!text) throw new Error("Gemini returned empty response.");
    return text;
  } catch (error) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || !shouldFallbackToGroq(error)) {
      throw error;
    }

    const groqModel = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
    const groqMessages = [
      ...(input.groqSystemInstruction
        ? [{ role: "system" as const, content: input.groqSystemInstruction }]
        : []),
      ...input.groqMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    return await groqChatCompletion({
      apiKey: groqKey,
      model: groqModel,
      messages: groqMessages,
      temperature: input.groqTemperature ?? 0.3,
      maxTokens: input.groqMaxTokens ?? 1024,
      ...(input.groqJsonMode ? { responseFormat: { type: "json_object" } } : {}),
    });
  }
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

  if (/\bflowpresso\b/.test(text)) return "Flowpresso";

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
  if (
    /\b(psychotherapy|psychotherapist|counsel(?:l)?(?:ing|or)|mental\s+health)\b/i.test(
      text
    )
  ) {
    return "Individual Psychotherapy Session (60-minute) (in person)";
  }

  return undefined;
}

function inferServiceCategory(conversationText: string) {
  const text = conversationText.toLowerCase();

  if (/\bflowpresso\b/.test(text)) return "Flowpresso";
  if (
    /\brecovery\s+sanctuary|cold\s+plunge|pilates\s+class|mat\s+pilates|\byoga\s+class|\bsauna\b|\bgroup of \d/.test(
      text
    )
  ) {
    return "Recovery Sanctuary Classes";
  }
  if (
    /\bcustom\s+orthotics|compression\s+stock|recasting\s+custom|customized\s+orthotics|orthotics\s+fitting/i.test(
      text
    )
  )
    return "Custom Products";
  if (
    /\bpersonal\s+training|\bfitness\s+assessment|\bfitness\s+training\b/.test(text)
  )
    return "Personal Training";

  if (/(chiro|chiropractic|chiropractor)/.test(text)) return "Chiropractic";
  if (/(massage|rmt)/.test(text)) return "Registered Massage Therapy";
  if (/(physio|physiotherapy)/.test(text)) return "Physiotherapy";
  if (/(naturopath|naturopathic)/.test(text)) return "Naturopathic Medicine";
  if (
    /\bpsychotherapy\b|\bpsychotherapist\b|\bcounsel(?:l)?(?:ing|or)\b|\bmental\s+health\b|\bcouples therapy\b|\bcbt\b/.test(
      text
    )
  ) {
    return "Psychotherapy";
  }

  return undefined;
}

function inferLocation(conversationText: string): JaneLocation | undefined {
  const text = conversationText.toLowerCase();

  if (/\b(downtown|777|bay\s+street|bay\s*st)\b/.test(text)) return "downtown";
  if (
    /\b(eglinton|989|york|uptown|midtown|main clinic|curate health clinic|glinton)\b/.test(
      text
    ) ||
    /\b(the )?one on eg\b|location on eg|choose eglinton|picked eglinton/.test(text)
  ) {
    return "eglinton";
  }

  return undefined;
}

function inferLocationFromUserMessages(messages: ChatMessage[]): JaneLocation | undefined {
  const userOnly = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  return inferLocation(userOnly);
}

function applyJaneIntentEnrichment(
  messages: ChatMessage[],
  intent: AvailabilityIntent,
  routedJaneServiceName?: string | null
): AvailabilityIntent {
  let next = { ...intent };
  const routedExact =
    routedJaneServiceName?.trim() &&
    isExactJaneOfferingName(routedJaneServiceName.trim())
      ? routedJaneServiceName.trim()
      : undefined;
  const exact = routedExact ?? inferExactJaneOfferingFromMessages(messages);
  if (exact) {
    next.serviceName = exact;
    const cat = categoryForOffering(exact);
    if (!next.serviceCategory && cat) {
      next.serviceCategory = cat;
    }
  }

  const latest =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";

  const wizardDateContinuation =
    assistantPromptedBookingWizardDate(messages) &&
    Boolean(inferLocationFromUserMessages(messages)) &&
    Boolean(inferExactJaneOfferingFromMessages(messages)) &&
    Boolean(parseRequestedDate(latest) ?? parseRequestedDates(latest)?.length);

  if (!wizardDateContinuation) {
    return next;
  }

  next.wantsAvailability = true;
  const multi = parseRequestedDates(latest);
  const parsedSingle = parseRequestedDate(latest);
  next.date = parsedSingle ?? next.date ?? multi?.[0];
  next.dates = multi ?? (next.date ? [next.date] : next.dates);

  return next;
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
      const nameLc = option.name.toLowerCase();
      const extras = [
        option.duration &&
        !nameLc.includes(option.duration.replace(/\s+/g, "").toLowerCase())
          ? option.duration
          : null,
        option.price,
      ].filter(Boolean);

      return `${index + 1}. ${option.name}${extras.length ? ` · ${extras.join(" · ")}` : ""}`;
    })
    .join("\n");

  return [
    `${categoryName} (${location.label}):`,
    optionLines,
    "Reply with the option number plus a date (today, tomorrow, or YYYY-MM-DD).",
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
        /Which option would you like|reply with the option number/i.test(
          message.content
        )
    );

  const optionLine = previousOptionsMessage?.content
    .split("\n")
    .find((line) => line.trim().startsWith(`${optionNumber}.`));

  return optionLine?.replace(/^\s*\d+\.\s*/, "").trim();
}

function todayIsoInToronto() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

function extractRoutingJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  let body = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(body) as unknown;
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("No JSON object in router output");
    body = body.slice(start, end + 1);
    return JSON.parse(body) as unknown;
  }
}

function normalizeServiceCategory(
  raw: string | null | undefined
): string | undefined {
  if (!raw?.trim()) return undefined;
  const compact = raw.replace(/\s+/g, " ").trim();
  const allowed = [
    "Chiropractic",
    "Registered Massage Therapy",
    "Physiotherapy",
    "Naturopathic Medicine",
    "Psychotherapy",
    "Personal Training",
    "Recovery Sanctuary Classes",
    "Custom Products",
    "Flowpresso",
  ];
  if (allowed.includes(compact)) return compact;
  const slug = compact.toLowerCase();
  if (/chiro|spine/.test(slug)) return "Chiropractic";
  if (/massage|rmt|registered massage/.test(slug)) return "Registered Massage Therapy";
  if (/physio/.test(slug)) return "Physiotherapy";
  if (/naturopath/.test(slug)) return "Naturopathic Medicine";
  if (/flowpresso/.test(slug)) return "Flowpresso";
  if (
    /recovery|sanctuary|cold\s+plunge|pilates\s+class|mat\s+pilates|yoga\s+class|sanctuary\s+classes/.test(
      slug
    )
  )
    return "Recovery Sanctuary Classes";
  if (
    /\borthotics|compression stocking|compression stockings|compression stock\b|custom products/.test(slug)
  )
    return "Custom Products";
  if (/personal training|fitness training|fitness assessment/.test(slug))
    return "Personal Training";
  if (
    /psychotherapy|psychotherapist|\bpsychiatrist\b|counse?l(?:l)?ing|cognitive\s+behav(?:iour|ior)al/.test(slug)
  ) {
    return "Psychotherapy";
  }
  return undefined;
}

async function runIntentClassification(
  ai: GoogleGenAI,
  messages: ChatMessage[]
): Promise<AiRouting | null> {
  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
  try {
    const routerUserText = `${ROUTER_PROMPT}\n\n${janeBookingCatalogMarkdown()}\n\nToday in Toronto is ${todayIsoInToronto()} (YYYY-MM-DD).\n\n---\n\nConversation (oldest first):\n\n${transcript}`;

    const text = await generateTextWithGeminiOrGroq({
      ai,
      geminiModel: MODEL,
      geminiContents: [
        {
          role: "user",
          parts: [{ text: routerUserText }],
        },
      ],
      geminiConfig: {
        systemInstruction:
          "You output only compact JSON routing objects for Curate Health chat. Never add markdown or prose.",
        temperature: 0.1,
        maxOutputTokens: 256,
      },
      groqSystemInstruction:
        "You output only compact JSON routing objects for Curate Health chat. Never add markdown or prose.",
      groqMessages: [{ role: "user", content: routerUserText }],
      groqTemperature: 0.1,
      groqMaxTokens: 256,
      groqJsonMode: true,
    });

    if (!text) return null;

    const parsed = AiRoutingSchema.safeParse(extractRoutingJson(text));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function availabilityIntentFromRouting(
  routing: AiRouting,
  messages: ChatMessage[]
): AvailabilityIntent {
  const conversationText = messages.map((message) => message.content).join("\n");
  const userOnlyText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  const category =
    inferServiceCategory(userOnlyText) ??
    normalizeServiceCategory(routing.service_category ?? undefined) ??
    inferServiceCategory(conversationText);
  const trimmedJaneName = routing.jane_service_name?.trim();

  let serviceName: string | undefined =
    trimmedJaneName ||
    inferNumberedOptionServiceName(messages) ||
    inferServiceName(userOnlyText) ||
    inferServiceName(conversationText);
  const location =
    (routing.location as JaneLocation | undefined) ??
    inferLocationFromUserMessages(messages);

  let date: string | undefined;
  let dates: string[] | undefined;
  const isoCandidate = routing.date_iso?.trim();
  if (
    isoCandidate &&
    /^\d{4}-\d{2}-\d{2}$/.test(isoCandidate) &&
    DATE_PATTERN.test(isoCandidate)
  ) {
    date = isoCandidate;
    dates = [isoCandidate];
  }
  if (routing.prefer_this_week) {
    dates = parseRequestedDates("flexible this week any time") ?? dates;
  }
  date = date ?? parseRequestedDate(conversationText);
  if (!dates?.length && date) dates = [date];
  if (!dates?.length) dates = parseRequestedDates(conversationText);

  if (routing.intent === "booking_options") {
    return {
      wantsBooking: true,
      wantsAvailability: false,
      serviceCategory: category,
      serviceName:
        serviceName ??
        inferServiceName(userOnlyText) ??
        inferServiceName(conversationText),
      date,
      dates,
      location,
    };
  }

  /** check_availability */
  serviceName =
    trimmedJaneName ||
    inferNumberedOptionServiceName(messages) ||
    inferServiceName(userOnlyText) ||
    inferServiceName(conversationText);

  return {
    wantsBooking: false,
    wantsAvailability: true,
    serviceCategory:
      category ??
      inferServiceCategory(userOnlyText) ??
      inferServiceCategory(conversationText),
    serviceName,
    date,
    dates,
    location,
  };
}

function getAvailabilityIntent(messages: ChatMessage[]): AvailabilityIntent {
  const latest = messages[messages.length - 1]?.content ?? "";
  const latestNormalized = latest.trim().toLowerCase();

  const latestSignalsRestartBooking =
    /\b(start over|restart|reset)\b/i.test(latestNormalized) ||
    /\b(another|different|new)\s+(service|appointment|booking)\b/i.test(
      latestNormalized
    ) ||
    /\b(change|switch)\s+(service|appointment|booking)\b/i.test(
      latestNormalized
    ) ||
    /\blet'?s\s+try\s+another\s+service\b/i.test(latestNormalized) ||
    /\btry\s+another\s+service\b/i.test(latestNormalized);

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
  /** Assistant asked what to book after the user expressed a booking/time intent */
  const assistantAskedWhichServiceForBooking = messages.some(
    (message) =>
      message.role === "assistant" &&
      /\b(which|what)\s+service\b.*\b(book|appointment|interested)\b|service you(?:'re| are) interested|let us know which service|what would you like to book/i.test(
        message.content
      )
  );
  const userExpressedBookingOrTimeIntent = /\b(book|booking|schedule|appointment|reserve|availability|tomorrow|today|\d{4}-\d{2}-\d{2})\b/i.test(
    userText
  );
  const wantsBookingFromServiceFollowUp =
    assistantAskedWhichServiceForBooking &&
    userExpressedBookingOrTimeIntent &&
    Boolean(latestServiceCategory ?? inferServiceCategory(latest));
  /** Service named in latest message OR earlier in thread (scoped before combined serviceName below) */
  const bookingServiceHints =
    latestServiceCategory ??
    latestServiceName ??
    conversationServiceCategory ??
    conversationServiceName;
  const latestBookingWithServiceHints =
    /\b(book|booking|schedule|appointment|reserve)\b/i.test(latest) &&
    Boolean(latestServiceCategory ?? latestServiceName);
  const latestRequestsGenericBookingIntent =
    !/\b(cancel|cancellation|reschedul|reschedule)\b/i.test(latest) &&
    (/\b(i |we )?(want|need|would like|love|am looking|trying) to (book|schedule|make|get|set up)\b/i.test(
      latest
    ) ||
      /\b(book|schedule|make|get) (an |a )?appointment\b/i.test(latest) ||
      /\bcan i (book|schedule|make an appointment)\b/i.test(latest) ||
      /\b(how (do|can) i) book\b/i.test(latest));
  const latestRequestsBooking =
    latestBookingWithServiceHints ||
    wantsBookingFromServiceFollowUp ||
    (latestRequestsGenericBookingIntent && !bookingServiceHints);
  const mentionsAvailabilityPhrase =
    /\b(availabilit\w+|available|running open|opening|openings?\b|\bslots?\b|free times?\b|\bappointment times?\b)\b/i.test(
      latest
    );
  /** "availability" typo (availabilty) matches availabilit\\w+ */
  const latestRequestsAvailabilityBare = mentionsAvailabilityPhrase;
  const latestRequestsAvailability =
    latestRequestsAvailabilityBare &&
    (/\b(show|check|see|what|when|any|tell|know|want|give|find|can you)\b/i.test(
      latest
    ) ||
      mentionsAvailabilityPhrase);
  const earlierUserRequestedAvailability =
    /\b(availabilit\w+|available|openings?\b|\bslots?\b)\b/i.test(userText);
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
      /reply with the option number|Which option would you like|what date/i.test(
        message.content
      )
  );
  /** Prior turn asked user to pick Eglinton vs Downtown (structured or LLM wording) */
  const assistantAskedPickLocationForBooking = messages.some(
    (message) =>
      message.role === "assistant" &&
      /which\s+location|what\s+location|where\s+would\s+you\s+like\b/i.test(
        message.content
      ) &&
      /\beglinton\b/i.test(message.content) &&
      /\b(downtown|bay|777)/i.test(message.content)
  );
  const latestAnswersPendingAvailabilityDate =
    Boolean(latestDates?.length) &&
    (earlierUserRequestedAvailability || assistantAskedForOptionAndDate) &&
    assistantAskedForDate;
  const latestAnswersPendingOptionAndDate =
    Boolean(latestServiceName) &&
    Boolean(latestDates?.length) &&
    assistantAskedForOptionAndDate;
  const parsedConversationDate =
    parseRequestedDate(conversationText) ?? parseRequestedDates(conversationText)?.[0];
  const bookingThreadHasServiceLocationAndDate =
    Boolean(conversationServiceName) &&
    Boolean(inferLocation(userText)) &&
    Boolean(parsedConversationDate);
  const latestCompletesLocationAfterLocationPrompt =
    Boolean(latestLocation) &&
    assistantAskedPickLocationForBooking &&
    Boolean(conversationServiceName ?? conversationServiceCategory);
  const latestAvailabilityContinuationWithContext =
    latestRequestsAvailabilityBare &&
    Boolean(conversationServiceName) &&
    Boolean(inferLocation(userText));
  const wantsAvailabilityTriggeredByDatePlusCare =
    bookingThreadHasServiceLocationAndDate &&
    (mentionsAvailabilityPhrase ||
      latestRequestsAvailabilityBare ||
      earlierUserRequestedAvailability);
  const latestAnswersPendingAvailabilityLocation =
    Boolean(latestLocation) &&
    earlierUserRequestedAvailability &&
    assistantAskedPickLocationForBooking;
  const wantsAvailability =
    latestRequestsAvailability ||
    latestAnswersPendingAvailabilityDate ||
    latestAnswersPendingOptionAndDate ||
    latestAnswersPendingAvailabilityLocation ||
    latestSwitchesServiceInAvailabilityFlow ||
    latestCompletesLocationAfterLocationPrompt ||
    latestAvailabilityContinuationWithContext ||
    wantsAvailabilityTriggeredByDatePlusCare;
  const serviceName = latestServiceName ?? conversationServiceName;
  const location =
    latestLocation ??
    (latestSwitchesServiceInAvailabilityFlow
      ? undefined
      : inferLocation(userText));

  if (latestSignalsRestartBooking) {
    return {
      wantsAvailability: false,
      wantsBooking: true,
      serviceCategory: undefined,
      serviceName: undefined,
      date: undefined,
      dates: undefined,
      location,
    };
  }

  return {
    wantsAvailability,
    wantsBooking:
      latestRequestsBooking ||
      (latestRequestsGenericBookingIntent && Boolean(bookingServiceHints)),
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

function tryJaneSessionClarificationReply(
  routed: AiRouting | null,
  availabilityIntent: AvailabilityIntent,
  messages: ChatMessage[]
): string | null {
  if (
    !availabilityIntent.wantsBooking &&
    !availabilityIntent.wantsAvailability
  ) {
    return null;
  }

  const userOnlyText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  const category =
    availabilityIntent.serviceCategory ??
    inferServiceCategory(userOnlyText);

  if (!category) return null;

  if (
    !needsJaneSessionPick({
      category,
      userMessagesCombined: userOnlyText,
      routerJaneServiceName: routed?.jane_service_name ?? null,
      numberedPickName: inferNumberedOptionServiceName(messages),
    })
  ) {
    return null;
  }

  return sessionClarificationMessage(category);
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
    const ai = new GoogleGenAI({ apiKey });
    const heuristic = getAvailabilityIntent(messages);
    const routed = await runIntentClassification(ai, messages);
    const heuristicFallback = routed == null ? heuristic : null;

    // Hard reset: if the user explicitly asks to restart/change services, return booking wizard
    // immediately (do not reuse earlier service/category inference from the thread).
    if (RESTART_BOOKING_PATTERN.test(latestUserMessage.content.trim())) {
      const inferredLocation = inferLocationFromUserMessages(messages);
      const supportedLocations: JaneLocation[] = ["eglinton", "downtown"];

      if (!inferredLocation) {
        return NextResponse.json({
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
        });
      }

      return NextResponse.json({
        message:
          inferredLocation === "downtown"
            ? "Downtown offers chiropractic visits. Choose a session type, or book other services at Eglinton."
            : "What type of appointment are you booking?",
        bookingPicker: {
          step: "modality",
          choices:
            inferredLocation === "downtown"
              ? BOOKING_MODALITY_CHOICES.filter((c) => c.label === "Chiropractic")
              : BOOKING_MODALITY_CHOICES,
        },
      });
    }

    const useGeneralChat =
      (routed?.intent === "general" &&
        !heuristic.wantsBooking &&
        !heuristic.wantsAvailability) ||
      (!routed && !heuristic.wantsBooking && !heuristic.wantsAvailability);

    if (useGeneralChat) {
      const context = await getBrandAiContext();
      const systemInstruction = buildSystemInstruction(context);
      const message = await generateTextWithGeminiOrGroq({
        ai,
        geminiModel: MODEL,
        geminiContents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        geminiConfig: {
          systemInstruction,
          temperature: 0.3,
        },
        groqSystemInstruction: systemInstruction,
        groqMessages: messages.map((m) => ({ role: m.role, content: m.content })),
        groqTemperature: 0.3,
        groqMaxTokens: 1024,
      });

      if (!message) {
        return NextResponse.json(
          { error: "Curate Assistant could not generate a response." },
          { status: 502 }
        );
      }

      return NextResponse.json({ message: sanitizeAssistantMessage(message) });
    }

    let availabilityIntent: AvailabilityIntent =
      routed && routed.intent !== "general"
        ? availabilityIntentFromRouting(routed, messages)
        : (heuristicFallback ?? heuristic ?? {
            wantsAvailability: false,
            wantsBooking: false,
          });

    availabilityIntent = applyJaneIntentEnrichment(
      messages,
      availabilityIntent,
      routed?.jane_service_name ?? null
    );

    const userOnlyText = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n");

    const mergedCategory =
      availabilityIntent.serviceCategory ??
      inferServiceCategory(userOnlyText) ??
      normalizeServiceCategory(routed?.service_category ?? undefined);

    const wizardReply = buildBookingWizardReply({
      messages,
      availabilityIntent,
      routedLocation: routed?.location ?? null,
      inferLocationFromUserMessages,
      mergedCategory,
      mergedServiceName: availabilityIntent.serviceName,
      mergedDates:
        availabilityIntent.dates ??
        (availabilityIntent.date ? [availabilityIntent.date] : undefined),
      inferNumberedOptionServiceName,
      routedJaneServiceName: routed?.jane_service_name ?? null,
    });

    if (wizardReply) {
      return NextResponse.json(wizardReply);
    }

    const sessionClarify = tryJaneSessionClarificationReply(
      routed,
      availabilityIntent,
      messages
    );

    if (sessionClarify) {
      return NextResponse.json({ message: sessionClarify });
    }

    const datesToCheck = availabilityIntent.dates?.length
      ? availabilityIntent.dates
      : availabilityIntent.date
        ? [availabilityIntent.date]
        : [];

    const exactJaneService =
      availabilityIntent.serviceName?.trim() &&
      isExactJaneOfferingName(availabilityIntent.serviceName.trim())
        ? availabilityIntent.serviceName.trim()
        : undefined;

    const bookingAsksJaneSlots =
      availabilityIntent.wantsBooking &&
      Boolean(exactJaneService && datesToCheck.length);

    if (
      availabilityIntent.wantsBooking &&
      availabilityIntent.serviceCategory &&
      !exactJaneService
    ) {
      const supportedLocations = getSupportedLocationsForService(
        availabilityIntent.serviceName ?? availabilityIntent.serviceCategory
      );
      const resolvedLocationKey =
        availabilityIntent.location ??
        inferLocationFromUserMessages(messages) ??
        routed?.location ??
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

    if (availabilityIntent.wantsAvailability || bookingAsksJaneSlots) {
      const resolvedServiceName = exactJaneService ?? availabilityIntent.serviceName;

      if (!resolvedServiceName) {
        return NextResponse.json({
          message:
            "I can check availability for you. Which service would you like to book?",
        });
      }

      const supportedLocations = getSupportedLocationsForService(resolvedServiceName);
      const resolvedLocationKey =
        inferLocationFromUserMessages(messages) ??
        availabilityIntent.location ??
        routed?.location ??
        (supportedLocations.length === 1 ? supportedLocations[0] : undefined);

      if (!resolvedLocationKey) {
        return NextResponse.json({
          message: `Which location would you like to check: ${formatLocationOptions(
            supportedLocations
          )}?`,
        });
      }

      if (
        !serviceIsAvailableAtLocation(resolvedServiceName, resolvedLocationKey)
      ) {
        return NextResponse.json({
          message: `${resolvedServiceName} is available through ${formatLocationOptions(
            supportedLocations
          )}. Would you like me to check that location?`,
        });
      }

      if (!datesToCheck.length) {
        return NextResponse.json({
          message:
            "I can check real-time availability for that. What date would you like me to check? Please send it as YYYY-MM-DD, or say today/tomorrow.",
        });
      }

      const location = JANE_LOCATIONS[resolvedLocationKey];
      let availability: Awaited<typeof getCachedJaneAvailability>;
      try {
        availability = await getCachedJaneAvailability({
          bookingUrl: location.bookingUrl,
          serviceName: resolvedServiceName,
          date: datesToCheck[0],
          limit: 8,
        });
      } catch {
        return NextResponse.json({
          message: `I tried checking Jane for ${resolvedServiceName} at ${location.label}, but I couldn't load the live booking slots just now. You can book directly here: ${location.bookingUrl}`,
        });
      }

      for (const date of datesToCheck.slice(1)) {
        if (availability.slots.length) break;

        try {
          availability = await getCachedJaneAvailability({
            bookingUrl: location.bookingUrl,
            serviceName: resolvedServiceName,
            date,
            limit: 8,
          });
        } catch {
          return NextResponse.json({
            message: `I tried checking Jane for ${resolvedServiceName} at ${location.label}, but I couldn't load the live booking slots just now. You can book directly here: ${location.bookingUrl}`,
          });
        }
      }

      return NextResponse.json({
        message: formatSlotsResponse({
          ...availability,
          location: location.label,
          bookingUrl: availability.bookingUrl ?? location.bookingUrl,
        }),
      });
    }

    console.warn(
      "brand-chat POST: routed Jane intent without actionable branch; falling back to model"
    );
    const context = await getBrandAiContext();
    const systemInstruction = buildSystemInstruction(context);
    const message = await generateTextWithGeminiOrGroq({
      ai,
      geminiModel: MODEL,
      geminiContents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      geminiConfig: {
        systemInstruction,
        temperature: 0.3,
      },
      groqSystemInstruction: systemInstruction,
      groqMessages: messages.map((m) => ({ role: m.role, content: m.content })),
      groqTemperature: 0.3,
      groqMaxTokens: 1024,
    });

    if (!message) {
      return NextResponse.json(
        { error: "Curate Assistant could not generate a response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: sanitizeAssistantMessage(message) });
  } catch (error) {
    console.error("Brand chat failed", error);
    const { status, errorBody } = friendlyBrandChatFailure(error);

    return NextResponse.json({ error: errorBody }, { status });
  }
}
