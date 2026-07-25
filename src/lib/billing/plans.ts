import type { PackId, PlanId } from "@/lib/types";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  vertical: "warehouse" | "healthcare" | "cross_vertical";
  monthlyDisplay: string;
  setupDisplay: string;
  description: string;
  includes: string[];
  stationLimit: number | null;
  defaultPack: PackId;
  subscriptionPriceEnv: string;
  setupPriceEnv: string;
};

/** Locked pricing from Sentinel_Safety_Project_Instructions.md §9. */
export const PLANS: Record<PlanId, PlanDefinition> = {
  warehouse_starter: {
    id: "warehouse_starter",
    name: "Shift Proof Starter",
    vertical: "warehouse",
    monthlyDisplay: "$299/mo",
    setupDisplay: "$499–699 setup",
    description: "Proof for the five checks that matter every shift.",
    includes: ["Up to 5 stations", "Weekly manager proof report"],
    stationLimit: 5,
    defaultPack: "warehouse",
    subscriptionPriceEnv: "STRIPE_PRICE_WAREHOUSE_STARTER",
    setupPriceEnv: "STRIPE_PRICE_WAREHOUSE_SETUP",
  },
  warehouse_plus: {
    id: "warehouse_plus",
    name: "Operations Proof Plus",
    vertical: "warehouse",
    monthlyDisplay: "$499/mo",
    setupDisplay: "$499–699 setup",
    description: "Full-station visibility, alerts, and corrective actions.",
    includes: [
      "Unlimited stations",
      "Gap alerts",
      "Corrective actions",
      "Monthly proof packet",
    ],
    stationLimit: null,
    defaultPack: "warehouse",
    subscriptionPriceEnv: "STRIPE_PRICE_WAREHOUSE_PLUS",
    setupPriceEnv: "STRIPE_PRICE_WAREHOUSE_SETUP",
  },
  healthcare_starter: {
    id: "healthcare_starter",
    name: "Proof Logs Starter",
    vertical: "healthcare",
    monthlyDisplay: "$199/mo",
    setupDisplay: "$349–499 setup",
    description: "Simple proof logs for a small clinic or practice.",
    includes: ["Up to 3 log areas", "Weekly proof summary"],
    stationLimit: 3,
    defaultPack: "healthcare",
    subscriptionPriceEnv: "STRIPE_PRICE_HEALTHCARE_STARTER",
    setupPriceEnv: "STRIPE_PRICE_HEALTHCARE_SETUP",
  },
  healthcare_plus: {
    id: "healthcare_plus",
    name: "Proof Logs Plus",
    vertical: "healthcare",
    monthlyDisplay: "$399/mo",
    setupDisplay: "$349–499 setup",
    description: "Unlimited proof logs with gap alerts and evidence packets.",
    includes: ["Unlimited log areas", "Gap alerts", "Monthly evidence packet"],
    stationLimit: null,
    defaultPack: "healthcare",
    subscriptionPriceEnv: "STRIPE_PRICE_HEALTHCARE_PLUS",
    setupPriceEnv: "STRIPE_PRICE_HEALTHCARE_SETUP",
  },
  managed: {
    id: "managed",
    name: "Managed",
    vertical: "cross_vertical",
    monthlyDisplay: "$699+/mo",
    setupDisplay: "Setup scoped at checkout",
    description: "Platform plus remote review and priority support.",
    includes: [
      "Full platform",
      "Quarterly remote compliance review call",
      "Written report",
      "Compliance documentation maintained",
      "Priority support",
    ],
    stationLimit: null,
    defaultPack: "other",
    subscriptionPriceEnv: "STRIPE_PRICE_MANAGED",
    setupPriceEnv: "STRIPE_PRICE_MANAGED_SETUP",
  },
};

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function getPlan(id: PlanId) {
  return PLANS[id];
}
