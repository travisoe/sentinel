import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getStripe } from "@/lib/billing/stripe";
import { getClient } from "@/lib/db";

export async function POST(request: Request) {
  const session = await requireRole("owner", "sentinel");
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const form = await request.formData();
  const requestedClient = String(form.get("client") ?? "");
  const clientName =
    session.role === "owner" ? session.client : requestedClient;
  if (!clientName) {
    return NextResponse.json({ error: "Missing client." }, { status: 400 });
  }
  const client = await getClient(clientName);
  if (!client?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer." }, { status: 404 });
  }
  const origin = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: client.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });
  return NextResponse.redirect(portal.url, 303);
}
