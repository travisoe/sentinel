"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import {
  getClient,
  getTagsByClient,
  registerTags,
  updateClientPlatform,
} from "@/lib/db";
import { getLogTypeDef } from "@/lib/packs";

const stationSchema = z.array(
  z.object({
    location: z.string().trim().min(2).max(120),
    logType: z.string().trim().min(1),
    frequencyDays: z.number().int().min(1).max(365),
  }),
).min(1).max(100);

export async function saveStationsAction(formData: FormData) {
  const session = await requireRole("owner", "sentinel");
  if (!session) throw new Error("Not authorized.");
  const requestedClient = String(formData.get("client") ?? "");
  const clientName = session.role === "owner" ? session.client : requestedClient;
  if (!clientName) throw new Error("Missing client.");

  const client = await getClient(clientName);
  if (!client) throw new Error("Unknown client.");
  const stations = stationSchema.parse(
    JSON.parse(String(formData.get("stations") ?? "[]")),
  );
  const current = await getTagsByClient(clientName);
  if (
    client.stationLimit !== null &&
    client.stationLimit !== undefined &&
    current.length + stations.length > client.stationLimit
  ) {
    throw new Error(`This plan supports ${client.stationLimit} stations.`);
  }

  for (const station of stations) {
    if (!getLogTypeDef(client.pack, station.logType)) {
      throw new Error("A station uses a log type outside the assigned pack.");
    }
  }

  const prefix = clientPrefix(clientName);
  const used = new Set(current.map((tag) => tag.tagId));
  let next = 1;
  const today = new Date().toISOString().slice(0, 10);
  const tags = stations.map((station) => {
    while (used.has(`${prefix}-${String(next).padStart(3, "0")}`)) next++;
    const tagId = `${prefix}-${String(next).padStart(3, "0")}`;
    used.add(tagId);
    next++;
    return {
      tagId,
      client: clientName,
      location: station.location,
      logType: station.logType,
      frequencyDays: station.frequencyDays,
      installDate: today,
      status: "Active" as const,
    };
  });

  await registerTags(tags);
  await updateClientPlatform(clientName, { onboardingStatus: "stations_configured" });
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  redirect(`/onboarding?client=${encodeURIComponent(clientName)}&saved=1`);
}

export async function markInstallationAction(formData: FormData) {
  const session = await requireRole("owner", "sentinel");
  if (!session) throw new Error("Not authorized.");
  const requestedClient = String(formData.get("client") ?? "");
  const client = session.role === "owner" ? session.client : requestedClient;
  if (!client) throw new Error("Missing client.");
  await updateClientPlatform(client, {
    onboardingStatus: "installed",
    installedAt: new Date().toISOString(),
  });
  revalidatePath("/onboarding");
  revalidatePath("/admin");
}

function clientPrefix(client: string) {
  const words = client.toUpperCase().match(/[A-Z0-9]+/g) ?? ["TAG"];
  const initials = words.map((word) => word[0]).join("");
  if (initials.length >= 3) return initials.slice(0, 4);
  return words.join("").slice(0, 3).padEnd(3, "X");
}
