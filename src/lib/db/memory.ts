/**
 * In-memory adapter — the zero-secrets development & demo fallback.
 *
 * Used automatically when Google service-account credentials are absent, so the
 * whole platform runs with `npm run dev` out of the box. It is seeded with one
 * demo warehouse client so the Tap Page, Dashboard, and Admin all have data.
 *
 * NOTE: this is process-memory only; it resets on restart and does not persist
 * across serverless invocations. Production uses the Google Sheets adapter.
 */
import type { ClientRecord, LogEntry, Tag, TagStatus } from "../types";
import type { DbAdapter } from "./adapter";

type Store = {
  clients: ClientRecord[];
  tags: Tag[];
  logs: LogEntry[];
};

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function seed(): Store {
  const client = "Demo Warehouse";
  const tags: Tag[] = [
    {
      tagId: "DMO-001",
      client,
      location: "Bay 1 — Forklift #4",
      logType: "forklift_preshift",
      frequencyDays: 1,
      installDate: daysAgo(30),
      status: "Active",
    },
    {
      tagId: "DMO-002",
      client,
      location: "Dock Door 3",
      logType: "dock_plate_check",
      frequencyDays: 1,
      installDate: daysAgo(30),
      status: "Active",
    },
    {
      tagId: "DMO-003",
      client,
      location: "Aisle 7 — Racking",
      logType: "racking_damage",
      frequencyDays: 7,
      installDate: daysAgo(30),
      status: "Active",
    },
    {
      tagId: "DMO-004",
      client,
      location: "North Emergency Exit",
      logType: "emergency_exit",
      frequencyDays: 7,
      installDate: daysAgo(30),
      status: "Active",
    },
    {
      tagId: "DMO-005",
      client,
      location: "Break Room — First-Aid / AED",
      logType: "first_aid_aed_eyewash",
      frequencyDays: 30,
      installDate: daysAgo(30),
      status: "Active",
    },
    {
      tagId: "DMO-006",
      client,
      location: "Shipping Office — Extinguisher",
      logType: "fire_extinguisher_visual",
      frequencyDays: 30,
      installDate: daysAgo(30),
      status: "Active",
    },
  ];

  const logs: LogEntry[] = [
    // Forklift — logged today: Compliant
    { timestamp: daysAgo(0.2), tagId: "DMO-001", loggedBy: "J. Rivera" },
    { timestamp: daysAgo(1.1), tagId: "DMO-001", loggedBy: "J. Rivera" },
    { timestamp: daysAgo(2.1), tagId: "DMO-001", loggedBy: "M. Ostrowski" },
    // Dock — logged ~1.3 days ago on a daily cadence: Gap — due soon
    { timestamp: daysAgo(1.3), tagId: "DMO-002", loggedBy: "M. Ostrowski" },
    // Racking (weekly) — last 3 days ago: Compliant
    { timestamp: daysAgo(3), tagId: "DMO-003", loggedBy: "T. Cole" },
    // Emergency exit (weekly) — last 12 days ago: Overdue
    { timestamp: daysAgo(12), tagId: "DMO-004", loggedBy: "T. Cole" },
    // First-aid (monthly) — last 10 days ago: Compliant
    { timestamp: daysAgo(10), tagId: "DMO-005", loggedBy: "A. Patel" },
    // Extinguisher (monthly) — no logs yet: No log yet
  ];

  return {
    clients: [
      {
        client,
        spreadsheetId: "memory://demo-warehouse",
        pack: "warehouse",
        status: "Active",
      },
    ],
    tags,
    logs,
  };
}

// Persist across hot reloads in dev via globalThis.
const g = globalThis as unknown as { __sentinelStore?: Store };
const store: Store = g.__sentinelStore ?? (g.__sentinelStore = seed());

export function createMemoryAdapter(): DbAdapter {
  return {
    async getTag(tagId) {
      return store.tags.find((t) => t.tagId === tagId) ?? null;
    },
    async getTagsByClient(client) {
      return store.tags.filter((t) => t.client === client);
    },
    async registerTags(tags) {
      for (const tag of tags) {
        const idx = store.tags.findIndex((t) => t.tagId === tag.tagId);
        if (idx >= 0) store.tags[idx] = tag;
        else store.tags.push(tag);
      }
    },
    async updateTag(tagId, patch) {
      const idx = store.tags.findIndex((t) => t.tagId === tagId);
      if (idx >= 0) store.tags[idx] = { ...store.tags[idx], ...patch };
    },
    async setTagStatus(tagId, status: TagStatus) {
      const idx = store.tags.findIndex((t) => t.tagId === tagId);
      if (idx >= 0) store.tags[idx] = { ...store.tags[idx], status };
    },
    async appendLog(entry) {
      // APPEND ONLY. No path updates or deletes an existing row.
      store.logs.push(entry);
    },
    async getLogs(client, range) {
      const tagIds = new Set(
        store.tags.filter((t) => t.client === client).map((t) => t.tagId),
      );
      let logs = store.logs.filter((l) => tagIds.has(l.tagId));
      if (range) {
        const from = new Date(range.from).getTime();
        const to = new Date(range.to).getTime();
        logs = logs.filter((l) => {
          const t = new Date(l.timestamp).getTime();
          return t >= from && t <= to;
        });
      }
      return logs;
    },
    async listClients() {
      return [...store.clients];
    },
    async getClient(client) {
      return store.clients.find((c) => c.client === client) ?? null;
    },
    async upsertClient(record) {
      const idx = store.clients.findIndex((c) => c.client === record.client);
      if (idx >= 0) store.clients[idx] = record;
      else store.clients.push(record);
    },
  };
}
