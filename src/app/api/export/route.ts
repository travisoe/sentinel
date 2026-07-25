import { NextResponse } from "next/server";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireRole } from "@/lib/auth";
import {
  computeCompliance,
  getClient,
  getLogs,
  getTagsByClient,
} from "@/lib/db";
import { reportStats } from "@/lib/compliance";
import { logTypeLabel } from "@/lib/packs";

export async function GET(request: Request) {
  const session = await requireRole("owner", "sentinel");
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const url = new URL(request.url);
  const clientName =
    session.role === "owner" ? session.client : url.searchParams.get("client");
  if (!clientName) {
    return NextResponse.json({ error: "Missing client." }, { status: 400 });
  }
  const now = new Date();
  const to = url.searchParams.get("to") ?? now.toISOString();
  const from =
    url.searchParams.get("from") ??
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [client, tags, logs, allLogs, rows] = await Promise.all([
    getClient(clientName),
    getTagsByClient(clientName),
    getLogs(clientName, { from, to }),
    getLogs(clientName),
    computeCompliance(clientName),
  ]);
  if (!client) {
    return NextResponse.json({ error: "Unknown client." }, { status: 404 });
  }

  const zip = new JSZip();
  zip.file(
    "logs.csv",
    toCsv([
      ["Timestamp", "Tag ID", "Location", "Log Type", "Logged By", "Notes"],
      ...logs.map((log) => {
        const tag = tags.find((item) => item.tagId === log.tagId);
        return [
          log.timestamp,
          log.tagId,
          tag?.location ?? "",
          tag ? logTypeLabel(client.pack, tag.logType) : "",
          log.loggedBy,
          log.notes ?? "",
        ];
      }),
    ]),
  );
  zip.file(
    "stations.csv",
    toCsv([
      ["Tag ID", "Location", "Log Type", "Frequency Days", "Status"],
      ...tags.map((tag) => [
        tag.tagId,
        tag.location,
        logTypeLabel(client.pack, tag.logType),
        String(tag.frequencyDays),
        tag.status,
      ]),
    ]),
  );
  zip.file(
    "analytics.pdf",
    await buildSnapshot(clientName, from, to, tags, logs, allLogs, rows),
  );
  zip.file(
    "README.txt",
    [
      "SENTINEL. Compliance, proven.",
      `Client: ${clientName}`,
      `Range: ${from} to ${to}`,
      "logs.csv contains immutable completion records.",
      "stations.csv contains the current station registry.",
      "analytics.pdf contains the confidence-first summary.",
    ].join("\n"),
  );

  const bytes = await zip.generateAsync({ type: "uint8array" });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName(clientName)}_proof_bundle.zip"`,
    },
  });
}

async function buildSnapshot(
  client: string,
  from: string,
  to: string,
  tags: Awaited<ReturnType<typeof getTagsByClient>>,
  logs: Awaited<ReturnType<typeof getLogs>>,
  allLogs: Awaited<ReturnType<typeof getLogs>>,
  rows: Awaited<ReturnType<typeof computeCompliance>>,
) {
  const stats = reportStats(tags, logs, allLogs);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("SENTINEL", {
    x: 54,
    y: 720,
    size: 24,
    font: bold,
    color: rgb(0.118, 0.118, 0.118),
  });
  page.drawText(".", { x: 170, y: 720, size: 24, font: bold, color: rgb(0.8, 0.118, 0.118) });
  page.drawText(client, { x: 54, y: 665, size: 22, font: bold });
  page.drawText(`${dateOnly(from)} – ${dateOnly(to)}`, { x: 54, y: 642, size: 11, font: regular });
  page.drawText(`${stats.checksCompleted} checks completed`, { x: 54, y: 580, size: 22, font: bold });
  page.drawText(`${stats.compliancePct}% currently compliant`, { x: 54, y: 545, size: 18, font: bold });
  page.drawText(
    `${stats.gapsCorrectedWithin24h} gaps corrected within 24h`,
    { x: 54, y: 515, size: 13, font: regular },
  );
  page.drawText(
    `${rows.filter((row) => row.status === "Overdue").length} overdue · ${tags.length} registered stations`,
    { x: 54, y: 475, size: 12, font: regular },
  );
  page.drawText(
    `Generated ${new Date().toLocaleString("en-US")}. Records are timestamped and unchangeable.`,
    { x: 54, y: 80, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) },
  );
  return pdf.save();
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

function dateOnly(value: string) {
  return new Date(value).toLocaleDateString("en-US", { dateStyle: "medium" });
}

function safeName(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
}
