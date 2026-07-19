/**
 * Compliance status computation — pure and testable (SOUL §13.3).
 *
 * For each Active tag, find the most recent matching Log Entry, compute days
 * since, and compare to the tag's frequency:
 *   Compliant       daysSince <= frequencyDays
 *   Gap — due soon  daysSince <= 1.5 * frequencyDays
 *   Overdue         beyond that
 *   No log yet       no entries exist
 *
 * This file touches no I/O. The data-access module feeds it tags + logs.
 */
import type { ComplianceRow, LogEntry, Tag } from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(fromISO: string, now: Date): number {
  const then = new Date(fromISO).getTime();
  return (now.getTime() - then) / MS_PER_DAY;
}

export function computeRow(
  tag: Tag,
  logs: LogEntry[],
  now: Date = new Date(),
): ComplianceRow {
  const matching = logs
    .filter((l) => l.tagId === tag.tagId)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const latest = matching[0] ?? null;

  if (!latest) {
    return {
      ...tag,
      lastLogged: null,
      daysSince: null,
      status: "No log yet",
    };
  }

  const daysSince = daysBetween(latest.timestamp, now);

  let status: ComplianceRow["status"];
  if (daysSince <= tag.frequencyDays) {
    status = "Compliant";
  } else if (daysSince <= 1.5 * tag.frequencyDays) {
    status = "Gap — due soon";
  } else {
    status = "Overdue";
  }

  return {
    ...tag,
    lastLogged: latest.timestamp,
    daysSince,
    status,
  };
}

/** Compute compliance rows for every Active tag. Inactive tags are excluded. */
export function computeCompliance(
  tags: Tag[],
  logs: LogEntry[],
  now: Date = new Date(),
): ComplianceRow[] {
  return tags
    .filter((t) => t.status === "Active")
    .map((t) => computeRow(t, logs, now));
}

export type ComplianceSummary = {
  total: number;
  compliant: number;
  gaps: number;
  overdue: number;
  noLog: number;
  compliancePct: number; // 0-100, rounded
};

/** Confidence-first summary numbers for the dashboard headline (SOUL §13.5). */
export function summarize(rows: ComplianceRow[]): ComplianceSummary {
  const total = rows.length;
  const compliant = rows.filter((r) => r.status === "Compliant").length;
  const gaps = rows.filter((r) => r.status === "Gap — due soon").length;
  const overdue = rows.filter((r) => r.status === "Overdue").length;
  const noLog = rows.filter((r) => r.status === "No log yet").length;
  const compliancePct = total === 0 ? 100 : Math.round((compliant / total) * 100);
  return { total, compliant, gaps, overdue, noLog, compliancePct };
}

export type ReportStats = {
  checksCompleted: number;
  compliancePct: number;
  gapsCorrectedWithin24h: number;
};

/**
 * Confidence-first report metrics (SOUL §13.5): lead with completions and
 * recovery, not a wall of failures.
 * - checksCompleted: logs within the range
 * - compliancePct: current compliance across active tags
 * - gapsCorrectedWithin24h: consecutive logs where a gap opened past the
 *   required frequency but the correcting log arrived within ~24h of due.
 */
export function reportStats(
  tags: Tag[],
  logsInRange: LogEntry[],
  allLogs: LogEntry[],
  now: Date = new Date(),
): ReportStats {
  const checksCompleted = logsInRange.length;
  const compliancePct = summarize(computeCompliance(tags, allLogs, now)).compliancePct;

  let gapsCorrectedWithin24h = 0;
  for (const tag of tags.filter((t) => t.status === "Active")) {
    const series = logsInRange
      .filter((l) => l.tagId === tag.tagId)
      .map((l) => new Date(l.timestamp).getTime())
      .sort((a, b) => a - b);
    for (let i = 1; i < series.length; i++) {
      const gapDays = (series[i] - series[i - 1]) / (1000 * 60 * 60 * 24);
      if (gapDays > tag.frequencyDays && gapDays - tag.frequencyDays <= 1) {
        gapsCorrectedWithin24h++;
      }
    }
  }

  return { checksCompleted, compliancePct, gapsCorrectedWithin24h };
}
