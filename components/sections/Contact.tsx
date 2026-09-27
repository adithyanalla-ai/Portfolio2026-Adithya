import { site } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Arrow } from "@/components/ui/Arrow";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-t border-line"
    >
      <div className="container-x section-y">
        <Reveal>
          <p className="label flex items-center gap-3">
            <span className="text-accent">07</span>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            <span>Contact</span>
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 id="contact-title" className="mt-10 font-display text-display font-light">
            Let’s build
            <br />
            something that <em className="text-accent">thinks</em>.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 grid gap-10 md:grid-cols-12">
          <p className="text-lede text-secondary text-pretty md:col-span-6">
            Open to AI engineering roles, agentic-systems builds and research collaborations. The
            fastest way to reach me is email.
          </p>
          <div className="flex flex-col items-start gap-5 md:col-span-5 md:col-start-8">
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${site.email}`} className="btn btn-primary group">
                Email me <Arrow />
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost group">
                LinkedIn <Arrow />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
            <CopyEmail email={site.email} />
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="label pt-0.5">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="link-draw">
                  {site.email}
                </a>
              </dd>
              <dt className="label pt-0.5">Phone</dt>
              <dd>
                <a href={site.phoneHref} className="link-draw">
                  {site.phone}
                </a>
              </dd>
              <dt className="label pt-0.5">Based</dt>
              <dd>{site.location}</dd>
            </dl>
          </div>
        </Reveal>
      </div>

    </section>
  );
}
