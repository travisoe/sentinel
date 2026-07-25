import type { Metadata } from "next";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "About — Sentinel",
  description:
    "Sentinel turns everyday safety and compliance actions into verifiable proof.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sentinel-offwhite">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sentinel-red">
          Why Sentinel exists
        </p>
        <h1 className="wordmark mt-3 text-5xl leading-none">
          The work was real. Now the proof is too.
        </h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-sentinel-charcoal/75">
          <p>
            Sentinel Safety was founded by Travis Oelker in Braselton, Georgia.
            After seeing the same thing in facility after facility—legally
            required safety checks recorded on paper that proved nothing, signed
            from memory, filed in binders, and opened only when something went
            wrong—he built Sentinel to close that gap.
          </p>
          <p>
            Safety work was being done but could not be shown. Sentinel makes the
            client’s own work provable: simple tap-to-log stations, a live
            dashboard, and records that cannot be rewritten.
          </p>
          <p>
            Sentinel does not perform the client’s checks and does not promise
            what an inspector will conclude. The client’s staff performs the
            work. Sentinel provides the timestamped proof.
          </p>
        </div>
        <aside className="mt-12 rounded-xl border border-sentinel-charcoal/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sentinel-red">
            Ownership
          </p>
          <p className="mt-2 text-lg font-semibold">
            Disabled veteran owned and operated.
          </p>
          <p className="mt-1 text-sm text-sentinel-charcoal/60">
            Founded, run, and delivered by a disabled U.S. military veteran.
          </p>
        </aside>
      </main>
    </div>
  );
}
