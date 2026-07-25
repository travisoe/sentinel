import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-sentinel-offwhite">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-bg text-3xl text-ok-text">
          ✓
        </div>
        <h1 className="wordmark mt-6 text-5xl">Payment received.</h1>
        <p className="mt-5 text-lg text-sentinel-charcoal/70">
          Your Sentinel account is being provisioned. Check your email for a
          secure link to set your password, then the onboarding wizard will walk
          you through your stations and install kit.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-md bg-sentinel-red px-6 py-3 font-semibold text-white"
        >
          Go to sign in
        </Link>
      </main>
    </div>
  );
}
