"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Calendar, Loader2, MessageCircle, Send, X } from "lucide-react";

import {
  BOOKING_MODALITY_CHOICES,
  type BookingPickerPayload,
} from "@/lib/booking-wizard";
import { JANE_EGLINTON_OFFERINGS_BY_CATEGORY } from "@/lib/jane-service-catalog";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  bookingPicker?: BookingPickerPayload;
};

const HIDDEN_PATH_PREFIXES = ["/studio"] as const;
const HIDDEN_PATHS = new Set(["/login", "/coming-soon"]);

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am the Curate Health assistant. Ask me about services, practitioners, the cafe, or how to contact the clinic.",
  },
];
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g;

type AssistLoadingTone =
  | "booking_slots"
  | "booking_flow"
  | "cafe_contact"
  | "team_wellness"
  | "general";

const ASSIST_LOADING_LINES: Record<AssistLoadingTone, readonly string[]> = {
  booking_slots: [
    "Checking Jane for open times across our clinics…",
    "Finding openings that fit your visit at Curate…",
    "Scanning today's schedule—we'll share what Jane shows shortly…",
    "Connecting you to real-time bookings at Curate Health…",
  ],
  booking_flow: [
    "Rounding out your booking with Curate—we're on it…",
    "Pairing what you chose with how we schedule care here…",
    "Aligning location, modality, and session—our favourite puzzle…",
    "Getting your next booking step lined up behind the scenes…",
  ],
  cafe_contact: [
    "Pulling up Curate Café and how to reach the clinic…",
    "Fetching the hospitable details—menus, bites, contact, or hours…",
    "Grounding your question in what's on-site at Curate Toronto…",
  ],
  team_wellness: [
    "Searching how our multidisciplinary team can support Whole Health…",
    "Connecting your question with Curate practitioners and services…",
    "Curating insight from how we practise integrative care together…",
  ],
  general: [
    "Grounding our reply in Curate Health's approach to care…",
    "Thinking with you—calm, concise, centred on Whole Health…",
    "Gathering thoughtful context from what's true at Curate today…",
    "Letting Curate Assistant warm up—almost ready for you…",
  ],
};

function inferAssistLoadingTone(messages: ChatMessage[]): AssistLoadingTone {
  const latestUser =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";
  const u = latestUser.toLowerCase();
  const thread = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.toLowerCase())
    .join("\n");

  const lastAssistant =
    [...messages].reverse().find((message) => message.role === "assistant")
      ?.content ?? "";

  const hasBookingThread =
    /\b(book(?:ing)?|schedule|appointment|availability|opening|slots?|jane|989|777\b|bay\s*(?:st|street)|curate\s+health)\b/i.test(
      thread + "\n" + latestUser.toLowerCase()
    );

  const hasIsoDate = /\b\d{4}-\d{2}-\d{2}\b/.test(latestUser);
  const hasRelativeDate = /\b(today|tomorrow|flexible|this\s+week)\b/i.test(u);
  const assistantAskedBookingDate = /\bpick a date for your visit\b/i.test(
    lastAssistant
  );

  const likelySlotCheck =
    hasBookingThread &&
    (hasIsoDate || hasRelativeDate || assistantAskedBookingDate);

  const sessionLike =
    /\(\s*\d+\s*[-–]?\s*(?:minute|min)/i.test(latestUser) ||
    /\b(fitness\s+training|massage\s+therapy|massage\s+therapy\s+session|chiropractic|physiotherapy|naturopathic|psychotherapy)\b/i.test(
      latestUser.toLowerCase()
    );

  if (likelySlotCheck) {
    return "booking_slots";
  }

  if (
    /\b(eglinton|downtown|989\b|777\b|midtown|uptown|rmt|\bmassage\b|personal\s+training|recovery\s+sanctuary|flowpresso)\b/i.test(
      thread + "\n" + u
    ) ||
    sessionLike
  ) {
    return hasBookingThread ? "booking_flow" : "general";
  }

  if (
    /\b(book|booking|schedule|appointment|availabilit|opening|slots?)\b/i.test(
      u
    )
  ) {
    return "booking_flow";
  }

  if (/\b(availabilit|opening|slots?|when\s*can)\b/i.test(u)) {
    return "booking_slots";
  }

  if (
    /\b(cafe|coffee|latte|espresso|matcha|menu|pastry|toastie|sip|bite|brunch)\b/i.test(
      u
    ) ||
    /\b(contact|call|phone|email|hours|directions|park|reach)\b/i.test(u)
  ) {
    return "cafe_contact";
  }

  if (
    /\b(practitioner|therapist|\brmt\b|physio|physiotherapist|doctors?|chiropractor|\bstaff\b|\bwho\s+(?:is|'s|'s\s+the))\b/i.test(
      u + thread
    )
  ) {
    return "team_wellness";
  }

  return "general";
}

function useAssistLoadingLine(isSending: boolean, messages: ChatMessage[]) {
  const tone = inferAssistLoadingTone(messages);
  const phrases = ASSIST_LOADING_LINES[tone];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isSending) {
      setIndex(0);
      return undefined;
    }
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % phrases.length);
    }, 2200);

    return () => window.clearInterval(id);
  }, [isSending, phrases.length, tone]);

  return phrases[index % phrases.length];
}

function shouldHideChatbot(pathname: string | null): boolean {
  if (!pathname) return false;
  if (HIDDEN_PATHS.has(pathname)) return true;
  return HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function createMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function getLatestBookingPicker(messages: ChatMessage[]) {
  return [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.bookingPicker)?.bookingPicker;
}

function labelIncludesDowntown(label: string) {
  return /\b(downtown|777\b|bay\s+st|bay\s+street)\b/i.test(label);
}

function labelIncludesEglinton(label: string) {
  return /\b(eglinton|989\b|eglint(?:on)?\s+ave)\b/i.test(label);
}

function normalizeLocationFromLabel(
  label: string
): "eglinton" | "downtown" | null {
  if (labelIncludesDowntown(label)) return "downtown";
  if (labelIncludesEglinton(label)) return "eglinton";
  return null;
}

function isChiropracticLabel(label: string) {
  return /\bchiropractic\b/i.test(label);
}

function shouldRestartBookingWizard(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;

  return (
    /\b(start over|restart|reset)\b/i.test(t) ||
    /\b(another|different|new)\s+(service|appointment|booking)\b/i.test(t) ||
    /\b(change|switch)\s+(service|appointment|booking)\b/i.test(t) ||
    /\blet'?s\s+try\s+another\s+service\b/i.test(t) ||
    /\btry\s+another\s+service\b/i.test(t)
  );
}

function inferLocationFromThread(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .reverse()
    .map(normalizeLocationFromLabel)
    .find(Boolean);
}

function buildLocalNextPicker(args: {
  currentStep: BookingPickerPayload["step"];
  choiceLabel: string;
  previousMessages: ChatMessage[];
}): { assistantText: string; bookingPicker: BookingPickerPayload } | null {
  const { currentStep, choiceLabel, previousMessages } = args;
  const previousPicker = getLatestBookingPicker(previousMessages);

  // Location -> Modality
  if (currentStep === "location") {
    const loc = normalizeLocationFromLabel(choiceLabel);
    const isDowntown = loc === "downtown";

    const choices = isDowntown
      ? BOOKING_MODALITY_CHOICES.filter((c) => c.label === "Chiropractic")
      : BOOKING_MODALITY_CHOICES;

    return {
      assistantText: isDowntown
        ? "Downtown offers chiropractic visits. Choose a session type, or book other services at Eglinton."
        : "What type of appointment are you booking?",
      bookingPicker: { step: "modality", choices },
    };
  }

  // Modality -> Session (or Downtown conflict handling)
  if (currentStep === "modality") {
    const pickedModality = choiceLabel.trim();

    // If they came from a "downtown chiropractic only" modality list, offer chiro sessions.
    const loc = inferLocationFromThread(previousMessages) ?? null;

    if (loc === "downtown" && !isChiropracticLabel(pickedModality)) {
      return {
        assistantText: `${pickedModality} is booked at our Eglinton clinic. Downtown (777 Bay) is chiropractic-only. Choose how you would like to continue:`,
        bookingPicker: {
          step: "location",
          choices: [
            {
              id: "continue-eglinton",
              label: `Book ${pickedModality} at Curate Health Eglinton (989 Eglinton Ave W)`,
            },
            {
              id: "downtown-chiro",
              label: "Book Chiropractic at Curate Health Downtown (777 Bay St)",
            },
          ],
        },
      };
    }

    const offerings = JANE_EGLINTON_OFFERINGS_BY_CATEGORY[pickedModality] ?? [];

    if (offerings.length >= 2) {
      return {
        assistantText: `Pick the exact ${pickedModality} session you want:`,
        bookingPicker: {
          step: "session",
          modalityLabel: pickedModality,
          choices: offerings.map((name) => ({
            id: `session:${name}`,
            label: name,
          })),
        },
      };
    }

    // If a modality somehow has 0-1 offerings, fall through and let server handle.
    return null;
  }

  // Session -> Date
  if (currentStep === "session") {
    const modality = previousPicker?.modalityLabel;
    const session = choiceLabel.trim();

    return {
      assistantText: modality
        ? `Pick a date for your ${modality} visit. Use the quick buttons, calendar, or type today, tomorrow, YYYY-MM-DD, or flexible this week.`
        : "Pick a date for your visit. Use the quick buttons, calendar, or type today, tomorrow, YYYY-MM-DD, or flexible this week.",
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

  // Date selection should go to server (availability scrape).
  return null;
}

function renderMessageContent(content: string, isUserMessage: boolean) {
  return content.split(URL_PATTERN).map((part, index) => {
    if (!part.match(/^https?:\/\//)) {
      return part.split(BOLD_PATTERN).map((textPart, textIndex) => {
        if (!textPart.startsWith("**") || !textPart.endsWith("**")) {
          return textPart;
        }

        return (
          <strong
            key={`${textPart}-${index}-${textIndex}`}
            className="font-semibold"
          >
            {textPart.slice(2, -2)}
          </strong>
        );
      });
    }

    const trailingPunctuation = part.match(/[.,!?;:]+$/)?.[0] ?? "";
    const href = trailingPunctuation
      ? part.slice(0, -trailingPunctuation.length)
      : part;

    return (
      <span key={`${href}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "font-medium underline underline-offset-2 [overflow-wrap:anywhere]",
            isUserMessage
              ? "text-primary-foreground"
              : "text-primary hover:text-primary/80"
          )}
        >
          {href}
        </a>
        {trailingPunctuation}
      </span>
    );
  });
}

/** Local YYYY-MM-DD for `input type="date"` min — close enough vs Toronto timezone for UX. */
function todayIsoCalendar(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

export function BrandChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  const assistLoadingLine = useAssistLoadingLine(isSending, messages);

  if (shouldHideChatbot(pathname)) return null;

  async function submitChatPayload(messagesForApi: ChatMessage[]) {
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/brand-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForApi.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      let data: { message?: string; error?: string; bookingPicker?: unknown } =
        {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      const errText = typeof data.error === "string" ? data.error : "";

      if (!response.ok) {
        if (response.status === 429 && errText) {
          setMessages((currentMessages) => [
            ...currentMessages,
            createMessage("assistant", errText),
          ]);
          setError("");
          return;
        }
        throw new Error(errText || "Unable to get a response.");
      }

      if (!data.message) {
        throw new Error(errText || "Unable to get a response.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          ...createMessage("assistant", data.message ?? ""),
          ...(data.bookingPicker
            ? {
                bookingPicker: data.bookingPicker as BookingPickerPayload,
              }
            : {}),
        },
      ]);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Curate Assistant is unavailable right now.";

      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  const activeBookingPickerStep = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.bookingPicker)
    ?.bookingPicker?.step;

  /** Location / modality / session steps are chip-only; date step allows typing + calendar */
  const pickerBlocksTyping =
    Boolean(activeBookingPickerStep && activeBookingPickerStep !== "date") &&
    !isSending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question || isSending || pickerBlocksTyping) return;

    if (shouldRestartBookingWizard(question)) {
      const userMessage = createMessage("user", question);
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      await submitChatPayload(nextMessages);
      return;
    }

    const userMessage = createMessage("user", question);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    await submitChatPayload(nextMessages);
  }

  async function handleBookingPickerChoice(
    assistantMessageId: string,
    label: string
  ) {
    if (isSending) return;

    const source = messages.find((m) => m.id === assistantMessageId);
    const currentStep = source?.bookingPicker?.step;

    const stripped = messages.map((msg) =>
      msg.id === assistantMessageId ? { ...msg, bookingPicker: undefined } : msg
    );

    const userMessage = createMessage("user", label);
    const nextMessages = [...stripped, userMessage];

    // For wizard chip steps, advance locally without calling the API.
    if (currentStep && currentStep !== "date") {
      const localNext = buildLocalNextPicker({
        currentStep,
        choiceLabel: label,
        previousMessages: messages,
      });

      if (localNext) {
        setMessages([
          ...nextMessages,
          {
            ...createMessage("assistant", localNext.assistantText),
            bookingPicker: localNext.bookingPicker,
          },
        ]);
        return;
      }
    }

    // Date selection (or unexpected cases) triggers a single API call for availability / next steps.
    setMessages(nextMessages);
    await submitChatPayload(nextMessages);
  }

  function handleExitBookingWizard(assistantMessageId: string) {
    if (isSending) return;

    const stripped = messages.map((msg) =>
      msg.id === assistantMessageId ? { ...msg, bookingPicker: undefined } : msg
    );

    setError("");
    setMessages([
      ...stripped,
      createMessage("user", "Exit booking"),
      createMessage(
        "assistant",
        "No problem — booking steps are closed. What can I help you with?"
      ),
    ]);
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-3 md:bottom-6 md:left-6">
      {isOpen ? (
        <section
          className="flex h-[min(38rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden border border-primary/15 bg-white text-slate-950 shadow-2xl"
          aria-label="Curate Health chat assistant"
        >
          <div className="flex items-start justify-between gap-4 bg-primary p-4 text-primary-foreground">
            <div>
              <p className="text-sm font-semibold">Curate Assistant</p>
              <p className="mt-1 text-xs opacity-85">
                Brand and service questions
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close Curate Assistant"
              onClick={() => setIsOpen(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="min-w-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "min-w-0 max-w-[85%] overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-950"
                )}
              >
                <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {renderMessageContent(
                    message.content,
                    message.role === "user"
                  )}
                </p>
                {message.role === "assistant" &&
                message.bookingPicker?.choices?.length ? (
                  <div
                    className="mt-3 flex flex-col gap-2 border-t border-slate-200/80 pt-3"
                    role="group"
                    aria-label={`Booking choices: ${message.bookingPicker.step}`}
                  >
                    {message.bookingPicker.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        disabled={isSending}
                        className={cn(
                          "rounded-xl border border-slate-300/90 bg-white px-3 py-2.5 text-left text-xs leading-snug text-slate-900 shadow-sm ring-offset-white transition hover:border-primary/35 hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:text-sm"
                        )}
                        onClick={() =>
                          handleBookingPickerChoice(message.id, choice.label)
                        }
                      >
                        {choice.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={isSending}
                      className={cn(
                        "mt-1 rounded-xl border border-destructive/30 bg-destructive px-3 py-2 text-left text-xs font-medium text-destructive-foreground shadow-sm ring-offset-white transition hover:bg-destructive/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:text-sm"
                      )}
                      onClick={() => handleExitBookingWizard(message.id)}
                    >
                      Exit booking
                    </button>
                    {message.bookingPicker.step === "date" ? (
                      <label
                        htmlFor={`curate-booking-date-${message.id}`}
                        className="flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-300/90 bg-white p-4 shadow-sm"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Calendar
                            className="size-5 shrink-0 text-slate-500"
                            aria-hidden
                          />
                          Choose a calendar day
                        </span>
                        <input
                          id={`curate-booking-date-${message.id}`}
                          type="date"
                          min={todayIsoCalendar()}
                          disabled={isSending}
                          className="box-border min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 [color-scheme:light] disabled:opacity-50"
                          onChange={(event) => {
                            const next = event.target.value;
                            if (next)
                              handleBookingPickerChoice(message.id, next);
                            event.target.blur();
                          }}
                        />
                      </label>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            {isSending ? (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="inline-flex max-w-full items-start gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-snug text-slate-600"
              >
                <Loader2
                  className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
                  aria-hidden
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {assistLoadingLine}
                </span>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {error ? (
            <p className="border-t border-destructive/20 px-4 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <form
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="curate-chat-message">
              Message Curate Assistant
            </label>
            <textarea
              id="curate-chat-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                pickerBlocksTyping
                  ? "Tap an option above"
                  : activeBookingPickerStep === "date"
                    ? "Optional: today, tomorrow…"
                    : "Ask about Curate Health..."
              }
              rows={1}
              className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-base placeholder:leading-normal placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSending || pickerBlocksTyping}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
              disabled={isSending || pickerBlocksTyping || !input.trim()}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="inline-flex items-center gap-2 border-2 border-white bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Curate Assistant" : "Open Curate Assistant"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MessageCircle className="size-5" aria-hidden />
        <span>{isOpen ? "Close" : "Ask Curate"}</span>
      </button>
    </div>
  );
}
