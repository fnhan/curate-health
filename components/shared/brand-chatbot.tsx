"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Loader2, MessageCircle, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
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

function shouldHideChatbot(pathname: string | null): boolean {
  if (!pathname) return false;
  if (HIDDEN_PATHS.has(pathname)) return true;
  return HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function renderMessageContent(content: string, isUserMessage: boolean) {
  return content.split(URL_PATTERN).map((part, index) => {
    if (!part.match(/^https?:\/\//)) {
      return part.split(BOLD_PATTERN).map((textPart, textIndex) => {
        if (!textPart.startsWith("**") || !textPart.endsWith("**")) {
          return textPart;
        }

        return (
          <strong key={`${textPart}-${index}-${textIndex}`} className="font-semibold">
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

  if (shouldHideChatbot(pathname)) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question || isSending) return;

    const userMessage = createMessage("user", question);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
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
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.message) {
        throw new Error(data.error || "Unable to get a response.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", data.message),
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

          <div className="min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed",
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
              </div>
            ))}
            {isSending ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Thinking...
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
              placeholder="Ask about Curate Health..."
              rows={1}
              className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSending}
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
              disabled={isSending || !input.trim()}
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
