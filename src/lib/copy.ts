/**
 * Canonical copy — pulled from SOUL, never improvised (§8 of build prompt, SOUL §5).
 * Banned: "OSHA-approved", "guaranteed compliant", "inspection by Sentinel",
 * fear-based copy. The client's staff performs checks; Sentinel makes them provable.
 */
export const COPY = {
  tagline: "Compliance, proven.",
  hero: "Stop filing paper. Start showing proof.",
  tapSuccess: (location: string, logType: string, time: string) =>
    `Logged. ${location} ${logType} — ${time}.`,
  unknownTag: "This tag isn't set up yet — contact your manager.",
  inactiveTag: "This station is currently inactive.",
  emptyDashboard: "No logs yet. Tap your first station to see it here.",
  reportHeader: "Compliance, proven.",
  // Approved source drafts, intentionally not rendered until founder approval.
  vision:
    "A world where every safety action carries its own proof — where “we did it” is never just a signature from memory.",
  mission:
    "Sentinel turns everyday safety and compliance work into timestamped, unchangeable proof — giving operators live visibility and audit-ready records without paper, apps, or guesswork.",
} as const;
