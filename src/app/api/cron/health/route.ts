import { NextResponse } from "next/server";
import { calculateAccountHealth } from "@/lib/compliance";
import {
  computeCompliance,
  getLogs,
  getTagsByClient,
  listClients,
  openIssue,
  persistHealth,
} from "@/lib/db";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const clients = await listClients();
  const results = [];
  for (const client of clients) {
    const [tags, logs, rows] = await Promise.all([
      getTagsByClient(client.client),
      getLogs(client.client, { from, to: now.toISOString() }),
      computeCompliance(client.client),
    ]);
    const health = calculateAccountHealth(client, tags, logs, rows);
    await persistHealth(client.client, health.score, health.band);
    for (const row of rows.filter((item) => item.status === "Overdue")) {
      await openIssue({
        client: client.client,
        tagId: row.tagId,
        type: "sustained_overdue",
        severity: "high",
        openedBy: "system",
        notes: `${row.location} is overdue for ${row.logType}.`,
      });
    }
    results.push({ client: client.client, score: health.score, band: health.band });
  }
  return NextResponse.json({ updated: results });
}
