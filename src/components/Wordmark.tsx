import Image from "next/image";

/**
 * SENTINEL. wordmark — the red period is non-negotiable (SOUL §6.1).
 * Rendered as live text so it stays crisp at any size and recolours with the
 * theme. For print, use the true vector from the Sentinel Drive via
 * contact@getbrandedfast.com (SOUL §13.10).
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

/**
 * Shield-S mark. Call sites size it with square utilities (h-8 w-8), so
 * object-contain preserves the mark's 222:288 portrait ratio instead of
 * stretching it. Screen only; not for print.
 */
export function ShieldMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/brand/shield.png"
      alt=""
      aria-hidden="true"
      width={222}
      height={288}
      className={`object-contain ${className}`}
      priority
    />
  );
}
