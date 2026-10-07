/**
 * Placeholder for facts Adithya still has to supply. Visible in `npm run dev` only;
 * renders nothing in production builds, so no "TODO" ever reaches the live site.
 */
export function Todo({ items }: { items: string[] }) {
  if (process.env.NODE_ENV === "production" || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-dashed border-accent p-4 text-sm text-secondary">
      <p className="label text-accent">TODO (dev only)</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
