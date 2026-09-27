import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealGroup, RevealItem, Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";

/** Home-page teaser: the three newest posts. */
export function LatestWriting() {
  const posts = getPosts().slice(0, 3);
  if (!posts.length) return null;

  return (
    <section id="writing" aria-labelledby="writing-title" className="section-y container-x border-t border-line">
      <SectionHeader
        id="writing-title"
        index="07"
        label="Writing"
        title={
          <>
            Notes from the <em className="text-accent">work</em>.
          </>
        }
        aside="Longer write-ups on the systems, research and decisions behind the numbers above."
      />
      <RevealGroup as="ol" className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <RevealItem as="li" key={post.slug} className="flex">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex w-full flex-col justify-between gap-10 rounded-2xl border border-line bg-surface-raised p-6 transition-[border-color,transform] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong sm:p-8"
            >
              <div>
                <p className="label">
                  <time dateTime={post.date}>{formatDate(post.date, "short")}</time> · {post.readingMinutes} min
                </p>
                <h3 className="mt-5 font-display text-h3 transition-colors duration-300 group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-4 text-secondary text-pretty">{post.summary}</p>
              </div>
              <p className="label inline-flex items-center gap-2 text-accent">
                Read <Arrow direction="right" />
              </p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-10">
        <Link href="/blog" className="btn btn-ghost group">
          All writing <Arrow direction="right" />
        </Link>
      </Reveal>
    </section>
  );
}
