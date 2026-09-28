"use client";

import { OPEN_CHAT_EVENT } from "./ChatWidget";

export function AskAIButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))} className={`btn btn-ghost group ${className}`}>
      Ask my AI assistant
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 5h16v11H9l-5 4V5z" />
      </svg>
    </button>
  );
}
