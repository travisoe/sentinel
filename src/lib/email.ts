import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured.");
  cached ??= new Resend(key);
  return cached;
}

export async function sendWeeklyProofEmail(input: {
  to: string;
  client: string;
  checks: number;
  compliancePct: number;
  corrected: number;
  overdue: number;
}) {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const from = process.env.REPORT_FROM_EMAIL ?? "Sentinel <reports@sentinelsafety.io>";
  const { error } = await resend().emails.send({
    from,
    to: input.to,
    subject: `${input.client}: ${input.checks} checks completed this week`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1E1E1E;max-width:620px">
        <h1 style="font-size:28px;margin-bottom:4px">SENTINEL<span style="color:#CC1E1E">.</span></h1>
        <p style="color:#666">Compliance, proven.</p>
        <h2>${escapeHtml(input.client)}</h2>
        <p style="font-size:20px"><strong>${input.checks} checks completed</strong></p>
        <p>${input.compliancePct}% currently compliant · ${input.corrected} gaps corrected within 24h · ${input.overdue} overdue now</p>
        <p><a href="${base}/dashboard" style="color:#CC1E1E">Open the dashboard</a></p>
        <p style="color:#777;font-size:12px">Timestamped, unchangeable records. The client's staff performs checks; Sentinel makes them provable.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
