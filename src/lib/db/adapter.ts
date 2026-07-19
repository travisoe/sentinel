/**
 * Internal storage adapter contract. Implementations: in-memory (dev) and
 * Google Sheets (production). NOTHING in the app imports these directly —
 * everything goes through lib/db/index.ts (the data-access boundary).
 */
import type { ClientRecord, LogEntry, Tag, TagStatus } from "../types";

export interface DbAdapter {
  // Tags
  getTag(tagId: string): Promise<Tag | null>;
  getTagsByClient(client: string): Promise<Tag[]>;
  registerTags(tags: Tag[]): Promise<void>;
  updateTag(tagId: string, patch: Partial<Tag>): Promise<void>;
  setTagStatus(tagId: string, status: TagStatus): Promise<void>;

  // Logs — APPEND ONLY. Full entry incl. server-set timestamp is passed in.
  appendLog(entry: LogEntry): Promise<void>;
  getLogs(
    client: string,
    range?: { from: string; to: string },
  ): Promise<LogEntry[]>;

  // Clients (Master Index)
  listClients(): Promise<ClientRecord[]>;
  getClient(client: string): Promise<ClientRecord | null>;
  upsertClient(record: ClientRecord): Promise<void>;
}
