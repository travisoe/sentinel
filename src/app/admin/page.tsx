import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  computeCompliance,
  getClient,
  getLogs,
  getTagsByClient,
  listIssues,
  listClients,
} from "@/lib/db";
import { getPack, PACKS } from "@/lib/packs";
import { calculateAccountHealth, summarize } from "@/lib/compliance";
import type { ComplianceRow, LogEntry, Tag } from "@/lib/types";
import {
  createClientAction,
  registerTagsAction,
  setTagStatusAction,
  updateInstallStatusAction,
  updateIssueAction,
  updateTagAction,
} from "./actions";

export const dynamic = "force-dynamic";
const WINDOW_OPTIONS = [7, 30, 90] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; window?: string }>;
}) {
  const session = await requireRole("sentinel");
  if (!session) redirect("/login");

  const { client: selected, window } = await searchParams;
  const requestedWindow = Number(window);
  const windowDays = WINDOW_OPTIONS.includes(requestedWindow as 7 | 30 | 90)
    ? (requestedWindow as 7 | 30 | 90)
    : 30;

  const now = new Date();
  const nowIso = now.toISOString();
  const from30 = isoDaysAgo(30, now);

  const clients = await listClients();
  const portfolio = await Promise.all(
    clients.map(async (c) => {
      const [rows, logs30, tags] = await Promise.all([
        computeCompliance(c.client),
        getLogs(c.client, { from: from30, to: nowIso }),
        getTagsByClient(c.client),
      ]);
      const s = summarize(rows);
      const health = calculateAccountHealth(c, tags, logs30, rows);
      return {
        client: c.client,
        pack: c.pack,
        activeTags: rows.length,
        compliancePct: s.compliancePct,
        overdue: s.overdue,
        checks30: logs30.length,
        health,
        plan: c.plan,
        billingStatus: c.billingStatus,
      };
    }),
  );
  portfolio.sort((a, b) => b.overdue - a.overdue || a.compliancePct - b.compliancePct);

  const active = selected ?? clients[0]?.client;
  const clientRec = active ? await getClient(active) : null;
  const pack = clientRec ? getPack(clientRec.pack) : null;

  const [tags, rows, logsWindow, logs30, logs90, issues] = active
    ? await Promise.all([
        getTagsByClient(active),
        computeCompliance(active),
        getLogs(active, { from: isoDaysAgo(windowDays, now), to: nowIso }),
        getLogs(active, { from: from30, to: nowIso }),
        getLogs(active, { from: isoDaysAgo(90, now), to: nowIso }),
        listIssues(active),
      ])
    : [[], [], [], [], [], []];

  const summary = summarize(rows as ComplianceRow[]);
  const statusByTag = new Map(rows.map((r) => [r.tagId, r.status]));
  const metrics = computeClientMetrics(
    tags as Tag[],
    logsWindow as LogEntry[],
    logs30 as LogEntry[],
    rows as ComplianceRow[],
    windowDays,
  );
  const trend = buildWeeklyTrend(tags as Tag[], logs90 as LogEntry[], now, 12);
  const openIssues = issues.filter((issue) => issue.status !== "resolved");
  const health = clientRec
    ? calculateAccountHealth(
        clientRec,
        tags as Tag[],
        logs30 as LogEntry[],
        rows as ComplianceRow[],
      )
    : null;

  return (
    <AppShell role={session.role} email={session.email} active="admin">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="wordmark text-3xl text-sentinel-charcoal">Admin dashboard</h1>
        <p className="mt-1 text-sentinel-charcoal/60">
          Account-level operations, compliance visibility, and client management.
        </p>

        <section className="mt-6 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                Portfolio overview
              </h2>
              <p className="text-sm text-sentinel-charcoal/60">
                Compare all serviced companies at a glance.
              </p>
            </div>
            <p className="text-xs text-sentinel-charcoal/50">
              Sorted by overdue risk, then compliance.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-sentinel-charcoal/10">
            <table className="w-full text-sm">
              <thead className="bg-sentinel-offwhite text-left text-xs uppercase tracking-wide text-sentinel-charcoal/50">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Plan / billing</th>
                  <th className="px-3 py-2">Health</th>
                  <th className="px-3 py-2">Compliance</th>
                  <th className="px-3 py-2">Overdue</th>
                  <th className="px-3 py-2">Checks (30d)</th>
                  <th className="px-3 py-2">Active tags</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((row) => (
                  <tr
                    key={row.client}
                    className={`border-t border-sentinel-charcoal/10 ${
                      row.client === active ? "bg-sentinel-offwhite/60" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-sentinel-charcoal">
                      <Link
                        href={`/admin?client=${encodeURIComponent(row.client)}&window=${windowDays}`}
                        className="hover:text-sentinel-red"
                      >
                        {row.client}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-sentinel-charcoal/65">
                      <p>{row.plan ?? row.pack}</p>
                      <p className="text-xs">{row.billingStatus ?? "manual"}</p>
                    </td>
                    <td className="px-3 py-2">
                      <HealthPill band={row.health.band} score={row.health.score} />
                    </td>
                    <td className="px-3 py-2">{row.compliancePct}%</td>
                    <td className="px-3 py-2">{row.overdue}</td>
                    <td className="px-3 py-2">{row.checks30}</td>
                    <td className="px-3 py-2">{row.activeTags}</td>
                  </tr>
                ))}
                {portfolio.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-sentinel-charcoal/50" colSpan={7}>
                      No clients yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => {
            const selectedClient = c.client === active;
            return (
              <Link
                key={c.client}
                href={`/admin?client=${encodeURIComponent(c.client)}&window=${windowDays}`}
                className={`rounded-xl border p-4 transition ${
                  selectedClient
                    ? "border-sentinel-red bg-sentinel-white"
                    : "border-sentinel-charcoal/10 bg-sentinel-white hover:border-sentinel-charcoal/25"
                }`}
              >
                <p className="font-semibold text-sentinel-charcoal">{c.client}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-sentinel-charcoal/50">
                  Industry pack · {c.pack}
                </p>
                {selectedClient && (
                  <p className="mt-2 text-xs font-semibold text-sentinel-red">
                    Viewing this client
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
          <h2 className="wordmark text-lg text-sentinel-charcoal">
            Onboard a client
          </h2>
          <form
            action={createClientAction}
            className="mt-4 grid gap-3 sm:grid-cols-4"
          >
            <input
              name="client"
              placeholder="Client name"
              required
              className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 sm:col-span-2"
            />
            <select
              name="pack"
              className="rounded-md border border-sentinel-charcoal/20 px-3 py-2"
            >
              {Object.values(PACKS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-sentinel-red px-4 py-2 font-semibold text-sentinel-white">
              Add client
            </button>
            <input
              name="spreadsheetId"
              placeholder="Optional legacy Sheets ID (unused for Supabase)"
              className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 sm:col-span-4"
            />
          </form>
        </section>

        {active && pack && (
          <>
            <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="wordmark text-lg text-sentinel-charcoal">
                    {active}
                  </h2>
                  <p className="text-sm text-sentinel-charcoal/60">
                    Current + historical usage metrics for account management.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {WINDOW_OPTIONS.map((days) => (
                    <Link
                      key={days}
                      href={`/admin?client=${encodeURIComponent(active)}&window=${days}`}
                      className={`rounded-full px-3 py-1 ${
                        days === windowDays
                          ? "bg-sentinel-red text-sentinel-white"
                          : "border border-sentinel-charcoal/20 text-sentinel-charcoal/70"
                      }`}
                    >
                      {days}d
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <MetricCard
                  label={`Checks (${windowDays}d)`}
                  value={String(metrics.checksWindow)}
                  help="Tap + manager completions"
                />
                <MetricCard
                  label="Checks (30d)"
                  value={String(metrics.checks30d)}
                  help="Monthly usage"
                />
                <MetricCard
                  label={`Active tags used (${windowDays}d)`}
                  value={`${metrics.activeTagsUsedWindow}/${metrics.activeTags}`}
                  help="Coverage across stations"
                />
                <MetricCard
                  label={`Completion vs expected (${windowDays}d)`}
                  value={`${metrics.completionVsExpectedPct}%`}
                  help="Based on required cadence"
                />
                <MetricCard
                  label="Unique loggers"
                  value={String(metrics.uniqueLoggersWindow)}
                  help="Operator participation"
                />
                <MetricCard
                  label="Overdue now"
                  value={String(summary.overdue)}
                  help="Immediate risk"
                />
              </div>
              <p className="mt-3 text-xs text-sentinel-charcoal/50">
                Expected checks ({windowDays}d): {metrics.expectedChecksWindow} ·
                Manager overrides ({windowDays}d): {metrics.managerOverridesWindow} ·
                Current compliance: {summary.compliancePct}%
              </p>
              {health && (
                <div className="mt-5 rounded-lg border border-sentinel-charcoal/10 bg-sentinel-offwhite p-4">
                  <div className="flex items-center gap-3">
                    <HealthPill band={health.band} score={health.score} />
                    <p className="text-sm font-semibold">Account health</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {health.signals.length ? (
                      health.signals.map((signal) => (
                        <p key={signal} className="text-sm text-sentinel-charcoal/65">
                          {signal}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-ok-text">
                        Healthy usage with no immediate expansion or recovery signal.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-sentinel-charcoal/45">
                  Install tracking
                </span>
                {(["ordered", "shipped", "installed"] as const).map((stage) => (
                  <form key={stage} action={updateInstallStatusAction}>
                    <input type="hidden" name="client" value={active} />
                    <input type="hidden" name="stage" value={stage} />
                    <button className="rounded-full border border-sentinel-charcoal/20 px-3 py-1 text-xs font-medium capitalize">
                      Mark {stage}
                    </button>
                  </form>
                ))}
                <Link
                  href={`/onboarding?client=${encodeURIComponent(active)}`}
                  className="rounded-full bg-sentinel-charcoal px-3 py-1 text-xs font-medium text-white"
                >
                  Open install wizard
                </Link>
                <Link
                  href={`/api/export?client=${encodeURIComponent(active)}`}
                  className="rounded-full bg-sentinel-red px-3 py-1 text-xs font-medium text-white"
                >
                  Export client bundle
                </Link>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                Historical usage trend (weekly)
              </h2>
              <p className="mt-1 text-sm text-sentinel-charcoal/60">
                Actual checks vs expected baseline over the last 12 weeks.
              </p>
              <div className="mt-4 space-y-2">
                {trend.map((point) => (
                  <div key={point.label} className="grid grid-cols-[90px_1fr_170px] items-center gap-3 text-xs">
                    <span className="text-sentinel-charcoal/55">{point.label}</span>
                    <div className="h-3 rounded-full bg-sentinel-offwhite">
                      <div
                        className={`h-full rounded-full ${
                          point.rate >= 90
                            ? "bg-ok-text"
                            : point.rate >= 60
                              ? "bg-gap-text"
                              : "bg-bad-text"
                        }`}
                        style={{ width: `${Math.max(4, point.rate)}%` }}
                      />
                    </div>
                    <span className="text-sentinel-charcoal/65">
                      {point.actual}/{point.expected} checks ({point.rate}%)
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                Open process / NFC issues
              </h2>
              <p className="mt-1 text-sm text-sentinel-charcoal/60">
                Persisted account issues. A valid later station log automatically
                resolves open tag issues.
              </p>
              <div className="mt-3 overflow-hidden rounded-lg border border-sentinel-charcoal/10">
                <table className="w-full text-sm">
                  <thead className="bg-sentinel-offwhite text-left text-xs uppercase tracking-wide text-sentinel-charcoal/50">
                    <tr>
                      <th className="px-3 py-2">Tag</th>
                      <th className="px-3 py-2">Issue</th>
                      <th className="px-3 py-2">Status / owner</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openIssues.map((issue) => (
                      <tr key={issue.id} className="border-t border-sentinel-charcoal/10 align-top">
                        <td className="px-3 py-3 font-medium">{issue.tagId ?? "Account"}</td>
                        <td className="px-3 py-3 text-sentinel-charcoal/70">
                          <p className="font-medium">{issue.type.replaceAll("_", " ")}</p>
                          <p className="text-xs">{issue.severity} · {issue.notes}</p>
                        </td>
                        <td className="px-3 py-3 text-sentinel-charcoal/70">
                          <p>{issue.status}</p>
                          <p className="text-xs">{issue.acknowledgedBy ?? issue.openedBy}</p>
                        </td>
                        <td className="px-3 py-3">
                          <form action={updateIssueAction} className="flex flex-wrap gap-2">
                            <input type="hidden" name="issueId" value={issue.id} />
                            <input type="hidden" name="client" value={active} />
                            <input
                              name="note"
                              placeholder="Resolution / action"
                              className="w-40 rounded border border-sentinel-charcoal/20 px-2 py-1 text-xs"
                            />
                            {issue.status === "open" && (
                              <button
                                name="status"
                                value="acknowledged"
                                className="rounded border border-gap-text px-2 py-1 text-xs text-gap-text"
                              >
                                Acknowledge
                              </button>
                            )}
                            <button
                              name="status"
                              value="resolved"
                              className="rounded bg-ok-text px-2 py-1 text-xs text-white"
                            >
                              Resolve
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {openIssues.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-sentinel-charcoal/50" colSpan={4}>
                          No open process/NFC issues right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="wordmark text-lg text-sentinel-charcoal">
                  Register tags — {active}
                </h2>
                <Link
                  href={`/api/placement?client=${encodeURIComponent(active)}`}
                  className="text-sm font-medium text-sentinel-red hover:underline"
                >
                  Export placement list ↓
                </Link>
              </div>
              <p className="mt-2 text-sm text-sentinel-charcoal/60">
                One tag per line: <code>tagId, location, logType[, frequencyDays]</code>
              </p>
              <p className="mt-1 text-xs text-sentinel-charcoal/50">
                Log types in the <strong>{pack.label}</strong> pack:{" "}
                {pack.logTypes.map((t) => t.key).join(", ")}
              </p>
              <form action={registerTagsAction} className="mt-3">
                <input type="hidden" name="client" value={active} />
                <input type="hidden" name="pack" value={pack.id} />
                <textarea
                  name="tags"
                  rows={4}
                  placeholder={`${active.slice(0, 3).toUpperCase()}-001, Dock Door 4, dock_plate_check`}
                  className="w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2 font-mono text-sm"
                />
                <button className="mt-3 rounded-md bg-sentinel-red px-4 py-2 font-semibold text-sentinel-white">
                  Register tags
                </button>
              </form>
            </section>

            <section className="mt-8">
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                Tag registry — {active}
              </h2>
              <div className="mt-3 space-y-3">
                {tags.length === 0 && (
                  <p className="text-sentinel-charcoal/50">No tags yet.</p>
                )}
                {tags.map((tag) => (
                  <div
                    key={tag.tagId}
                    className="rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="wordmark text-sentinel-charcoal">
                          {tag.tagId}
                        </span>
                        {statusByTag.get(tag.tagId) && (
                          <StatusPill status={statusByTag.get(tag.tagId)!} />
                        )}
                        {tag.status === "Inactive" && (
                          <span className="text-xs font-semibold uppercase text-sentinel-charcoal/40">
                            Inactive
                          </span>
                        )}
                      </div>
                      <form action={setTagStatusAction}>
                        <input type="hidden" name="tagId" value={tag.tagId} />
                        <input
                          type="hidden"
                          name="status"
                          value={tag.status === "Active" ? "Inactive" : "Active"}
                        />
                        <button className="text-sm font-medium text-sentinel-red hover:underline">
                          {tag.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>

                    <form action={updateTagAction} className="mt-3 grid gap-3 sm:grid-cols-4">
                      <input type="hidden" name="tagId" value={tag.tagId} />
                      <div className="sm:col-span-2">
                        <input
                          name="location"
                          defaultValue={tag.location}
                          className="w-full rounded-md border border-sentinel-charcoal/20 px-2 py-1.5 text-sm"
                        />
                        <p className="mt-1 text-[11px] text-sentinel-charcoal/45">
                          Location name shown on tap and dashboard
                        </p>
                      </div>
                      <div>
                        <select
                          name="logType"
                          defaultValue={tag.logType}
                          className="w-full rounded-md border border-sentinel-charcoal/20 px-2 py-1.5 text-sm"
                        >
                          {pack.logTypes.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-sentinel-charcoal/45">
                          Inspection type
                        </p>
                      </div>
                      <div>
                        <div className="flex gap-2">
                          <input
                            name="frequencyDays"
                            type="number"
                            defaultValue={tag.frequencyDays}
                            className="w-20 rounded-md border border-sentinel-charcoal/20 px-2 py-1.5 text-sm"
                          />
                          <button className="rounded-md border border-sentinel-charcoal/20 px-3 py-1.5 text-sm font-medium hover:border-sentinel-red hover:text-sentinel-red">
                            Save
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-sentinel-charcoal/45">
                          Days between inspections
                        </p>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <div className="rounded-lg border border-sentinel-charcoal/10 bg-sentinel-offwhite p-3">
      <p className="text-[11px] uppercase tracking-wide text-sentinel-charcoal/45">
        {label}
      </p>
      <p className="wordmark mt-1 text-2xl text-sentinel-charcoal">{value}</p>
      <p className="mt-1 text-[11px] text-sentinel-charcoal/45">{help}</p>
    </div>
  );
}

function HealthPill({
  band,
  score,
}: {
  band: "green" | "amber" | "red";
  score: number;
}) {
  const style =
    band === "green"
      ? "bg-ok-bg text-ok-text"
      : band === "amber"
        ? "bg-gap-bg text-gap-text"
        : "bg-bad-bg text-bad-text";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {score} · {band}
    </span>
  );
}

function computeClientMetrics(
  tags: Tag[],
  logsWindow: LogEntry[],
  logs30: LogEntry[],
  rows: ComplianceRow[],
  windowDays: number,
) {
  const activeTags = tags.filter((t) => t.status === "Active");
  const tagsUsedWindow = new Set(
    logsWindow.map((l) => l.tagId).filter((id) => activeTags.some((t) => t.tagId === id)),
  );
  const expectedChecksWindow = activeTags.reduce(
    (sum, t) => sum + Math.max(1, Math.ceil(windowDays / Math.max(1, t.frequencyDays))),
    0,
  );
  const completionVsExpectedPct =
    expectedChecksWindow === 0
      ? 100
      : Math.min(100, Math.round((logsWindow.length / expectedChecksWindow) * 100));
  const uniqueLoggersWindow = new Set(logsWindow.map((l) => l.loggedBy)).size;
  const managerOverridesWindow = logsWindow.filter((l) =>
    (l.notes ?? "").toLowerCase().startsWith("manager completion recorded ("),
  ).length;

  return {
    checksWindow: logsWindow.length,
    checks30d: logs30.length,
    activeTags: activeTags.length,
    activeTagsUsedWindow: tagsUsedWindow.size,
    expectedChecksWindow,
    completionVsExpectedPct,
    uniqueLoggersWindow,
    managerOverridesWindow,
    overdueNow: rows.filter((r) => r.status === "Overdue").length,
  };
}

function isoDaysAgo(days: number, now: Date): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildWeeklyTrend(tags: Tag[], logs: LogEntry[], now: Date, weeks: number) {
  const activeTags = tags.filter((t) => t.status === "Active");
  const expectedPerWeek = activeTags.reduce(
    (sum, t) => sum + Math.max(1, Math.ceil(7 / Math.max(1, t.frequencyDays))),
    0,
  );

  const out: { label: string; actual: number; expected: number; rate: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const actual = logs.filter((l) => {
      const t = new Date(l.timestamp).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    const rate =
      expectedPerWeek === 0
        ? 100
        : Math.min(100, Math.round((actual / expectedPerWeek) * 100));
    out.push({
      label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      actual,
      expected: expectedPerWeek,
      rate,
    });
  }
  return out;
}

