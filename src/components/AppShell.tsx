import Link from "next/link";
import { ShieldMark } from "@/components/Wordmark";
import type { Role } from "@/lib/auth";

/**
 * Product-UI chrome. Charcoal sidebar/top bar is the ONE allowed dark surface
 * (SOUL §6.2) — it reads as "product," not marketing "mood."
 */
export function AppShell({
  role,
  email,
  clientName,
  active,
  children,
}: {
  role: Role;
  email: string;
  clientName?: string;
  active: "dashboard" | "admin" | "onboarding" | "settings";
  children: React.ReactNode;
}) {
  const nav: {
    key: "dashboard" | "admin" | "onboarding" | "settings";
    label: string;
    href: string;
  }[] = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "onboarding", label: "Install & stations", href: "/onboarding" },
    { key: "settings", label: "Settings", href: "/settings" },
  ];
  if (role === "sentinel") {
    nav.push({ key: "admin", label: "Admin", href: "/admin" });
  }

  return (
    <div className="flex min-h-screen bg-sentinel-offwhite">
      <aside className="flex w-56 flex-col justify-between bg-sentinel-charcoal px-4 py-6 text-sentinel-white/90">
        <div>
          <Link href="/" className="flex items-center gap-2 px-2">
            <ShieldMark className="h-7 w-7" />
            <span className="wordmark text-xl text-sentinel-white">
              SENTINEL<span className="text-sentinel-red">.</span>
            </span>
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  active === item.key
                    ? "bg-sentinel-red text-sentinel-white"
                    : "text-sentinel-white/70 hover:bg-sentinel-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-2 text-xs text-sentinel-white/50">
          {clientName && <p className="mb-1 text-sentinel-white/80">{clientName}</p>}
          <p className="truncate">{email}</p>
          <Link href="/logout" className="mt-2 inline-block hover:text-sentinel-white">
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
