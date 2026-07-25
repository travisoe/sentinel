"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { appendLog, getTag, openIssue } from "@/lib/db";

const REASONS = new Set([
  "missed_scan",
  "broken_nfc",
  "process_break",
  "offline_device",
  "other",
]);

/**
 * Manager/manual completion: append a NEW immutable log entry with a reason.
 * This never edits/deletes history; it adds a timestamped correction record.
 */
export async function recordManagerCompletionAction(formData: FormData) {
  const session = await requireRole("owner", "sentinel");
  if (!session) throw new Error("Not authorized.");

  const tagId = String(formData.get("tagId") ?? "").trim();
  const client = String(formData.get("client") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!tagId || !client) throw new Error("Missing tag or client.");
  if (!REASONS.has(reason)) throw new Error("Invalid reason.");

  const tag = await getTag(tagId);
  if (!tag) throw new Error("Unknown tag.");
  if (tag.client !== client) throw new Error("Tag/client mismatch.");

  // Owners are scoped to their own client only.
  if (session.role === "owner" && session.client !== client) {
    throw new Error("Not authorized for this client.");
  }

  const prefix =
    `Manager completion recorded (${reason.replaceAll("_", " ")}).`;
  const mergedNotes = notes ? `${prefix} ${notes}` : prefix;

  await appendLog({
    tagId,
    loggedBy: session.email,
    notes: mergedNotes,
  });

  const actionable = new Set(["broken_nfc", "process_break", "offline_device"]);
  if (actionable.has(reason)) {
    await openIssue({
      client,
      tagId,
      type: reason,
      severity: reason === "broken_nfc" ? "high" : "medium",
      openedBy: session.email,
      notes: mergedNotes,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
