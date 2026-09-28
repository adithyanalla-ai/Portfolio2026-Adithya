import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { jsonLd as serializeJsonLd } from "@/lib/jsonld";
import { Providers } from "@/components/ui/Providers";
import { Nav } from "@/components/ui/Nav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothAnchors } from "@/components/ui/SmoothAnchors";
import { Footer } from "@/components/sections/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — AI/ML Engineer, Agentic AI & LLM Systems`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Adithya Reddy",
    "AI Engineer",
    "ML Engineer",
    "Agentic AI",
    "LLM",
    "Business Analyst",
    "Hyderabad",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title: `${site.name} — AI/ML Engineer`,
    description: site.description,
    siteName: site.name,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — AI/ML Engineer`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0b" },
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
  ],
  width: "device-width",
  initialScale: 1,
  // Lets the page use the full screen on notched phones; safe-area insets keep content clear.
  viewportFit: "cover",
};

// Runs before first paint: stored choice → OS preference → dark. Prevents any theme flash.
const themeScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Lead AI Engineer",
  worksFor: { "@type": "Organization", name: "Eject Solutions Pvt Ltd" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "KL University" },
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
  sameAs: [site.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geist.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={serializeJsonLd(jsonLd)}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <Providers>
          <ScrollProgress />
          <Nav />
          {children}
          <Footer />
          <SmoothAnchors />
        </Providers>
      </body>
    </html>
  );
}
