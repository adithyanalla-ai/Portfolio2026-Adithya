"use client";

import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";
import { localAnswer } from "@/lib/localAnswer";
import { spring } from "@/lib/motion";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What do you do at Eject Solutions?",
  "Tell me about Aglier",
  "What is GBNI?",
  "What are your key skills?",
  "How can I contact you?",
];

/** Event other components can dispatch to open the chat: window.dispatchEvent(new Event("open-chat")) */
export const OPEN_CHAT_EVENT = "open-chat";

/**
 * Floating "Ask my AI" assistant. Answers on Adithya's behalf from his résumé via /api/chat
 * (streamed from Claude when a key is configured), falling back to offline answers built
 * from the same data if the API isn't available.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Hi, I'm ${site.shortName}'s AI assistant. Ask me about my work, projects, research or how to reach me.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setInput("");
      setBusy(true);
      const history: Msg[] = [...msgs, { role: "user", content: q }];
      setMsgs([...history, { role: "assistant", content: "" }]);
      const write = (text: string) =>
        setMsgs((cur) => {
          const next = cur.slice();
          next[next.length - 1] = { role: "assistant", content: text };
          return next;
        });
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // skip the greeting; the server trims to the last 10 turns
          body: JSON.stringify({ messages: history.slice(1) }),
        });
        if (!res.ok || !res.body) {
          write(res.status === 429 ? await res.text() : localAnswer(q));
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let text = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            write(text);
          }
          if (!text.trim()) write(localAnswer(q));
        }
      } catch {
        write(localAnswer(q)); // offline / static hosting
      } finally {
        setBusy(false);
      }
    },
    [busy, msgs],
  );

  return (
    <>
      <AnimatePresence>
        {open ? (
          <m.div
            key="chat"
            role="dialog"
            aria-label={`Chat with ${site.shortName}'s AI assistant`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={spring.snappy}
            style={{ transformOrigin: "100% 100%" }}
            className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[65] flex max-h-[min(38rem,calc(100svh-7.5rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface-raised shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[24rem]"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span aria-hidden className="grid size-9 place-items-center rounded-full bg-accent font-display text-sm italic text-on-accent">
                  AR
                </span>
                <div>
                  <p className="text-sm font-medium">Ask {site.shortName}</p>
                  <p className="text-xs text-muted">AI assistant · answers from my résumé</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-primary"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4" aria-live="polite">
              {msgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user" ? "rounded-br-md bg-accent text-on-accent" : "rounded-bl-md bg-surface-sunken text-primary"
                    }`}
                  >
                    {msg.content || (
                      <span className="inline-flex gap-1" aria-label="Thinking">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              ))}
              {msgs.length === 1 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="tap rounded-full border border-line px-3 py-1.5 text-left text-xs text-secondary transition-colors hover:border-accent hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  maxLength={600}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask(input);
                    }
                  }}
                  placeholder="Ask about my work…"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent transition-[opacity,scale] active:scale-95 disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 px-1 text-[0.6875rem] leading-snug text-muted">
                AI-generated answers based on my résumé; they can be imperfect. For anything important, email {site.email}.
              </p>
            </form>
          </m.div>
        ) : null}
      </AnimatePresence>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Ask ${site.shortName}'s AI assistant`}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[65] flex h-14 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-sm font-medium text-on-accent shadow-lg shadow-black/20 transition-[scale,background-color] duration-300 ease-[var(--ease-spring)] hover:bg-accent-hover active:scale-95 print:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 5h16v11H9l-5 4V5z M8 10h8 M8 13h5" />}
        </svg>
        <span>{open ? "Close" : "Ask my AI"}</span>
      </button>
    </>
  );
}
