/** Diagonal arrow that nudges on parent hover (parent needs `group`). */
export function Arrow({ className = "", direction = "up-right" }: { className?: string; direction?: "up-right" | "down" | "right" }) {
  const rotate = direction === "down" ? "rotate-135" : direction === "right" ? "rotate-45" : "";
  const move =
    direction === "down"
      ? "group-hover:translate-y-0.5"
      : direction === "right"
        ? "group-hover:translate-x-0.5"
        : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5";
  return (
    <span className={`inline-block transition-transform duration-500 ease-[var(--ease-spring)] ${move} ${className}`}>
      <svg
        width="0.8em"
        height="0.8em"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden
        className={rotate}
      >
        <path d="M3 9L9 3M4 3h5v5" />
      </svg>
    </span>
  );
}
