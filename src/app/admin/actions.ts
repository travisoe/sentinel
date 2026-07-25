"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addCorrectiveAction,
  getTagsByClient,
  registerTags,
  setTagStatus,
  updateClientPlatform,
  updateIssue,
  updateTagMeaning,
  upsertClient,
} from "@/lib/db";
import { getLogTypeDef } from "@/lib/packs";
import type { PackId, Tag, TagStatus } from "@/lib/types";

async function assertSentinel() {
  const session = await requireRole("sentinel");
  if (!session) throw new Error("Not authorized.");
}

/** Onboard a client: assign a template pack + map their workbook. */
export async function createClientAction(formData: FormData) {
  await assertSentinel();
  const client = String(formData.get("client") ?? "").trim();
  const pack = String(formData.get("pack") ?? "warehouse") as PackId;
  const spreadsheetId =
    String(formData.get("spreadsheetId") ?? "").trim() ||
    `memory://${client.toLowerCase().replace(/\s+/g, "-")}`;

  if (!client) throw new Error("Client name is required.");

  await upsertClient({ client, spreadsheetId, pack, status: "Active" });
  revalidatePath("/admin");
}

/**
 * Bulk-register tags from a pasted placement list. One tag per line:
 *   tagId, location, logTypeKey[, frequencyDays]
 * Frequency falls back to the pack's default for that log type.
 */
export async function registerTagsAction(formData: FormData) {
  await assertSentinel();
  const client = String(formData.get("client") ?? "").trim();
  const pack = String(formData.get("pack") ?? "warehouse") as PackId;
  const raw = String(formData.get("tags") ?? "");
  if (!client) throw new Error("Client is required.");

  const today = new Date().toISOString().slice(0, 10);
  const tags: Tag[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[,|]/).map((p) => p.trim());
    const [tagId, location, logType, freq] = parts;
    if (!tagId || !location || !logType) continue;
    const def = getLogTypeDef(pack, logType);
    const frequencyDays = freq
      ? Number(freq) || def?.defaultFrequencyDays || 7
      : def?.defaultFrequencyDays ?? 7;
    tags.push({
      tagId,
      client,
      location,
      logType,
      frequencyDays,
      installDate: today,
      status: "Active",
    });
  }

  if (tags.length === 0) throw new Error("No valid tag lines found.");
  await registerTags(tags);
  revalidatePath("/admin");
}

/** Reassign a tag's meaning without touching the physical tag (SOUL §7.6). */
export async function updateTagAction(formData: FormData) {
  await assertSentinel();
  const tagId = String(formData.get("tagId") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const logType = String(formData.get("logType") ?? "").trim();
  const frequencyDays = Number(formData.get("frequencyDays") ?? 0);
  if (!tagId) throw new Error("Tag ID is required.");

  await updateTagMeaning(tagId, {
    location,
    logType,
    frequencyDays: frequencyDays || undefined,
  });
  revalidatePath("/admin");
}

export async function setTagStatusAction(formData: FormData) {
  await assertSentinel();
  const tagId = String(formData.get("tagId") ?? "").trim();
  const status = String(formData.get("status") ?? "Active") as TagStatus;
  await setTagStatus(tagId, status);
  revalidatePath("/admin");
}

export async function updateIssueAction(formData: FormData) {
  const session = await requireRole("sentinel");
  if (!session) throw new Error("Not authorized.");
  const issueId = Number(formData.get("issueId"));
  const client = String(formData.get("client") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!issueId || (status !== "acknowledged" && status !== "resolved")) {
    throw new Error("Invalid issue update.");
  }
  await updateIssue(issueId, {
    status,
    actor: session.email,
    resolution: note || undefined,
    note: note || undefined,
  });
  if (status === "resolved" && note) {
    await addCorrectiveAction({
      issueId,
      client,
      action: note,
      performedBy: session.email,
    });
  }
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateInstallStatusAction(formData: FormData) {
  await assertSentinel();
  const client = String(formData.get("client") ?? "");
  const stage = String(formData.get("stage") ?? "");
  const now = new Date().toISOString();
  if (stage === "ordered") {
    await updateClientPlatform(client, {
      tagsOrderedAt: now,
      onboardingStatus: "tags_ordered",
    });
  } else if (stage === "shipped") {
    await updateClientPlatform(client, {
      tagsShippedAt: now,
      onboardingStatus: "tags_shipped",
    });
  } else if (stage === "installed") {
    await updateClientPlatform(client, {
      installedAt: now,
      onboardingStatus: "installed",
    });
  } else {
    throw new Error("Invalid installation stage.");
  }
  revalidatePath("/admin");
  revalidatePath("/onboarding");
}

// Re-export a helper so the page can list without importing db in a client comp.
export async function loadTags(client: string): Promise<Tag[]> {
  await assertSentinel();
  return getTagsByClient(client);
}
