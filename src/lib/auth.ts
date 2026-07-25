import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Role = "sentinel" | "owner";

export type SessionUser = {
  userId?: string;
  email: string;
  role: Role;
  client?: string; // required for 'owner'
};

type UserRecord = SessionUser & { password: string };

const LEGACY_COOKIE_NAME = "sentinel_session";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function authSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

/** Users come from AUTH_USERS (JSON) or safe dev defaults. */
function getUsers(): UserRecord[] {
  const raw = process.env.AUTH_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as UserRecord[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to defaults
    }
  }
  if (process.env.NODE_ENV === "production") return [];
  return [
    { email: "admin@sentinel", password: "sentinel", role: "sentinel" },
    {
      email: "manager@demo",
      password: "demo",
      role: "owner",
      client: "Demo Warehouse",
    },
  ];
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function b64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyLegacyCredentials(
  email: string,
  password: string,
): SessionUser | null {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user) return null;
  if (!safeEqual(user.password, password)) return null;
  return { email: user.email, role: user.role, client: user.client };
}

function createToken(user: SessionUser): string {
  const body = b64({ ...user, exp: Date.now() + MAX_AGE_S * 1000 });
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!safeEqual(sig, sign(body))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as
      & SessionUser
      & { exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { email: data.email, role: data.role, client: data.client };
  } catch {
    return null;
  }
}

export async function createLegacySession(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(LEGACY_COOKIE_NAME, createToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  const jar = await cookies();
  jar.delete(LEGACY_COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user?.email) {
      const admin = createSupabaseAdminClient();
      if (admin) {
        const { data: profile } = await admin
          .from("profiles")
          .select("role,client")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role === "sentinel" || profile?.role === "owner") {
          return {
            userId: user.id,
            email: user.email,
            role: profile.role,
            client: profile.client ?? undefined,
          };
        }
      }

      // Safe transitional fallback: app_metadata is server-controlled.
      const role = user.app_metadata?.role;
      if (role === "sentinel" || role === "owner") {
        return {
          userId: user.id,
          email: user.email,
          role,
          client:
            typeof user.app_metadata?.client === "string"
              ? user.app_metadata.client
              : undefined,
        };
      }
    }
  }

  // Temporary migration safety net for the existing Sentinel admin account.
  const jar = await cookies();
  const token = jar.get(LEGACY_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Returns the session if it satisfies one of the allowed roles, else null. */
export async function requireRole(
  ...roles: Role[]
): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  if (roles.length && !roles.includes(session.role)) return null;
  return session;
}

export async function signIn(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return getSession();
  }

  const legacy = verifyLegacyCredentials(email, password);
  if (!legacy) return null;
  await createLegacySession(legacy);
  return legacy;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase Auth is not configured.");
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase Auth is not configured.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
