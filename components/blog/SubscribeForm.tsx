"use client";

import { useState, type FormEvent } from "react";

const ENDPOINT = "https://formspree.io/f/mjyggelp";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-xl border border-line bg-surface-raised px-4 py-3 text-base text-primary placeholder:text-muted transition-colors hover:border-line-strong focus:border-accent";

/** Monthly-digest signup (name, email, mobile) posted straight to Formspree, so it also works in a static export. */
export function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return; // honeypot: bots fill hidden fields
    data.delete("website");
    data.append("_subject", "New monthly AI digest subscriber");
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p role="status" className="text-lede text-pretty">
        You&apos;re on the list. The first digest lands next month.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" aria-labelledby="subscribe-title">
      <div className="sm:col-span-2">
        <h2 id="subscribe-title" className="font-display text-h3 tracking-tight">
          A monthly digest of modern AI
        </h2>
        <p className="mt-2 max-w-xl text-secondary text-pretty">
          One email a month: what changed in agentic AI, LLM systems and marketing AI, and what it means in practice. No spam.
        </p>
      </div>
      <label className="grid gap-1.5 sm:col-span-2">
        <span className="label">Name</span>
        <input name="name" type="text" required autoComplete="name" placeholder="Your name" className={field} />
      </label>
      <label className="grid gap-1.5">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={field} />
      </label>
      <label className="grid gap-1.5">
        <span className="label">Mobile</span>
        <input
          name="mobile"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          pattern="[+0-9][0-9 ()\-]{6,19}"
          title="Digits, with an optional + country code"
          placeholder="+91 98765 43210"
          className={field}
        />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
        <a href="/blog/rss.xml" className="tap label link-draw hover:text-primary">
          or subscribe via RSS
        </a>
      </div>
      {status === "error" ? (
        <p role="alert" className="text-sm text-accent sm:col-span-2">
          Couldn&apos;t send that. Please check your connection and try again.
        </p>
      ) : null}
    </form>
  );
}
