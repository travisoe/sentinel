/**
 * Shared domain types for the Sentinel Compliance Platform.
 * Schema mirrors sentinel-compliance-tracker.xlsx exactly (SOUL §13.3).
 */

export type LogType = string; // references a LogTypeDef.key from the client's template pack

export type TagStatus = "Active" | "Inactive";

export type Tag = {
  tagId: string; // "BSD-003" (primary key, unique across all clients)
  client: string;
  location: string; // "Room 1 — Door"
  logType: LogType; // key from the assigned template pack (SOUL §13.6)
  frequencyDays: number; // 1 | 7 | 30 — machine value for gap math
  installDate: string;
  status: TagStatus;
};

export type LogEntry = {
  timestamp: string; // ISO, SERVER-set — never client-supplied
  tagId: string;
  loggedBy: string;
  notes?: string;
  photoUrl?: string; // optional; only if photo capture enabled
};

export type ComplianceStatus =
  | "Compliant"
  | "Gap — due soon"
  | "Overdue"
  | "No log yet";

// Omit Tag's Active/Inactive status; here `status` is the computed compliance state.
export type ComplianceRow = Omit<Tag, "status"> & {
  lastLogged: string | null;
  daysSince: number | null;
  status: ComplianceStatus;
};

export type PackId = "warehouse" | "healthcare" | "generic";

export type LogTypeDef = {
  key: string; // 'forklift_preshift'
  label: string; // 'Forklift Pre-Shift Inspection'
  checklist?: string[]; // ordered confirm prompts, all required
  defaultFrequencyDays: number;
  photoEnabled?: boolean; // whether the Tap Page offers optional photo capture
};

export type TemplatePack = {
  id: PackId;
  label: string;
  logTypes: LogTypeDef[];
};

/** A client onboarding record. `spreadsheetId` is Google-Sheets-specific and
 * unused by the Supabase backend. */
export type ClientRecord = {
  client: string;
  spreadsheetId?: string;
  pack: PackId;
  status: "Active" | "Inactive";
};
