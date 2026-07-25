import "server-only";
import Stripe from "stripe";
import { getPlan } from "@/lib/billing/plans";
import type { PlanId } from "@/lib/types";

let cached: Stripe | null = null;

export function getStripe() {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  cached = new Stripe(key);
  return cached;
}

export function stripePriceIds(planId: PlanId) {
  const plan = getPlan(planId);
  const subscriptionPrice = process.env[plan.subscriptionPriceEnv];
  const setupPrice = process.env[plan.setupPriceEnv];
  if (!subscriptionPrice || !setupPrice) {
    throw new Error(
      `Missing Stripe prices: ${plan.subscriptionPriceEnv} / ${plan.setupPriceEnv}`,
    );
  }
  return { subscriptionPrice, setupPrice };
}

export function stationLimitForPlan(planId: PlanId) {
  return getPlan(planId).stationLimit;
}
