import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/auth";
import { getClient, getTagsByClient, listClients } from "@/lib/db";
import { getPack, logTypeLabel } from "@/lib/packs";
import { StationBuilder } from "./StationBuilder";
import { markInstallationAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; saved?: string }>;
}) {
  const session = await requireRole("owner", "sentinel");
  if (!session) redirect("/login");
  const params = await searchParams;
  let clientName = session.client ?? params.client;
  if (!clientName && session.role === "sentinel") {
    clientName = (await listClients())[0]?.client;
  }
  if (!clientName) redirect("/admin");

  const client = await getClient(clientName);
  if (!client) redirect("/admin");
  const tags = await getTagsByClient(clientName);
  const pack = getPack(client.pack);
  const remaining =
    client.stationLimit == null
      ? null
      : Math.max(0, client.stationLimit - tags.length);

  return (
    <AppShell
      role={session.role}
      email={session.email}
      clientName={clientName}
      active="onboarding"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-sentinel-red">
          Guided setup
        </p>
        <h1 className="wordmark mt-2 text-4xl">Install {clientName}</h1>
        <p className="mt-2 text-sentinel-charcoal/65">
          Add each physical station. Sentinel creates the tag identity, tap URL,
          QR backup, and placement documents.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {["Account active", "Stations configured", "Install kit ready", "Installed"].map(
            (label, index) => {
              const complete =
                index === 0 ||
                (index <= 2 && tags.length > 0) ||
                (index === 3 && client.onboardingStatus === "installed");
              return (
                <div
                  key={label}
                  className={`rounded-lg border p-3 text-sm ${
                    complete
                      ? "border-ok-text/20 bg-ok-bg text-ok-text"
                      : "border-sentinel-charcoal/10 bg-white text-sentinel-charcoal/50"
                  }`}
                >
                  {complete ? "✓ " : `${index + 1}. `}
                  {label}
                </div>
              );
            },
          )}
        </div>

        <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="wordmark text-xl">Add stations</h2>
              <p className="text-sm text-sentinel-charcoal/55">
                {client.stationLimit == null
                  ? "Unlimited stations on this plan."
                  : `${remaining} of ${client.stationLimit} station slots remain.`}
              </p>
            </div>
            <span className="rounded-full bg-sentinel-offwhite px-3 py-1 text-xs">
              {pack.label}
            </span>
          </div>
          {remaining === 0 ? (
            <p className="mt-5 rounded-md bg-gap-bg p-3 text-sm text-gap-text">
              This plan’s station limit is reached. Upgrade from the dashboard to
              add more.
            </p>
          ) : (
            <StationBuilder
              client={clientName}
              logTypes={pack.logTypes}
              remaining={remaining}
            />
          )}
        </section>

        {tags.length > 0 && (
          <section className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="wordmark text-xl">Install kit</h2>
                <p className="text-sm text-sentinel-charcoal/55">
                  Download placement data or printable QR station cards.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/api/placement?client=${encodeURIComponent(clientName)}`}
                  className="rounded-md border border-sentinel-charcoal/20 px-4 py-2 text-sm font-semibold"
                >
                  Placement CSV
                </Link>
                <Link
                  href={`/api/install-kit?client=${encodeURIComponent(clientName)}`}
                  className="rounded-md bg-sentinel-charcoal px-4 py-2 text-sm font-semibold text-white"
                >
                  Printable QR kit
                </Link>
              </div>
            </div>
            <div className="mt-5 divide-y divide-sentinel-charcoal/10 rounded-lg border border-sentinel-charcoal/10">
              {tags.map((tag) => (
                <div key={tag.tagId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{tag.tagId} · {tag.location}</p>
                    <p className="text-sentinel-charcoal/50">
                      {logTypeLabel(client.pack, tag.logType)}
                    </p>
                  </div>
                  <Link href={`/t/${tag.tagId}`} className="text-sentinel-red hover:underline">
                    Test page
                  </Link>
                </div>
              ))}
            </div>
            <form action={markInstallationAction} className="mt-5">
              <input type="hidden" name="client" value={clientName} />
              <button className="rounded-md bg-ok-text px-5 py-2.5 font-semibold text-white">
                Mark installation complete
              </button>
            </form>
          </section>
        )}
      </div>
    </AppShell>
  );
}
