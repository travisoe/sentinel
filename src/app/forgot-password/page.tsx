import Link from "next/link";
import { Wordmark, ShieldMark } from "@/components/Wordmark";
import { forgotPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <ShieldMark className="h-9 w-9" />
          <Wordmark size="md" />
        </Link>
        <section className="rounded-2xl border border-sentinel-charcoal/10 bg-sentinel-white p-8">
          <h1 className="wordmark text-2xl">Reset password</h1>
          <p className="mt-2 text-sm text-sentinel-charcoal/60">
            Enter your account email. We’ll send a secure reset link.
          </p>
          {sent ? (
            <p className="mt-5 rounded-md bg-ok-bg p-3 text-sm text-ok-text">
              If that email has an account, a reset link is on the way.
            </p>
          ) : (
            <form action={forgotPasswordAction} className="mt-6 space-y-4">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
              />
              <button className="w-full rounded-md bg-sentinel-red px-4 py-2.5 font-semibold text-white">
                Send reset link
              </button>
            </form>
          )}
          <Link href="/login" className="mt-5 inline-block text-sm text-sentinel-red hover:underline">
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
