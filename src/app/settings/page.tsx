import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/auth";
import {
  getClient,
  getReportPreferences,
  getStaffRoster,
  listClients,
} from "@/lib/db";
import {
  addStaffAction,
  removeStaffAction,
  reportPreferencesAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await requireRole("owner", "sentinel");
  if (!session) redirect("/login");
  const params = await searchParams;
  let clientName = session.client ?? params.client;
  if (!clientName && session.role === "sentinel") {
    clientName = (await listClients())[0]?.client;
  }
  if (!clientName) redirect("/admin");
  const [client, roster, preferences] = await Promise.all([
    getClient(clientName),
    getStaffRoster(clientName),
    getReportPreferences(clientName),
  ]);
  if (!client) redirect("/admin");

  return (
    <AppShell
      role={session.role}
      email={session.email}
      clientName={clientName}
      active="settings"
    >
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="wordmark text-3xl">Settings</h1>
        <p className="mt-1 text-sentinel-charcoal/60">
          Reports, staff shortcuts, and billing for {clientName}.
        </p>

        <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
          <h2 className="wordmark text-xl">Weekly proof email</h2>
          <p className="mt-1 text-sm text-sentinel-charcoal/60">
            Confidence-first summary: checks completed, current compliance,
            recovery, and overdue count.
          </p>
          <form action={reportPreferencesAction} className="mt-5 flex flex-wrap items-end gap-3">
            <input type="hidden" name="client" value={clientName} />
            <label className="flex-1 text-sm font-medium">
              Recipient email
              <input
                type="email"
                name="recipientEmail"
                defaultValue={preferences.recipientEmail ?? client.contactEmail ?? ""}
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={preferences.enabled}
                className="h-4 w-4 accent-sentinel-red"
              />
              Send weekly
            </label>
            <button className="rounded-md bg-sentinel-red px-4 py-2 font-semibold text-white">
              Save
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
          <h2 className="wordmark text-xl">Staff name shortcuts</h2>
          <p className="mt-1 text-sm text-sentinel-charcoal/60">
            Optional roster for faster point-of-use logging. Staff can still type
            a name and no account is required at the station.
          </p>
          <form action={addStaffAction} className="mt-5 flex gap-2">
            <input type="hidden" name="client" value={clientName} />
            <input
              name="displayName"
              required
              placeholder="J. Rivera"
              className="flex-1 rounded-md border border-sentinel-charcoal/20 px-3 py-2"
            />
            <button className="rounded-md bg-sentinel-charcoal px-4 py-2 font-semibold text-white">
              Add
            </button>
          </form>
          <div className="mt-4 divide-y divide-sentinel-charcoal/10">
            {roster.filter((member) => member.active).map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <span>{member.displayName}</span>
                <form action={removeStaffAction}>
                  <input type="hidden" name="client" value={clientName} />
                  <input type="hidden" name="id" value={member.id} />
                  <button className="text-sm text-sentinel-red hover:underline">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
          <h2 className="wordmark text-xl">Billing</h2>
          <p className="mt-1 text-sm text-sentinel-charcoal/60">
            Plan: {client.plan ?? "Manual"} · Status: {client.billingStatus ?? "manual"}
          </p>
          {client.stripeCustomerId && (
            <form action="/api/stripe/portal" method="post" className="mt-4">
              <input type="hidden" name="client" value={clientName} />
              <button className="rounded-md border border-sentinel-charcoal/20 px-4 py-2 font-semibold">
                Manage payment method or subscription
              </button>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
