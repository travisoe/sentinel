"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addStaffMember,
  removeStaffMember,
  setReportPreferences,
} from "@/lib/db";

async function scopedClient(formData: FormData) {
  const session = await requireRole("owner", "sentinel");
  if (!session) throw new Error("Not authorized.");
  const requested = String(formData.get("client") ?? "");
  const client = session.role === "owner" ? session.client : requested;
  if (!client) throw new Error("Missing client.");
  return client;
}

export async function addStaffAction(formData: FormData) {
  const client = await scopedClient(formData);
  const name = String(formData.get("displayName") ?? "").trim();
  if (name.length < 2 || name.length > 80) throw new Error("Invalid name.");
  await addStaffMember(client, name);
  revalidatePath("/settings");
}

export async function removeStaffAction(formData: FormData) {
  await scopedClient(formData);
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Invalid staff member.");
  await removeStaffMember(id);
  revalidatePath("/settings");
}

export async function reportPreferencesAction(formData: FormData) {
  const client = await scopedClient(formData);
  const enabled = formData.get("enabled") === "on";
  const email = String(formData.get("recipientEmail") ?? "").trim();
  await setReportPreferences(client, enabled, email || undefined);
  revalidatePath("/settings");
}
