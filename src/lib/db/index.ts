/**
 * THE data-access module (SENTINEL_MASTER_BUILD_PROMPT §5).
 *
 * This is the ONLY place the backend is touched. Every component and route
 * imports from here — never from ./sheets or ./memory directly. Keeping this
 * interface stable is what makes the future Supabase/Postgres migration a
 * single-file swap (SOUL §13.8). Treat any direct backend call outside this
 * module (and its ./sheets, ./memory detail files) as a defect.
 *
 * Adapter selection: if Google service-account credentials are present we use
 * the Google Sheets backend; otherwise we fall back to an in-memory store so the
 * platform runs locally with zero secrets.
 */
import "server-only";
import type {
  ClientRecord,
  ComplianceRow,
  LogEntry,
  Tag,
  TagStatus,
} from "../types";
import { computeCompliance as computeComplianceRows } from "../compliance";
import type { DbAdapter } from "./adapter";
import { createMemoryAdapter } from "./memory";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
  );
}

export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.MASTER_INDEX_SHEET_ID,
  );
}

/** True when no real backend is configured and we're on the demo store. */
export function isDemoBackend(): boolean {
  return !isSupabaseConfigured() && !isSheetsConfigured();
}

let adapterPromise: Promise<DbAdapter> | null = null;
async function getAdapter(): Promise<DbAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      // Supabase is the primary backend (SOUL §13.8). Sheets remains supported.
      if (isSupabaseConfigured()) {
        const { createSupabaseAdapter } = await import("./supabase");
        return createSupabaseAdapter();
      }
      if (isSheetsConfigured()) {
        const { createSheetsAdapter } = await import("./sheets");
        return createSheetsAdapter();
      }
      return createMemoryAdapter();
    })();
  }
  return adapterPromise;
}

/* ------------------------------------------------------------------ *
 * Lightweight TTL cache for dashboard reads (30–60s) to respect the
 * Sheets rate limits (SOUL §13.8). Writes invalidate the affected keys.
 * ------------------------------------------------------------------ */
const CACHE_TTL_MS = 45_000;
type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

function invalidateClient(client: string) {
  for (const key of cache.keys()) {
    if (key.includes(client)) cache.delete(key);
  }
}
function invalidateAll() {
  cache.clear();
}

/* ------------------------------------------------------------------ *
 * Public interface (keep stable across any future DB swap).
 * ------------------------------------------------------------------ */

export async function getTag(tagId: string): Promise<Tag | null> {
  const adapter = await getAdapter();
  return adapter.getTag(tagId);
}

export async function getTagsByClient(client: string): Promise<Tag[]> {
  return cached(`tags:${client}`, async () => {
    const adapter = await getAdapter();
    return adapter.getTagsByClient(client);
  });
}

/** APPEND ONLY. The server sets the timestamp; client time is never trusted. */
export async function appendLog(
  entry: Omit<LogEntry, "timestamp">,
): Promise<void> {
  const adapter = await getAdapter();
  const full: LogEntry = { ...entry, timestamp: new Date().toISOString() };
  await adapter.appendLog(full);
  invalidateAll();
}

export async function getLogs(
  client: string,
  range?: { from: string; to: string },
): Promise<LogEntry[]> {
  const rangeKey = range ? `${range.from}..${range.to}` : "all";
  return cached(`logs:${client}:${rangeKey}`, async () => {
    const adapter = await getAdapter();
    return adapter.getLogs(client, range);
  });
}

export async function computeCompliance(
  client: string,
): Promise<ComplianceRow[]> {
  const [tags, logs] = await Promise.all([
    getTagsByClient(client),
    getLogs(client),
  ]);
  return computeComplianceRows(tags, logs);
}

/* ---- Admin: Tag Registry writes allowed; Log Entries never mutated ---- */

export async function registerTags(tags: Tag[]): Promise<void> {
  const adapter = await getAdapter();
  await adapter.registerTags(tags);
  for (const t of tags) invalidateClient(t.client);
}

export async function updateTagMeaning(
  tagId: string,
  patch: Partial<Tag>,
): Promise<void> {
  const adapter = await getAdapter();
  await adapter.updateTag(tagId, patch);
  invalidateAll();
}

export async function setTagStatus(
  tagId: string,
  status: TagStatus,
): Promise<void> {
  const adapter = await getAdapter();
  await adapter.setTagStatus(tagId, status);
  invalidateAll();
}

/* ---- Clients (Master Index) ---- */

export async function listClients(): Promise<ClientRecord[]> {
  const adapter = await getAdapter();
  return adapter.listClients();
}

export async function getClient(client: string): Promise<ClientRecord | null> {
  const adapter = await getAdapter();
  return adapter.getClient(client);
}

export async function upsertClient(record: ClientRecord): Promise<void> {
  const adapter = await getAdapter();
  await adapter.upsertClient(record);
  invalidateClient(record.client);
}
