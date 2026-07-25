import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark, ShieldMark } from "@/components/Wordmark";
import { getSession } from "@/lib/auth";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "sentinel" ? "/admin" : "/dashboard");

  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-sentinel-offwhite px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <ShieldMark className="h-9 w-9" />
          <Wordmark size="md" />
        </Link>

        <div className="rounded-2xl border border-sentinel-charcoal/10 bg-sentinel-white p-8">
          <h1 className="wordmark text-2xl text-sentinel-charcoal">Sign in</h1>
          <p className="mt-1 text-sm text-sentinel-charcoal/60">
            Dashboard and Admin access.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-bad-bg px-3 py-2 text-sm text-bad-text">
              Email or password is incorrect.
            </p>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-sentinel-charcoal"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 bg-sentinel-white px-3 py-2 text-sentinel-charcoal outline-none focus:border-sentinel-red"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-sentinel-charcoal"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-md border border-sentinel-charcoal/20 bg-sentinel-white px-3 py-2 text-sentinel-charcoal outline-none focus:border-sentinel-red"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-sentinel-red px-4 py-2.5 font-semibold text-sentinel-white hover:bg-sentinel-red/90"
            >
              Sign in
            </button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-sentinel-red hover:underline">
              Forgot password?
            </Link>
            <Link href="/pricing" className="text-sentinel-charcoal/60 hover:text-sentinel-red">
              New to Sentinel?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
