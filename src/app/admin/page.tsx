import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { requireRole } from "@/lib/auth";
import { computeCompliance, getClient, getTagsByClient, listClients } from "@/lib/db";
import { getPack, PACKS } from "@/lib/packs";
import {
  createClientAction,
  registerTagsAction,
  setTagStatusAction,
  updateTagAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await requireRole("sentinel");
  if (!session) redirect("/login");

  const { client: selected } = await searchParams;
  const clients = await listClients();
  const active = selected ?? clients[0]?.client;
  const clientRec = active ? await getClient(active) : null;
  const pack = clientRec ? getPack(clientRec.pack) : null;
  const tags = active ? await getTagsByClient(active) : [];
  const rows = active ? await computeCompliance(active) : [];
  const statusByTag = new Map(rows.map((r) => [r.tagId, r.status]));

  return (
    <AppShell role={session.role} email={session.email} active="admin">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="wordmark text-3xl text-sentinel-charcoal">Admin console</h1>
        <p className="mt-1 text-sentinel-charcoal/60">
          Onboard clients, register tags, and assign meaning — no manual sheet
          editing.
        </p>

        {/* Client switcher */}
        <div className="mt-6 flex flex-wrap gap-2">
          {clients.map((c) => (
            <Link
              key={c.client}
              href={`/admin?client=${encodeURIComponent(c.client)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                c.client === active
                  ? "bg-sentinel-red text-sentinel-white"
                  : "border border-sentinel-charcoal/15 bg-sentinel-white text-sentinel-charcoal"
              }`}
            >
              {c.client}
              <span className="ml-2 text-xs opacity-60">{c.pack}</span>
            </Link>
          ))}
        </div>

        {/* Onboard new client */}
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
              placeholder="Google Spreadsheet ID (leave blank in demo mode)"
              className="rounded-md border border-sentinel-charcoal/20 px-3 py-2 sm:col-span-4"
            />
          </form>
        </section>

        {active && pack && (
          <>
            {/* Bulk register */}
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

            {/* Tag registry with inline edit */}
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

                    <form
                      action={updateTagAction}
                      className="mt-3 grid gap-2 sm:grid-cols-4"
                    >
                      <input type="hidden" name="tagId" value={tag.tagId} />
                      <input
                        name="location"
                        defaultValue={tag.location}
                        className="rounded-md border border-sentinel-charcoal/20 px-2 py-1.5 text-sm sm:col-span-2"
                      />
                      <select
                        name="logType"
                        defaultValue={tag.logType}
                        className="rounded-md border border-sentinel-charcoal/20 px-2 py-1.5 text-sm"
                      >
                        {pack.logTypes.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.label}
                          </option>
                        ))}
                      </select>
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
