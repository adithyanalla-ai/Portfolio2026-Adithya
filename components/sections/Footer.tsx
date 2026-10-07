"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isHomePath, nav, navHref, site, type NavItem } from "@/lib/content";
import { Arrow } from "@/components/ui/Arrow";

// Same as the main nav, but About points to the About page and Projects is added (internal links on every page).
const footerNav: NavItem[] = nav.flatMap((n) =>
  n.id === "about"
    ? [{ ...n, href: "/about" }]
    : n.id === "work"
      ? [n, { id: "projects", label: "Projects", href: "/projects" }]
      : [n],
);

export function Footer() {
  const onHome = isHomePath(usePathname());
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Designed &amp; built in {site.location.split(",")[0]}.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerNav.map((n) => {
              const href = navHref(n, onHome);
              return (
                <li key={n.id}>
                  {href.startsWith("#") ? (
                    <a href={href} className="tap link-draw hover:text-primary">
                      {n.label}
                    </a>
                  ) : (
                    <Link href={href} className="tap link-draw hover:text-primary">
                      {n.label}
                    </Link>
                  )}
                </li>
              );
            })}
            <li>
              <a href={onHome ? "#top" : "#main"} className="tap group inline-flex items-center gap-1 hover:text-primary">
                <span className="link-draw">Back to top</span>
                <Arrow className="-rotate-45" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
