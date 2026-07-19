/**
 * Template packs — the industry-agnostic engine (SOUL §7.9, §13.6).
 *
 * Log types are CONFIGURATION, not hardcode. The app renders whatever log types
 * live in the pack a client is assigned. Adding an industry later = adding a pack
 * here, with zero app changes. Never build per-client custom log types (banned).
 *
 * Fire Extinguisher Visual copy always frames the CLIENT'S staff as the performer
 * (SOUL §11.3): visual check log only, never servicing/recharge/certification.
 */
import type { TemplatePack, PackId, LogTypeDef } from "./types";

const FIRE_EXTINGUISHER_VISUAL: LogTypeDef = {
  key: "fire_extinguisher_visual",
  label: "Fire Extinguisher Visual Check",
  // Client staff performs this visual check; Sentinel only logs it.
  checklist: [
    "Gauge needle in the green",
    "Pin and tamper seal intact",
    "Access clear and unobstructed",
    "No visible damage, corrosion, or leakage",
    "Inspection tag present",
  ],
  defaultFrequencyDays: 30,
};

export const WAREHOUSE_PACK: TemplatePack = {
  id: "warehouse",
  label: "Warehouse & Distribution",
  logTypes: [
    {
      key: "forklift_preshift",
      label: "Forklift Pre-Shift Inspection",
      checklist: [
        "Forks and mast",
        "Tires",
        "Horn",
        "Brakes",
        "Hydraulics",
        "No leaks",
        "Seatbelt",
      ],
      defaultFrequencyDays: 1,
    },
    {
      key: "dock_plate_check",
      label: "Dock / Dock-Plate Check",
      defaultFrequencyDays: 1,
    },
    {
      key: "racking_damage",
      label: "Racking Damage Walkthrough",
      checklist: ["Uprights", "Beams", "Safety pins", "Load signs"],
      defaultFrequencyDays: 7,
    },
    {
      key: "emergency_exit",
      label: "Emergency Exit / Fire Aisle Check",
      checklist: ["Unobstructed", "Lit", "Signage clear"],
      defaultFrequencyDays: 7,
    },
    {
      key: "first_aid_aed_eyewash",
      label: "First-Aid / AED / Eyewash Check",
      defaultFrequencyDays: 30,
    },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const HEALTHCARE_PACK: TemplatePack = {
  id: "healthcare",
  label: "Healthcare / Clinic",
  logTypes: [
    { key: "cleaning_log", label: "Cleaning Log", defaultFrequencyDays: 1 },
    { key: "sterilizer_check", label: "Sterilizer Check", defaultFrequencyDays: 1 },
    { key: "sharps_disposal", label: "Sharps Disposal", defaultFrequencyDays: 1 },
    {
      key: "temp_log",
      label: "Temp Log (Fridge / Freezer)",
      defaultFrequencyDays: 1,
    },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const GENERIC_PACK: TemplatePack = {
  id: "generic",
  label: "Generic",
  logTypes: [
    { key: "cleaning", label: "Cleaning", defaultFrequencyDays: 1 },
    { key: "equipment_check", label: "Equipment Check", defaultFrequencyDays: 7 },
    {
      key: "safety_walkthrough",
      label: "Safety Walkthrough",
      defaultFrequencyDays: 7,
    },
    FIRE_EXTINGUISHER_VISUAL,
    { key: "other", label: "Other", defaultFrequencyDays: 7 },
  ],
};

export const PACKS: Record<PackId, TemplatePack> = {
  warehouse: WAREHOUSE_PACK,
  healthcare: HEALTHCARE_PACK,
  generic: GENERIC_PACK,
};

export function getPack(id: PackId): TemplatePack {
  return PACKS[id];
}

export function getLogTypeDef(
  packId: PackId,
  key: string,
): LogTypeDef | undefined {
  return PACKS[packId]?.logTypes.find((t) => t.key === key);
}

/** Resolve a display label for a log type key, falling back to the raw key. */
export function logTypeLabel(packId: PackId | undefined, key: string): string {
  if (!packId) return key;
  return getLogTypeDef(packId, key)?.label ?? key;
}
