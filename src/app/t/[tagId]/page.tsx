import { ShieldMark, Wordmark } from "@/components/Wordmark";
import { getClient, getTag } from "@/lib/db";
import { getLogTypeDef, logTypeLabel } from "@/lib/packs";
import { COPY } from "@/lib/copy";
import { TapForm } from "./TapForm";

/**
 * Tap Page (Milestone 1) — public, no auth, under 5 seconds tap-to-confirm.
 * Never shows prior entries. Graceful states for unknown / inactive tags.
 */
export default async function TapPage({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) {
  const { tagId } = await params;
  const tag = await getTag(tagId);

  return (
    <div className="flex min-h-screen flex-col bg-sentinel-offwhite">
      <header className="flex items-center justify-center gap-2 border-b border-sentinel-charcoal/10 py-4">
        <ShieldMark className="h-6 w-6" />
        <Wordmark size="sm" />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
        {!tag ? (
          <TapMessage title="Tag not recognized" body={COPY.unknownTag} />
        ) : tag.status !== "Active" ? (
          <TapMessage title="Station inactive" body={COPY.inactiveTag} />
        ) : (
          <ActiveTap tagId={tag.tagId} client={tag.client} location={tag.location} logType={tag.logType} />
        )}
      </main>

      <footer className="pb-6 text-center text-xs text-sentinel-charcoal/50">
        {COPY.tagline}
      </footer>
    </div>
  );
}

async function ActiveTap({
  tagId,
  client,
  location,
  logType,
}: {
  tagId: string;
  client: string;
  location: string;
  logType: string;
}) {
  const clientRec = await getClient(client);
  const def = clientRec ? getLogTypeDef(clientRec.pack, logType) : undefined;
  const label = logTypeLabel(clientRec?.pack, logType);

  return (
    <TapForm
      tagId={tagId}
      location={location}
      logTypeLabel={label}
      checklist={def?.checklist ?? []}
    />
  );
}

function TapMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-sentinel-charcoal/10 bg-sentinel-white p-8 text-center">
      <h1 className="wordmark text-2xl text-sentinel-charcoal">{title}</h1>
      <p className="mt-3 text-sentinel-charcoal/70">{body}</p>
    </div>
  );
}
