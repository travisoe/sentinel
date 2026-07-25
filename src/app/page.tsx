import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { PublicHeader } from "@/components/PublicHeader";
import { COPY } from "@/lib/copy";

const PILLARS = [
  { name: "Protect", text: "Safeguard people, operations, and reputation." },
  { name: "Prove", text: "Every action recorded, verified, timestamped." },
  { name: "See", text: "Real-time visibility into what's covered and what's not." },
  { name: "Act", text: "Close gaps faster and stay audit-ready, always." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-sentinel-offwhite">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="py-16 sm:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-sentinel-red">
            {COPY.tagline}
          </p>
          <h1 className="wordmark max-w-3xl text-5xl leading-[1.05] text-sentinel-charcoal sm:text-6xl">
            {COPY.hero}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-sentinel-charcoal/70">
            Staff tap a tag. It&apos;s logged — timestamped and unchangeable. You
            see gaps the moment they open, not the week of an audit.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="rounded-md bg-sentinel-red px-6 py-3 font-semibold text-sentinel-white hover:bg-sentinel-red/90"
            >
              See pricing
            </Link>
            <Link
              href="/t/DMO-001"
              className="rounded-md border border-sentinel-charcoal/15 bg-sentinel-white px-6 py-3 font-semibold text-sentinel-charcoal hover:border-sentinel-charcoal/30"
            >
              See a tap page
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-sentinel-charcoal/10 bg-sentinel-white p-5"
            >
              <h3 className="wordmark text-lg text-sentinel-red">{p.name}</h3>
              <p className="mt-2 text-sm text-sentinel-charcoal/70">{p.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-sentinel-charcoal/10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-8 text-sm text-sentinel-charcoal/60">
          <Wordmark size="sm" tagline />
          <p className="mt-3">
            One tap. One record. Zero guessing.
          </p>
          <p className="mt-4 border-t border-sentinel-charcoal/10 pt-4 text-xs font-semibold uppercase tracking-[0.14em]">
            Disabled veteran owned and operated
          </p>
        </div>
      </footer>
    </div>
  );
}
