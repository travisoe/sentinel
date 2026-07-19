import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getClient, getTagsByClient } from "@/lib/db";
import { logTypeLabel } from "@/lib/packs";

/**
 * GET /api/placement?client= — onboarding placement list export (Milestone 2).
 * Produces a CSV a client uses to place physical tags: "WHD-003 -> Dock Door 4".
 */
export async function GET(request: Request) {
  const session = await requireRole("sentinel");
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json({ error: "Missing client." }, { status: 400 });
  }

  const rec = await getClient(client);
  const tags = await getTagsByClient(client);
  const base = process.env.APP_BASE_URL ?? new URL(request.url).origin;

  const header = "Tag ID,Location,Log Type,Frequency (Days),Tap URL";
  const lines = tags.map((t) =>
    [
      t.tagId,
      `"${t.location.replace(/"/g, '""')}"`,
      `"${logTypeLabel(rec?.pack, t.logType)}"`,
      t.frequencyDays,
      `${base}/t/${t.tagId}`,
    ].join(","),
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${client.replace(/\s+/g, "_")}_placement.csv"`,
    },
  });
}
