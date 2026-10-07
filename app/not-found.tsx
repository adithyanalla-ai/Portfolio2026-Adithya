import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";

// Next.js serves this for unmatched URLs with a 404 status and adds <meta name="robots" content="noindex">.
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Head back to Adithya Reddy Nalla's portfolio or read the blog.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main" className="container-x flex min-h-[80svh] flex-col justify-center pb-[var(--section-y)] pt-[calc(var(--nav-h)+3rem)]">
      <p className="label flex items-center gap-3">
        <span className="text-accent">404</span>
        <span aria-hidden className="h-px w-8 bg-line-strong" />
        <span>Not found</span>
      </p>
      <h1 className="mt-8 max-w-3xl font-display text-h2 font-light text-balance">
        This page took a <em className="text-accent">wrong turn</em>.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-secondary text-pretty">
        The link may be old or mistyped. Everything else is one click away.
      </p>
      <ul className="mt-10 flex flex-wrap gap-3">
        <li>
          <Link
            href="/"
            className="tap inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          >
            Back to the homepage
            <Arrow direction="right" />
          </Link>
        </li>
        <li>
          <Link
            href="/blog"
            className="tap inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-line-strong"
          >
            Read the blog
          </Link>
        </li>
      </ul>
    </main>
  );
}
