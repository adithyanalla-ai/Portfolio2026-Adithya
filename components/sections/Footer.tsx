import { nav, site } from "@/lib/content";
import { Arrow } from "@/components/ui/Arrow";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Designed &amp; built in {site.location.split(",")[0]}.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="link-draw hover:text-bone">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#top" className="group inline-flex items-center gap-1 hover:text-bone">
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
