import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireRole } from "@/lib/auth";
import {
  computeCompliance,
  getClient,
  getLogs,
  getTagsByClient,
} from "@/lib/db";
import { logTypeLabel } from "@/lib/packs";
import { reportStats } from "@/lib/compliance";

const RED = rgb(0.8, 0.118, 0.118); // #CC1E1E
const CHARCOAL = rgb(0.118, 0.118, 0.118); // #1E1E1E
const MUTED = rgb(0.45, 0.45, 0.45);

/**
 * GET /api/report?client=&from=&to= — audit-ready PDF (Milestone 4).
 * Confidence-first framing; read-only static PDF; totals reconcile with logs.
 */
export async function GET(request: Request) {
  const session = await requireRole("owner", "sentinel");
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const client =
    session.role === "owner" ? session.client : searchParams.get("client");
  if (!client) {
    return NextResponse.json({ error: "Missing client." }, { status: 400 });
  }

  const now = new Date();
  const to = searchParams.get("to") ?? now.toISOString();
  const from =
    searchParams.get("from") ??
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [rec, tags, logsInRange, allLogs] = await Promise.all([
    getClient(client),
    getTagsByClient(client),
    getLogs(client, { from, to }),
    getLogs(client),
  ]);
  const rows = await computeCompliance(client);
  const stats = reportStats(tags, logsInRange, allLogs, now);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" } as never);

  // Build the PDF.
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${client} — Sentinel Compliance Report`);
  pdf.setProducer("Sentinel Compliance Platform");
  let page = pdf.addPage([612, 792]); // US Letter
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const M = 54;
  let y = 792 - M;

  // Branded header — wordmark + red period + tagline.
  page.drawText("SENTINEL", { x: M, y, size: 22, font: bold, color: CHARCOAL });
  page.drawText(".", {
    x: M + bold.widthOfTextAtSize("SENTINEL", 22),
    y,
    size: 22,
    font: bold,
    color: RED,
  });
  page.drawText("Compliance, proven.", {
    x: 612 - M - font.widthOfTextAtSize("Compliance, proven.", 11),
    y: y + 4,
    size: 11,
    font,
    color: MUTED,
  });
  y -= 14;
  page.drawLine({
    start: { x: M, y },
    end: { x: 612 - M, y },
    thickness: 1,
    color: RED,
  });
  y -= 34;

  page.drawText(client, { x: M, y, size: 18, font: bold, color: CHARCOAL });
  y -= 18;
  page.drawText(`Proof report · ${fmtDate(from)} – ${fmtDate(to)}`, {
    x: M,
    y,
    size: 11,
    font,
    color: MUTED,
  });
  y -= 36;

  // Confidence-first headline line.
  const headline = `${stats.checksCompleted} checks completed · ${stats.compliancePct}% compliant · ${stats.gapsCorrectedWithin24h} gaps corrected within 24h`;
  page.drawText(headline, { x: M, y, size: 13, font: bold, color: CHARCOAL });
  y -= 36;

  // Detail table.
  page.drawText("Station detail", { x: M, y, size: 12, font: bold, color: CHARCOAL });
  y -= 18;

  const cols = [
    { label: "Station", x: M, w: 150 },
    { label: "Log type", x: M + 155, w: 150 },
    { label: "Checks", x: M + 310, w: 55 },
    { label: "Last logged", x: M + 370, w: 90 },
    { label: "Status", x: M + 462, w: 90 },
  ];
  for (const c of cols) {
    page.drawText(c.label, { x: c.x, y, size: 9, font: bold, color: MUTED });
  }
  y -= 4;
  page.drawLine({
    start: { x: M, y },
    end: { x: 612 - M, y },
    thickness: 0.5,
    color: MUTED,
  });
  y -= 16;

  const countInRange = (tagId: string) =>
    logsInRange.filter((l) => l.tagId === tagId).length;

  for (const r of rows) {
    if (y < M + 40) {
      page = pdf.addPage([612, 792]);
      y = 792 - M;
    }
    const last =
      r.lastLogged !== null ? fmtDate(r.lastLogged) : "—";
    const cells = [
      { x: cols[0].x, text: truncate(r.location, 26) },
      { x: cols[1].x, text: truncate(logTypeLabel(rec?.pack, r.logType), 26) },
      { x: cols[2].x, text: String(countInRange(r.tagId)) },
      { x: cols[3].x, text: last },
      { x: cols[4].x, text: r.status },
    ];
    for (const cell of cells) {
      page.drawText(cell.text, { x: cell.x, y, size: 9, font, color: CHARCOAL });
    }
    y -= 16;
  }

  y -= 20;
  if (y < M) {
    page = pdf.addPage([612, 792]);
    y = 792 - M;
  }
  page.drawText(
    `Generated ${now.toLocaleString("en-US")} · Records are timestamped and unchangeable.`,
    { x: M, y, size: 8, font, color: MUTED },
  );

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${client.replace(/\s+/g, "_")}_report.pdf"`,
    },
  });
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
