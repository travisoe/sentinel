import Link from "next/link";
import { Wordmark, ShieldMark } from "@/components/Wordmark";
import { resetPasswordAction } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <ShieldMark className="h-9 w-9" />
          <Wordmark size="md" />
        </Link>
        <section className="rounded-2xl border border-sentinel-charcoal/10 bg-white p-8">
          <h1 className="wordmark text-2xl">Choose a new password</h1>
          <p className="mt-2 text-sm text-sentinel-charcoal/60">
            Use at least 10 characters.
          </p>
          {error && (
            <p className="mt-4 rounded-md bg-bad-bg p-3 text-sm text-bad-text">
              {error === "length"
                ? "Password must be at least 10 characters."
                : "This reset link is invalid or expired. Request a new one."}
            </p>
          )}
          <form action={resetPasswordAction} className="mt-6 space-y-4">
            <input
              name="password"
              type="password"
              minLength={10}
              required
              autoComplete="new-password"
              className="w-full rounded-md border border-sentinel-charcoal/20 px-3 py-2"
            />
            <button className="w-full rounded-md bg-sentinel-red px-4 py-2.5 font-semibold text-white">
              Update password
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
