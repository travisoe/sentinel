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

export const OTHER_PACK: TemplatePack = {
  id: "other",
  label: "Other",
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

export const CONSTRUCTION_PACK: TemplatePack = {
  id: "construction",
  label: "Construction",
  logTypes: [
    { key: "site_walkthrough", label: "Site Safety Walkthrough", defaultFrequencyDays: 1 },
    { key: "equipment_preuse", label: "Equipment Pre-Use Check", defaultFrequencyDays: 1 },
    { key: "fall_protection", label: "Fall Protection Check", defaultFrequencyDays: 1 },
    { key: "scaffold_inspection", label: "Scaffold Inspection", defaultFrequencyDays: 7 },
    { key: "ppe_station_check", label: "PPE Station Check", defaultFrequencyDays: 7 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const FOODSERVICE_PACK: TemplatePack = {
  id: "foodservice",
  label: "Food Service",
  logTypes: [
    { key: "line_sanitation", label: "Line Sanitation Check", defaultFrequencyDays: 1 },
    { key: "cold_hold_temp", label: "Cold Hold Temp Log", defaultFrequencyDays: 1 },
    { key: "hot_hold_temp", label: "Hot Hold Temp Log", defaultFrequencyDays: 1 },
    { key: "dishwasher_sanitizer", label: "Dishwasher Sanitizer Check", defaultFrequencyDays: 1 },
    { key: "walkin_inspection", label: "Walk-In Cooler Inspection", defaultFrequencyDays: 7 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const HOSPITALITY_PACK: TemplatePack = {
  id: "hospitality",
  label: "Hospitality",
  logTypes: [
    { key: "guest_area_walk", label: "Guest Area Safety Walk", defaultFrequencyDays: 1 },
    { key: "pool_safety_check", label: "Pool Safety Check", defaultFrequencyDays: 1 },
    { key: "housekeeping_cleaning", label: "Housekeeping Cleaning Log", defaultFrequencyDays: 1 },
    { key: "fire_exit_check", label: "Fire Exit / Egress Check", defaultFrequencyDays: 7 },
    { key: "utility_room_check", label: "Utility Room Safety Check", defaultFrequencyDays: 7 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const RETAIL_PACK: TemplatePack = {
  id: "retail",
  label: "Retail",
  logTypes: [
    { key: "opening_safety", label: "Opening Safety Checklist", defaultFrequencyDays: 1 },
    { key: "closing_safety", label: "Closing Safety Checklist", defaultFrequencyDays: 1 },
    { key: "stockroom_walk", label: "Stockroom Safety Walk", defaultFrequencyDays: 7 },
    { key: "spill_kit_check", label: "Spill Kit Check", defaultFrequencyDays: 30 },
    { key: "emergency_lighting", label: "Emergency Lighting Check", defaultFrequencyDays: 30 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const EDUCATION_PACK: TemplatePack = {
  id: "education",
  label: "Education",
  logTypes: [
    { key: "classroom_safety", label: "Classroom Safety Check", defaultFrequencyDays: 1 },
    { key: "playground_check", label: "Playground Equipment Check", defaultFrequencyDays: 1 },
    { key: "hallway_exit_check", label: "Hallway / Exit Check", defaultFrequencyDays: 7 },
    { key: "science_lab_check", label: "Science Lab Safety Check", defaultFrequencyDays: 7 },
    { key: "first_aid_station", label: "First-Aid Station Check", defaultFrequencyDays: 30 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const MANUFACTURING_PACK: TemplatePack = {
  id: "manufacturing",
  label: "Manufacturing",
  logTypes: [
    { key: "machine_preop", label: "Machine Pre-Op Check", defaultFrequencyDays: 1 },
    { key: "guarding_check", label: "Machine Guarding Check", defaultFrequencyDays: 1 },
    { key: "lockout_tagout", label: "LOTO Station Check", defaultFrequencyDays: 7 },
    { key: "chemical_storage", label: "Chemical Storage Check", defaultFrequencyDays: 7 },
    { key: "eyewash_station", label: "Eyewash Station Check", defaultFrequencyDays: 30 },
    FIRE_EXTINGUISHER_VISUAL,
  ],
};

export const PACKS: Record<PackId, TemplatePack> = {
  warehouse: WAREHOUSE_PACK,
  healthcare: HEALTHCARE_PACK,
  construction: CONSTRUCTION_PACK,
  foodservice: FOODSERVICE_PACK,
  hospitality: HOSPITALITY_PACK,
  retail: RETAIL_PACK,
  education: EDUCATION_PACK,
  manufacturing: MANUFACTURING_PACK,
  other: OTHER_PACK,
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
