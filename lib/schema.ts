import { site } from "./content";

/** Schema.org entities shared across pages. One Person, referenced everywhere by @id. */
export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Adithya Reddy Nalla",
  alternateName: site.name,
  url: `${site.url}/`,
  email: `mailto:${site.email}`,
  jobTitle: "Lead AI Engineer",
  worksFor: { "@type": "Organization", name: "Eject Solutions Pvt Ltd" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "KL University" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  knowsAbout: ["Agentic AI", "Large language models", "Machine learning", "Lead generation", "Marketing analytics"],
  sameAs: [site.linkedin],
};

/** Compact reference to the Person (for author/publisher fields on other pages). */
export const personRef = { "@type": "Person", "@id": PERSON_ID, name: person.name, url: person.url };

export const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${site.url}/`,
  name: `${person.name} | Portfolio`,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

/** BreadcrumbList from [name, absolute URL] pairs, starting at Home. */
export const breadcrumbs = (trail: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Home", `${site.url}/`] as [string, string], ...trail].map(([name, item], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item,
  })),
});
