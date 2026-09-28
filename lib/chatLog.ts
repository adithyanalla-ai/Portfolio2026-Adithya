import "server-only";

/**
 * Sends each AI-chat exchange (visitor question + assistant answer) to Formspree so Adithya
 * can read what visitors ask and follow up. Override the form with FORMSPREE_CHAT_ENDPOINT.
 * No IP address or other identifiers are sent; visitors are told chats are saved.
 */
const ENDPOINT = process.env.FORMSPREE_CHAT_ENDPOINT || "https://formspree.io/f/mwlpakoj";

export type ChatLogEntry = {
  question: string;
  answer: string;
  /** "ai" (Claude), "local" (no key), "fallback" (API error, offline answer) */
  mode: string;
  /** Page the chat was opened on (from the Referer header) */
  page?: string | null;
  /** Number of turns in the conversation so far, including this question */
  turns: number;
  error?: string;
};

export async function logChat(entry: ChatLogEntry): Promise<void> {
  if (!entry.question.trim()) return;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Portfolio AI chat: ${entry.question.slice(0, 70)}`,
        question: entry.question,
        answer: entry.answer.slice(0, 6000),
        mode: entry.mode,
        page: entry.page ?? "",
        conversation_turns: entry.turns,
        error: entry.error ?? "",
        time: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`chat log: Formspree responded ${res.status}`);
  } catch (error) {
    console.error("chat log: could not reach Formspree", error);
  }
}
