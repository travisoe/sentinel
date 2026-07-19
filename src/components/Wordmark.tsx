/**
 * SENTINEL. wordmark — the red period is non-negotiable (SOUL §6.1).
 * On-screen SVG/text mark is a placeholder only; the true vector comes from the
 * Sentinel Drive via contact@getbrandedfast.com (SOUL §13.10) for any print use.
 */
export function Wordmark({
  className = "",
  tagline = false,
  size = "md",
}: {
  className?: string;
  tagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  } as const;

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className={`wordmark ${sizes[size]}`}>
        SENTINEL<span className="wordmark-dot">.</span>
      </span>
      {tagline && (
        <span className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-sentinel-charcoal/60">
          Compliance, proven.
        </span>
      )}
    </span>
  );
}

/** Small shield-S placeholder icon (screen only; not for print). */
export function ShieldMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      <path
        d="M24 2 4 10v18c0 14 9 22 20 26 11-4 20-12 20-26V10L24 2Z"
        fill="#CC1E1E"
      />
      <path
        d="M17 33c2 2.4 5 3.6 8 3.4 3.2-.2 5.6-1.9 5.6-4.6 0-6-13-3.4-13-9.4 0-2.6 2.6-4.4 6-4.4 2.6 0 4.8.9 6.4 2.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
