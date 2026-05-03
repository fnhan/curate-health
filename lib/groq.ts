type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqChatCompletionInput = {
  apiKey: string;
  model: string;
  messages: GroqChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" } | undefined;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function groqChatCompletion(
  input: GroqChatCompletionInput
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      temperature: input.temperature ?? 0.3,
      max_tokens: input.maxTokens ?? 1024,
      ...(input.responseFormat ? { response_format: input.responseFormat } : {}),
    }),
  });

  const json = (await res.json().catch(() => null)) as
    | GroqChatCompletionResponse
    | null;

  if (!res.ok) {
    const message =
      json?.error?.message ||
      `Groq request failed with status ${res.status}.`;
    throw new Error(message);
  }

  const text = json?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) {
    throw new Error("Groq response was empty.");
  }

  return text;
}

