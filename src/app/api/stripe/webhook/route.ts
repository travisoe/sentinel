import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { provisionPaidClient, syncClientBilling } from "@/lib/db";
import type { BillingStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const intentId =
        session.metadata?.signup_intent_id ?? session.client_reference_id;
      const customerId = idOf(session.customer);
      const subscriptionId = idOf(session.subscription);
      if (intentId && customerId && subscriptionId) {
        await provisionPaidClient({
          intentId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const customerId = idOf(subscription.customer);
      if (customerId) {
        await syncClientBilling(
          customerId,
          mapBillingStatus(subscription.status),
          subscription.id,
        );
      }
    }
  } catch {
    // Stripe retries non-2xx responses. Do not expose internal details.
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function idOf(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function mapBillingStatus(status: Stripe.Subscription.Status): BillingStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  if (status === "unpaid") return "unpaid";
  return "canceled";
}
