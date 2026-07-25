import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireRole } from "@/lib/auth";
import { getClient, getTagsByClient } from "@/lib/db";
import { logTypeLabel } from "@/lib/packs";

const RED = rgb(0.8, 0.118, 0.118);
const CHARCOAL = rgb(0.118, 0.118, 0.118);

export async function GET(request: Request) {
  const session = await requireRole("owner", "sentinel");
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const url = new URL(request.url);
  const requested = url.searchParams.get("client");
  const clientName = session.role === "owner" ? session.client : requested;
  if (!clientName) {
    return NextResponse.json({ error: "Missing client." }, { status: 400 });
  }

  const [client, tags] = await Promise.all([
    getClient(clientName),
    getTagsByClient(clientName),
  ]);
  if (!client) {
    return NextResponse.json({ error: "Unknown client." }, { status: 404 });
  }
  const base = process.env.APP_BASE_URL ?? url.origin;
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  for (const tag of tags) {
    const page = pdf.addPage([612, 792]);
    page.drawText("SENTINEL", { x: 54, y: 720, size: 28, font: bold, color: CHARCOAL });
    page.drawText(".", {
      x: 54 + bold.widthOfTextAtSize("SENTINEL", 28),
      y: 720,
      size: 28,
      font: bold,
      color: RED,
    });
    page.drawText("TAP OR SCAN", {
      x: 54,
      y: 660,
      size: 16,
      font: bold,
      color: RED,
    });
    page.drawText(tag.location, {
      x: 54,
      y: 625,
      size: 24,
      font: bold,
      color: CHARCOAL,
    });
    page.drawText(logTypeLabel(client.pack, tag.logType), {
      x: 54,
      y: 596,
      size: 15,
      font: regular,
      color: CHARCOAL,
    });
    page.drawText(`Station ${tag.tagId}`, {
      x: 54,
      y: 570,
      size: 11,
      font: regular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const tapUrl = `${base}/t/${tag.tagId}`;
    const png = await QRCode.toBuffer(tapUrl, {
      type: "png",
      width: 800,
      margin: 2,
      errorCorrectionLevel: "H",
    });
    const qr = await pdf.embedPng(png);
    page.drawImage(qr, { x: 156, y: 205, width: 300, height: 300 });
    page.drawText("One tap. One record. Zero guessing.", {
      x: 168,
      y: 170,
      size: 13,
      font: bold,
      color: CHARCOAL,
    });
    page.drawText(tapUrl, {
      x: 54,
      y: 85,
      size: 8,
      font: regular,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName(clientName)}_install_kit.pdf"`,
    },
  });
}

function safeName(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
}
