import { NextResponse } from "next/server";
import {
  appendLog,
  getClient,
  getTag,
  resolveOpenIssuesForTag,
  updateClientPlatform,
} from "@/lib/db";
import { logTypeLabel } from "@/lib/packs";

/**
 * POST /api/log — append one Log Entry (Milestone 1).
 *
 * Append-only. The server sets the timestamp; client time is never trusted
 * (SOUL §7.3, §13.4). Submitting twice creates two rows — no silent merge.
 */
export async function POST(request: Request) {
  let body: {
    tagId?: string;
    loggedBy?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tagId = String(body.tagId ?? "").trim();
  const loggedBy = String(body.loggedBy ?? "").trim();

  if (!tagId || !loggedBy) {
    return NextResponse.json(
      { error: "Missing tag or name." },
      { status: 400 },
    );
  }

  const tag = await getTag(tagId);
  if (!tag) {
    return NextResponse.json({ error: "Unknown tag." }, { status: 404 });
  }
  if (tag.status !== "Active") {
    return NextResponse.json({ error: "Station inactive." }, { status: 409 });
  }

  await appendLog({
    tagId: tag.tagId,
    loggedBy,
    notes: body.notes ? String(body.notes).trim() : undefined,
  });
  await resolveOpenIssuesForTag(tag.client, tag.tagId, loggedBy).catch(
    () => undefined,
  );

  const client = await getClient(tag.client);
  if (client && !client.firstScanAt) {
    await updateClientPlatform(tag.client, {
      firstScanAt: new Date().toISOString(),
      onboardingStatus: "live",
    }).catch(() => undefined);
  }
  const label = logTypeLabel(client?.pack, tag.logType);
  const time = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return NextResponse.json({
    ok: true,
    location: tag.location,
    logType: label,
    time,
  });
}
