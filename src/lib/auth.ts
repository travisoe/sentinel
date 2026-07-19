/**
 * Auth for the Dashboard + Admin surfaces (SENTINEL_MASTER_BUILD_PROMPT §2).
 * The Tap Page is public and unauthenticated by design (SOUL §7.1).
 *
 * MVP implementation: a small HMAC-signed session cookie over an env-configured
 * user list. It is intentionally dependency-light and self-contained so the app
 * deploys with only AUTH_SECRET set. It can be swapped for Auth.js/NextAuth
 * without touching callers — they only use getSession()/requireRole().
 *
 * Roles:
 *   'sentinel' — Sentinel staff; full Admin console access.
 *   'owner'    — client owner/manager; Dashboard access, scoped to their client.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Role = "sentinel" | "owner";

export type SessionUser = {
  email: string;
  role: Role;
  client?: string; // required for 'owner'
};

type UserRecord = SessionUser & { password: string };

const COOKIE_NAME = "sentinel_session";
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

export function verifyCredentials(
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

export async function createSession(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
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
