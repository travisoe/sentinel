/**
 * Google Sheets adapter — the production backend (SOUL §13.4).
 *
 * Implementation detail ONLY. Never imported outside lib/db. All calls use a
 * service account (server-side); credentials never reach the browser.
 *
 * Schema mirrors sentinel-compliance-tracker.xlsx (SOUL §13.3):
 *   Master Index workbook: Client | Spreadsheet ID | Pack | Status
 *   Per-client workbook tabs:
 *     Tag Registry:  Tag ID | Client | Location | Log Type |
 *                    Required Frequency | Frequency (Days) | Install Date | Status
 *     Log Entries:   Timestamp | Tag ID | Logged By | Notes | Photo URL
 *
 * Writes to Log Entries are APPEND ONLY (spreadsheets.values.append). There is
 * deliberately no update/delete path for a log row (SOUL §7.3, §11.5).
 */
import { google, type sheets_v4 } from "googleapis";
import type {
  ClientRecord,
  LogEntry,
  PackId,
  Tag,
  TagStatus,
} from "../types";
import type { DbAdapter } from "./adapter";

const TAG_REGISTRY = "Tag Registry";
const LOG_ENTRIES = "Log Entries";
const COMPLIANCE_TAB = "Compliance Dashboard";

const TAG_HEADERS = [
  "Tag ID",
  "Client",
  "Location",
  "Log Type",
  "Required Frequency",
  "Frequency (Days)",
  "Install Date",
  "Status",
];
const LOG_HEADERS = ["Timestamp", "Tag ID", "Logged By", "Notes", "Photo URL"];
const MASTER_HEADERS = ["Client", "Spreadsheet ID", "Pack", "Status"];

function frequencyLabel(days: number): string {
  if (days === 1) return "Daily";
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  return `${days} days`;
}

let cachedClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY env vars.",
    );
  }
  // Vercel stores the key with literal \n — normalize to real newlines.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

function masterSheetId(): string {
  const id = process.env.MASTER_INDEX_SHEET_ID;
  if (!id) throw new Error("Missing MASTER_INDEX_SHEET_ID env var.");
  return id;
}

async function readRange(
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as string[][] | undefined) ?? [];
}

/** Ensure a tab exists in a workbook and has its header row. */
async function ensureTab(
  spreadsheetId: string,
  title: string,
  headers: string[],
): Promise<void> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
  const firstRow = await readRange(spreadsheetId, `${title}!A1:Z1`);
  if (firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

function rowToTag(row: string[]): Tag {
  return {
    tagId: row[0] ?? "",
    client: row[1] ?? "",
    location: row[2] ?? "",
    logType: row[3] ?? "",
    frequencyDays: Number(row[5] ?? 0) || 0,
    installDate: row[6] ?? "",
    status: (row[7] as TagStatus) === "Inactive" ? "Inactive" : "Active",
  };
}

function tagToRow(tag: Tag): string[] {
  return [
    tag.tagId,
    tag.client,
    tag.location,
    tag.logType,
    frequencyLabel(tag.frequencyDays),
    String(tag.frequencyDays),
    tag.installDate,
    tag.status,
  ];
}

function rowToLog(row: string[]): LogEntry {
  return {
    timestamp: row[0] ?? "",
    tagId: row[1] ?? "",
    loggedBy: row[2] ?? "",
    notes: row[3] || undefined,
    photoUrl: row[4] || undefined,
  };
}

// In the Sheets backend a client always has a spreadsheet id.
type SheetClientRecord = ClientRecord & { spreadsheetId: string };

function rowToClient(row: string[]): SheetClientRecord {
  return {
    client: row[0] ?? "",
    spreadsheetId: row[1] ?? "",
    pack: ((row[2] as PackId) || "warehouse") as PackId,
    status: (row[3] as ClientRecord["status"]) === "Inactive" ? "Inactive" : "Active",
  };
}

async function getClientRecords(): Promise<SheetClientRecord[]> {
  const rows = await readRange(masterSheetId(), "A2:D");
  return rows.filter((r) => r[0]).map(rowToClient);
}

async function spreadsheetIdForClient(client: string): Promise<string | null> {
  const rec = (await getClientRecords()).find((c) => c.client === client);
  return rec?.spreadsheetId ?? null;
}

export function createSheetsAdapter(): DbAdapter {
  return {
    async getTag(tagId) {
      for (const c of await getClientRecords()) {
        const rows = await readRange(c.spreadsheetId, `${TAG_REGISTRY}!A2:H`);
        const match = rows.find((r) => r[0] === tagId);
        if (match) return rowToTag(match);
      }
      return null;
    },

    async getTagsByClient(client) {
      const spreadsheetId = await spreadsheetIdForClient(client);
      if (!spreadsheetId) return [];
      const rows = await readRange(spreadsheetId, `${TAG_REGISTRY}!A2:H`);
      return rows.filter((r) => r[0]).map(rowToTag);
    },

    async registerTags(tags) {
      if (tags.length === 0) return;
      const byClient = new Map<string, Tag[]>();
      for (const t of tags) {
        const arr = byClient.get(t.client) ?? [];
        arr.push(t);
        byClient.set(t.client, arr);
      }
      const sheets = getSheetsClient();
      for (const [client, clientTags] of byClient) {
        const spreadsheetId = await spreadsheetIdForClient(client);
        if (!spreadsheetId) {
          throw new Error(
            `No spreadsheet mapped for client "${client}" in the Master Index.`,
          );
        }
        await ensureTab(spreadsheetId, TAG_REGISTRY, TAG_HEADERS);
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${TAG_REGISTRY}!A1`,
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: clientTags.map(tagToRow) },
        });
      }
    },

    async updateTag(tagId, patch) {
      const sheets = getSheetsClient();
      for (const c of await getClientRecords()) {
        const rows = await readRange(c.spreadsheetId, `${TAG_REGISTRY}!A2:H`);
        const idx = rows.findIndex((r) => r[0] === tagId);
        if (idx >= 0) {
          const updated: Tag = { ...rowToTag(rows[idx]), ...patch };
          await sheets.spreadsheets.values.update({
            spreadsheetId: c.spreadsheetId,
            range: `${TAG_REGISTRY}!A${idx + 2}`,
            valueInputOption: "RAW",
            requestBody: { values: [tagToRow(updated)] },
          });
          return;
        }
      }
      throw new Error(`Tag "${tagId}" not found.`);
    },

    async setTagStatus(tagId, status: TagStatus) {
      await this.updateTag(tagId, { status });
    },

    async appendLog(entry) {
      // APPEND ONLY — spreadsheets.values.append (SOUL §7.3, §13.4).
      const spreadsheetId = await (async () => {
        // Resolve the client that owns this tag.
        for (const c of await getClientRecords()) {
          const rows = await readRange(c.spreadsheetId, `${TAG_REGISTRY}!A2:A`);
          if (rows.some((r) => r[0] === entry.tagId)) return c.spreadsheetId;
        }
        return null;
      })();
      if (!spreadsheetId) {
        throw new Error(`Tag "${entry.tagId}" not found for logging.`);
      }
      await ensureTab(spreadsheetId, LOG_ENTRIES, LOG_HEADERS);
      const sheets = getSheetsClient();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${LOG_ENTRIES}!A1`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [
            [
              entry.timestamp,
              entry.tagId,
              entry.loggedBy,
              entry.notes ?? "",
              entry.photoUrl ?? "",
            ],
          ],
        },
      });
    },

    async getLogs(client, range) {
      const spreadsheetId = await spreadsheetIdForClient(client);
      if (!spreadsheetId) return [];
      const rows = await readRange(spreadsheetId, `${LOG_ENTRIES}!A2:E`);
      let logs = rows.filter((r) => r[0]).map(rowToLog);
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
      return getClientRecords();
    },

    async getClient(client) {
      return (await getClientRecords()).find((c) => c.client === client) ?? null;
    },

    async upsertClient(record) {
      const sheets = getSheetsClient();
      const id = masterSheetId();
      await ensureTab(id, "Sheet1", MASTER_HEADERS).catch(() => {});
      const rows = await readRange(id, "A2:D");
      const idx = rows.findIndex((r) => r[0] === record.client);
      const values = [
        [record.client, record.spreadsheetId ?? "", record.pack, record.status],
      ];
      if (idx >= 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: id,
          range: `A${idx + 2}`,
          valueInputOption: "RAW",
          requestBody: { values },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: id,
          range: "A1",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values },
        });
      }
    },
  };
}

export { COMPLIANCE_TAB };
