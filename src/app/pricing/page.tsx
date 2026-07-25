import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PLANS } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing — Sentinel",
  description: "Clear pricing for timestamped, unchangeable compliance proof.",
};

const groups = [
  {
    title: "Warehouse & Distribution",
    subtitle: "Warehouse-first plans for recurring shift and facility checks.",
    ids: ["warehouse_starter", "warehouse_plus"] as const,
  },
  {
    title: "Healthcare / Clinic",
    subtitle: "Proof logs for practices and small regulated facilities.",
    ids: ["healthcare_starter", "healthcare_plus"] as const,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-sentinel-offwhite">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sentinel-red">
          Compliance, proven.
        </p>
        <h1 className="wordmark mt-3 max-w-3xl text-5xl leading-none">
          Proof that fits the operation.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-sentinel-charcoal/70">
          Every plan includes browser-based tap-to-log stations, server timestamps,
          and records that cannot be rewritten. No app. No point-of-use login.
        </p>

        {groups.map((group) => (
          <section key={group.title} className="mt-14">
            <h2 className="wordmark text-2xl">{group.title}</h2>
            <p className="mt-1 text-sentinel-charcoal/60">{group.subtitle}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {group.ids.map((id) => (
                <PlanCard key={id} plan={PLANS[id]} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="wordmark text-2xl">Managed</h2>
          <p className="mt-1 text-sentinel-charcoal/60">
            Remote program support for clients that want more than the platform.
          </p>
          <div className="mt-5 max-w-xl">
            <PlanCard plan={PLANS.managed} />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-sentinel-charcoal/10 bg-white p-8">
          <h2 className="wordmark text-2xl">Paid pilot</h2>
          <p className="mt-2 max-w-2xl text-sentinel-charcoal/70">
            Need to prove the workflow at one warehouse first? Apply for a focused,
            five-station paid pilot. Setup is $499 and the first month is included;
            continued service is $299/month.
          </p>
          <Link
            href="/register?plan=warehouse_starter&pilot=1"
            className="mt-5 inline-flex rounded-md border border-sentinel-red px-5 py-2.5 font-semibold text-sentinel-red"
          >
            Apply for a paid pilot
          </Link>
        </section>
      </main>
    </div>
  );
}

function PlanCard({ plan }: { plan: (typeof PLANS)[keyof typeof PLANS] }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-sentinel-charcoal/10 bg-white p-7">
      <h3 className="wordmark text-2xl">{plan.name}</h3>
      <div className="mt-4">
        <p className="wordmark text-4xl text-sentinel-red">{plan.monthlyDisplay}</p>
        <p className="mt-1 text-sm text-sentinel-charcoal/55">{plan.setupDisplay}</p>
      </div>
      <p className="mt-4 text-sentinel-charcoal/70">{plan.description}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-sentinel-charcoal/75">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="font-bold text-ok-text">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/register?plan=${plan.id}`}
        className="mt-7 rounded-md bg-sentinel-red px-5 py-3 text-center font-semibold text-white"
      >
        Choose {plan.name}
      </Link>
    </article>
  );
}
