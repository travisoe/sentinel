import { NextResponse } from "next/server";
import { reportStats } from "@/lib/compliance";
import {
  computeCompliance,
  getLogs,
  getTagsByClient,
  listEnabledReportPreferences,
  markReportSent,
} from "@/lib/db";
import { sendWeeklyProofEmail } from "@/lib/email";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const preferences = await listEnabledReportPreferences();
  const sent: string[] = [];

  for (const preference of preferences) {
    if (
      preference.last_sent_at &&
      now.getTime() - new Date(preference.last_sent_at).getTime() <
        6 * 24 * 60 * 60 * 1000
    ) {
      continue;
    }
    const [tags, logs, allLogs, rows] = await Promise.all([
      getTagsByClient(preference.client),
      getLogs(preference.client, { from, to: now.toISOString() }),
      getLogs(preference.client),
      computeCompliance(preference.client),
    ]);
    const stats = reportStats(tags, logs, allLogs, now);
    await sendWeeklyProofEmail({
      to: preference.recipient_email,
      client: preference.client,
      checks: stats.checksCompleted,
      compliancePct: stats.compliancePct,
      corrected: stats.gapsCorrectedWithin24h,
      overdue: rows.filter((row) => row.status === "Overdue").length,
    });
    await markReportSent(preference.client);
    sent.push(preference.client);
  }
  return NextResponse.json({ sent });
}
