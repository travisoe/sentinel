import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PLANS, isPlanId } from "@/lib/billing/plans";
import { PACKS } from "@/lib/packs";

export const metadata: Metadata = {
  title: "Get started — Sentinel",
  description: "Create your Sentinel account and begin replacing paper with proof.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; pilot?: string; error?: string }>;
}) {
  const params = await searchParams;
  const selectedPlan = params.plan && isPlanId(params.plan)
    ? params.plan
    : "warehouse_starter";

  return (
    <div className="min-h-screen bg-sentinel-offwhite">
      <PublicHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1fr_430px]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sentinel-red">
            Start showing proof
          </p>
          <h1 className="wordmark mt-3 text-5xl leading-none">
            Set up your Sentinel account.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sentinel-charcoal/70">
            Choose the operation and plan. Stripe handles payment securely.
            After payment, Sentinel creates your account and walks you through
            station setup.
          </p>
          <div className="mt-8 rounded-xl border border-sentinel-charcoal/10 bg-white p-5">
            <p className="font-semibold">What happens next</p>
            <ol className="mt-3 space-y-3 text-sm text-sentinel-charcoal/70">
              <li>1. Complete secure Stripe Checkout.</li>
              <li>2. Receive an email to set your dashboard password.</li>
              <li>3. Add stations and download the placement/QR install kit.</li>
              <li>4. Program NFC tags with the generated station URLs.</li>
            </ol>
          </div>
        </section>

        <section className="rounded-2xl border border-sentinel-charcoal/10 bg-white p-7">
          <h2 className="wordmark text-2xl">
            {params.pilot === "1" ? "Apply for paid pilot" : "Account details"}
          </h2>
          {params.error && (
            <p className="mt-4 rounded-md bg-bad-bg p-3 text-sm text-bad-text">
              Checkout could not be started. Check the details or contact Sentinel.
            </p>
          )}
          <form action="/api/stripe/checkout" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="pilot" value={params.pilot ?? ""} />
            <Field label="Company" name="company" autoComplete="organization" />
            <Field label="Your name" name="contactName" autoComplete="name" />
            <Field label="Work email" name="email" type="email" autoComplete="email" />
            <Field
              label="Phone (optional)"
              name="contactPhone"
              type="tel"
              required={false}
              autoComplete="tel"
            />
            <label className="block text-sm font-medium">
              Industry
              <select
                name="pack"
                defaultValue={PLANS[selectedPlan].defaultPack}
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
              >
                {Object.values(PACKS).map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Plan
              <select
                name="plan"
                defaultValue={selectedPlan}
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
              >
                {Object.values(PLANS).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.monthlyDisplay}
                  </option>
                ))}
              </select>
            </label>
            <button className="w-full rounded-md bg-sentinel-red px-5 py-3 font-semibold text-white">
              Continue to secure checkout
            </button>
            <p className="text-xs text-sentinel-charcoal/50">
              The setup fee is mandatory and shown before payment. No card details
              are handled by Sentinel.
            </p>
          </form>
          <Link href="/pricing" className="mt-4 inline-block text-sm text-sentinel-red hover:underline">
            Compare plans
          </Link>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
      />
    </label>
  );
}
