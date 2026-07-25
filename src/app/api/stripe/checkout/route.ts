import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripePriceIds } from "@/lib/billing/stripe";
import { isPlanId } from "@/lib/billing/plans";
import { PACKS } from "@/lib/packs";
import {
  attachCheckoutSession,
  createSignupIntent,
} from "@/lib/db";
import type { PackId } from "@/lib/types";

const schema = z.object({
  company: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  contactPhone: z.string().trim().max(30).optional(),
  pack: z.string(),
  plan: z.string(),
  pilot: z.string().optional(),
});

export async function POST(request: Request) {
  const origin = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  try {
    const form = await request.formData();
    const parsed = schema.parse(Object.fromEntries(form));
    if (!isPlanId(parsed.plan) || !(parsed.pack in PACKS)) {
      throw new Error("Invalid plan or industry.");
    }

    const intentId = await createSignupIntent({
      email: parsed.email,
      company: parsed.company,
      contactName: parsed.contactName,
      contactPhone: parsed.contactPhone,
      pack: parsed.pack as PackId,
      plan: parsed.plan,
    });
    const { subscriptionPrice, setupPrice } = stripePriceIds(parsed.plan);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: parsed.email,
      line_items: [
        { price: subscriptionPrice, quantity: 1 },
        { price: setupPrice, quantity: 1 },
      ],
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register?plan=${parsed.plan}&error=checkout`,
      client_reference_id: intentId,
      metadata: {
        signup_intent_id: intentId,
        company: parsed.company,
        pack: parsed.pack,
        plan: parsed.plan,
      },
      subscription_data:
        parsed.pilot === "1"
          ? {
              trial_period_days: 30,
              metadata: { signup_intent_id: intentId, pilot: "paid" },
            }
          : { metadata: { signup_intent_id: intentId } },
      allow_promotion_codes: false,
      billing_address_collection: "required",
      integration_identifier: "sentinel_web_ckxjtrpz",
    });

    await attachCheckoutSession(intentId, session.id);
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.redirect(`${origin}/register?error=checkout`, 303);
  }
}
