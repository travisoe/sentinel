import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { getSession } from "@/lib/auth";
import { computeCompliance, getClient, listClients } from "@/lib/db";
import { logTypeLabel } from "@/lib/packs";
import { summarize } from "@/lib/compliance";
import { COPY } from "@/lib/copy";
import type { ComplianceRow } from "@/lib/types";
import { recordManagerCompletionAction } from "./actions";

// Dashboard reads are cached in the data layer (30–60s) per SOUL §13.8.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { client: clientParam } = await searchParams;

  // Owners are scoped to their client; Sentinel staff may pass ?client=.
  let clientName = session.client ?? clientParam;
  if (!clientName) {
    const clients = await listClients();
    clientName = clients[0]?.client;
  }

  if (!clientName) {
    return (
      <AppShell role={session.role} email={session.email} active="dashboard">
        <div className="p-10 text-sentinel-charcoal/60">
          No client is set up yet.
        </div>
      </AppShell>
    );
  }

  const clientRec = await getClient(clientName);
  if (
    session.role === "owner" &&
    (clientRec?.status === "Inactive" ||
      clientRec?.billingStatus === "canceled" ||
      clientRec?.billingStatus === "unpaid")
  ) {
    return (
      <AppShell
        role={session.role}
        email={session.email}
        clientName={clientName}
        active="dashboard"
      >
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="rounded-xl border border-gap-text/20 bg-gap-bg p-6">
            <h1 className="wordmark text-2xl text-sentinel-charcoal">
              Account needs attention
            </h1>
            <p className="mt-2 text-sentinel-charcoal/70">
              Logging history remains protected. Update billing or contact
              Sentinel to restore dashboard access.
            </p>
            {clientRec?.stripeCustomerId && (
              <form action="/api/stripe/portal" method="post" className="mt-5">
                <button className="rounded-md bg-sentinel-charcoal px-4 py-2 font-semibold text-white">
                  Manage billing
                </button>
              </form>
            )}
          </div>
        </div>
      </AppShell>
    );
  }
  const rows = await computeCompliance(clientName);
  const summary = summarize(rows);
  const overdue = rows.filter((r) => r.status === "Overdue");

  return (
    <AppShell
      role={session.role}
      email={session.email}
      clientName={clientName}
      active="dashboard"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="wordmark text-3xl text-sentinel-charcoal">
            {clientName}
          </h1>
          <form
            action="/api/report"
            method="get"
            className="flex items-center gap-2 text-sm"
          >
            {session.role === "sentinel" && (
              <input type="hidden" name="client" value={clientName} />
            )}
            <input
              type="date"
              name="from"
              className="rounded-md border border-sentinel-charcoal/20 px-2 py-1"
            />
            <span className="text-sentinel-charcoal/40">→</span>
            <input
              type="date"
              name="to"
              className="rounded-md border border-sentinel-charcoal/20 px-2 py-1"
            />
            <button className="rounded-md bg-sentinel-charcoal px-3 py-1.5 font-medium text-sentinel-white hover:bg-sentinel-charcoal/90">
              Export PDF
            </button>
          </form>
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 text-sentinel-charcoal/60">
            {COPY.emptyDashboard}
          </p>
        ) : (
          <>
            <HeroAnswer pct={summary.compliancePct} overdue={summary.overdue} />

            {/* Counts row */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <CountCard label="Compliant" value={summary.compliant} tone="ok" />
              <CountCard
                label="Open gaps"
                value={summary.gaps + summary.noLog}
                tone="gap"
              />
              <CountCard label="Overdue" value={summary.overdue} tone="bad" />
            </div>

            {/* Alerts feed (Milestone 5) — derived; auto-clears when logged. */}
            {overdue.length > 0 && (
              <section className="mt-8">
                <h2 className="wordmark text-lg text-sentinel-charcoal">
                  Needs attention
                </h2>
                <div className="mt-3 space-y-2">
                  {overdue.map((r) => (
                    <div
                      key={r.tagId}
                      className="flex items-center justify-between rounded-lg border border-bad-text/20 bg-bad-bg px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-sentinel-charcoal">
                          {r.location}
                        </p>
                        <p className="text-sm text-sentinel-charcoal/60">
                          {logTypeLabel(clientRec?.pack, r.logType)} · overdue{" "}
                          {r.daysSince !== null
                            ? `${Math.floor(r.daysSince)}d`
                            : ""}
                        </p>
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Per-tag list */}
            <section className="mt-8">
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                All stations
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-sentinel-charcoal/10 text-left text-sentinel-charcoal/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Station</th>
                      <th className="px-4 py-3 font-medium">Log type</th>
                      <th className="px-4 py-3 font-medium">Last logged</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <TagRow
                        key={r.tagId}
                        row={r}
                        pack={clientRec?.pack}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-5">
              <h2 className="wordmark text-lg text-sentinel-charcoal">
                Record missed completion
              </h2>
              <p className="mt-1 text-sm text-sentinel-charcoal/60">
                Use this when work was completed but the NFC/QR tap was missed.
                This appends a new timestamped entry with your identity and
                reason.
              </p>
              <form
                action={recordManagerCompletionAction}
                className="mt-4 grid gap-3 sm:grid-cols-5"
              >
                <input type="hidden" name="client" value={clientName} />
                <select
                  name="tagId"
                  required
                  className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm sm:col-span-2"
                >
                  <option value="">Select station</option>
                  {rows.map((row) => (
                    <option key={row.tagId} value={row.tagId}>
                      {row.tagId} — {row.location}
                    </option>
                  ))}
                </select>
                <select
                  name="reason"
                  required
                  className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm"
                >
                  <option value="missed_scan">Missed scan</option>
                  <option value="broken_nfc">Broken NFC tag</option>
                  <option value="process_break">Process gap</option>
                  <option value="offline_device">Device offline</option>
                  <option value="other">Other</option>
                </select>
                <input
                  name="notes"
                  placeholder="Optional details"
                  className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 text-sm sm:col-span-2"
                />
                <button className="rounded-md bg-sentinel-red px-4 py-2 font-semibold text-sentinel-white sm:col-span-5 sm:w-fit">
                  Append completion record
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function HeroAnswer({ pct, overdue }: { pct: number; overdue: number }) {
  const tone =
    overdue > 0 ? "bad" : pct >= 100 ? "ok" : pct >= 80 ? "gap" : "bad";
  const toneStyles = {
    ok: "bg-ok-bg text-ok-text",
    gap: "bg-gap-bg text-gap-text",
    bad: "bg-bad-bg text-bad-text",
  } as const;
  return (
    <div
      className={`mt-6 rounded-2xl px-8 py-10 ${toneStyles[tone]} flex flex-col items-center text-center`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em]">
        Am I compliant right now?
      </p>
      <p className="wordmark mt-2 text-7xl leading-none">{pct}%</p>
      <p className="mt-2 text-sm font-medium">
        {overdue === 0
          ? "All required checks are current."
          : `${overdue} station${overdue === 1 ? "" : "s"} need attention.`}
      </p>
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "gap" | "bad";
}) {
  const styles = {
    ok: "text-ok-text",
    gap: "text-gap-text",
    bad: "text-bad-text",
  } as const;
  return (
    <div className="rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-5">
      <p className={`wordmark text-4xl ${styles[tone]}`}>{value}</p>
      <p className="mt-1 text-sm text-sentinel-charcoal/60">{label}</p>
    </div>
  );
}

function TagRow({
  row,
  pack,
}: {
  row: ComplianceRow;
  pack?: import("@/lib/types").PackId;
}) {
  const last =
    row.lastLogged !== null
      ? new Date(row.lastLogged).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  return (
    <tr className="border-b border-sentinel-charcoal/5 last:border-0">
      <td className="px-4 py-3 font-medium text-sentinel-charcoal">
        {row.location}
        <span className="ml-2 text-xs text-sentinel-charcoal/40">
          {row.tagId}
        </span>
      </td>
      <td className="px-4 py-3 text-sentinel-charcoal/70">
        {logTypeLabel(pack, row.logType)}
      </td>
      <td className="px-4 py-3 text-sentinel-charcoal/70">{last}</td>
      <td className="px-4 py-3">
        <StatusPill status={row.status} />
      </td>
    </tr>
  );
}
