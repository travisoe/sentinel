/**
 * Supabase (Postgres) adapter — the production backend (SOUL §13.8 graduation).
 *
 * Implementation detail ONLY. Never imported outside lib/db. Uses the secret
 * (service-role) key server-side; it never reaches the browser. Row-Level
 * Security is enabled with no anon policies, so the publishable key can't touch
 * this data — only this server path (via the secret key) can.
 *
 * Log Entries are APPEND ONLY. Immutability is enforced in the database itself
 * by a BEFORE UPDATE/DELETE trigger (see supabase/schema.sql), which holds even
 * for the service-role key (SOUL §7.3, §11.5).
 *
 * Schema (supabase/schema.sql):
 *   clients(name pk, pack, status)
 *   tags(tag_id pk, client, location, log_type, frequency_days, install_date, status)
 *   log_entries(id, ts, tag_id, logged_by, notes, photo_url)
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ClientRecord,
  LogEntry,
  PackId,
  Tag,
  TagStatus,
} from "../types";
import type { DbAdapter } from "./adapter";

let cached: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY env vars.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

type TagRow = {
  tag_id: string;
  client: string;
  location: string;
  log_type: string;
  frequency_days: number;
  install_date: string | null;
  status: string;
};

type LogRow = {
  ts: string;
  tag_id: string;
  logged_by: string;
  notes: string | null;
  photo_url: string | null;
};

type ClientRow = {
  name: string;
  pack: string;
  status: string;
  plan?: string | null;
  billing_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  station_limit?: number | null;
  health_score?: number | null;
  health_band?: string | null;
  onboarding_status?: string | null;
  tags_ordered_at?: string | null;
  tags_shipped_at?: string | null;
  installed_at?: string | null;
  first_scan_at?: string | null;
};

function normalizePack(pack: string): PackId {
  // Backward compatibility for early data before "other" rename.
  if (pack === "generic") return "other";
  const allowed: PackId[] = [
    "warehouse",
    "healthcare",
    "construction",
    "foodservice",
    "hospitality",
    "retail",
    "education",
    "manufacturing",
    "other",
  ];
  return allowed.includes(pack as PackId) ? (pack as PackId) : "warehouse";
}

function toTag(r: TagRow): Tag {
  return {
    tagId: r.tag_id,
    client: r.client,
    location: r.location ?? "",
    logType: r.log_type ?? "",
    frequencyDays: Number(r.frequency_days) || 0,
    installDate: r.install_date ?? "",
    status: r.status === "Inactive" ? "Inactive" : "Active",
  };
}

function tagToRow(t: Tag): TagRow {
  return {
    tag_id: t.tagId,
    client: t.client,
    location: t.location,
    log_type: t.logType,
    frequency_days: t.frequencyDays,
    install_date: t.installDate || null,
    status: t.status,
  };
}

function toLog(r: LogRow): LogEntry {
  return {
    timestamp: r.ts,
    tagId: r.tag_id,
    loggedBy: r.logged_by,
    notes: r.notes ?? undefined,
    photoUrl: r.photo_url ?? undefined,
  };
}

function toClient(r: ClientRow): ClientRecord {
  return {
    client: r.name,
    pack: normalizePack(r.pack),
    status: r.status === "Inactive" ? "Inactive" : "Active",
    plan: (r.plan ?? undefined) as ClientRecord["plan"],
    billingStatus: (r.billing_status ?? "manual") as ClientRecord["billingStatus"],
    stripeCustomerId: r.stripe_customer_id ?? undefined,
    stripeSubscriptionId: r.stripe_subscription_id ?? undefined,
    contactName: r.contact_name ?? undefined,
    contactEmail: r.contact_email ?? undefined,
    contactPhone: r.contact_phone ?? undefined,
    stationLimit: r.station_limit,
    healthScore: r.health_score ?? 100,
    healthBand: (r.health_band ?? "green") as ClientRecord["healthBand"],
    onboardingStatus: r.onboarding_status ?? "not_started",
    tagsOrderedAt: r.tags_ordered_at ?? undefined,
    tagsShippedAt: r.tags_shipped_at ?? undefined,
    installedAt: r.installed_at ?? undefined,
    firstScanAt: r.first_scan_at ?? undefined,
  };
}

async function tagIdsForClient(client: string): Promise<string[]> {
  const { data, error } = await db()
    .from("tags")
    .select("tag_id")
    .eq("client", client);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => (r as { tag_id: string }).tag_id);
}

export function createSupabaseAdapter(): DbAdapter {
  return {
    async getTag(tagId) {
      const { data, error } = await db()
        .from("tags")
        .select("*")
        .eq("tag_id", tagId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toTag(data as TagRow) : null;
    },

    async getTagsByClient(client) {
      const { data, error } = await db()
        .from("tags")
        .select("*")
        .eq("client", client)
        .order("tag_id");
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => toTag(r as TagRow));
    },

    async registerTags(tags) {
      if (tags.length === 0) return;
      const { error } = await db()
        .from("tags")
        .upsert(tags.map(tagToRow), { onConflict: "tag_id" });
      if (error) throw new Error(error.message);
    },

    async updateTag(tagId, patch) {
      const row: Partial<TagRow> = {};
      if (patch.client !== undefined) row.client = patch.client;
      if (patch.location !== undefined) row.location = patch.location;
      if (patch.logType !== undefined) row.log_type = patch.logType;
      if (patch.frequencyDays !== undefined)
        row.frequency_days = patch.frequencyDays;
      if (patch.installDate !== undefined) row.install_date = patch.installDate;
      if (patch.status !== undefined) row.status = patch.status;
      const { error } = await db().from("tags").update(row).eq("tag_id", tagId);
      if (error) throw new Error(error.message);
    },

    async setTagStatus(tagId, status: TagStatus) {
      const { error } = await db()
        .from("tags")
        .update({ status })
        .eq("tag_id", tagId);
      if (error) throw new Error(error.message);
    },

    async appendLog(entry) {
      // APPEND ONLY — plain INSERT. UPDATE/DELETE are blocked by a DB trigger.
      const { error } = await db().from("log_entries").insert({
        ts: entry.timestamp,
        tag_id: entry.tagId,
        logged_by: entry.loggedBy,
        notes: entry.notes ?? null,
        photo_url: entry.photoUrl ?? null,
      });
      if (error) throw new Error(error.message);
    },

    async getLogs(client, range) {
      const ids = await tagIdsForClient(client);
      if (ids.length === 0) return [];
      let query = db().from("log_entries").select("*").in("tag_id", ids);
      if (range) {
        query = query.gte("ts", range.from).lte("ts", range.to);
      }
      const { data, error } = await query.order("ts", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => toLog(r as LogRow));
    },

    async listClients() {
      const { data, error } = await db()
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => toClient(r as ClientRow));
    },

    async getClient(client) {
      const { data, error } = await db()
        .from("clients")
        .select("*")
        .eq("name", client)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toClient(data as ClientRow) : null;
    },

    async upsertClient(record) {
      const { error } = await db()
        .from("clients")
        .upsert(
          {
            name: record.client,
            pack: record.pack,
            status: record.status,
            plan: record.plan ?? null,
            billing_status: record.billingStatus ?? "manual",
            stripe_customer_id: record.stripeCustomerId ?? null,
            stripe_subscription_id: record.stripeSubscriptionId ?? null,
            contact_name: record.contactName ?? null,
            contact_email: record.contactEmail ?? null,
            contact_phone: record.contactPhone ?? null,
            station_limit: record.stationLimit ?? null,
            health_score: record.healthScore ?? 100,
            health_band: record.healthBand ?? "green",
            onboarding_status: record.onboardingStatus ?? "not_started",
            tags_ordered_at: record.tagsOrderedAt ?? null,
            tags_shipped_at: record.tagsShippedAt ?? null,
            installed_at: record.installedAt ?? null,
            first_scan_at: record.firstScanAt ?? null,
          },
          { onConflict: "name" },
        );
      if (error) throw new Error(error.message);
    },
  };
}
