/**
 * Functional status pill — uses the product-UI status colors (SOUL §6.2).
 * Never used in marketing surfaces.
 */
import type { ComplianceStatus } from "@/lib/types";

const STYLES: Record<ComplianceStatus, string> = {
  Compliant: "bg-ok-bg text-ok-text",
  "Gap — due soon": "bg-gap-bg text-gap-text",
  Overdue: "bg-bad-bg text-bad-text",
  "No log yet": "bg-sentinel-charcoal/5 text-sentinel-charcoal/60",
};

export function StatusPill({ status }: { status: ComplianceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
