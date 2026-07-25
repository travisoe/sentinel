import Link from "next/link";
import { ShieldMark, Wordmark } from "@/components/Wordmark";

export function PublicHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <ShieldMark className="h-9 w-9" />
        <Wordmark size="md" />
      </Link>
      <nav className="flex items-center gap-5 text-sm font-medium">
        <Link href="/about" className="hover:text-sentinel-red">
          About
        </Link>
        <Link href="/pricing" className="hover:text-sentinel-red">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-sentinel-red">
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-sentinel-red px-4 py-2 text-white hover:bg-sentinel-red/90"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}
