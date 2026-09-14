import type {
  Category,
  Confidence,
  Direction,
  EditorialStatus,
  InfraStatus,
  Region,
  Sector,
  Severity,
  VerificationStatus,
} from "./schemas";

export const REGION_LABELS: Record<Region, string> = {
  west: "West",
  east: "East",
  south: "South",
  national: "National",
  unspecified: "Location unspecified",
};

export const SECTOR_LABELS: Record<Sector, string> = {
  "oil-gas": "Oil and gas",
  "un-humanitarian": "UN and humanitarian",
  telecom: "Telecommunications",
  logistics: "Logistics",
  other: "Other",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  politics: "Politics",
  oil: "Oil",
  security: "Security",
  infrastructure: "Infrastructure",
  economy: "Economy",
  humanitarian: "Humanitarian",
  diplomacy: "Diplomacy",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low severity",
  moderate: "Moderate severity",
  high: "High severity",
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  improving: "Improving",
  deteriorating: "Deteriorating",
  mixed: "Mixed change",
  unchanged: "Unchanged",
  unknown: "Direction unknown",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  reported: "Reported",
  corroborated: "Corroborated",
  disputed: "Disputed",
  corrected: "Corrected",
};

export const INFRA_STATUS_LABELS: Record<InfraStatus, string> = {
  reported: "Reported",
  confirmed: "Confirmed",
  resolved: "Resolved",
  unknown: "Unknown",
};

export const EDITORIAL_LABELS: Record<EditorialStatus, string> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
  withdrawn: "Withdrawn",
};

export const FILTERABLE_REGIONS: Region[] = ["west", "east", "south"];
export const FILTERABLE_SECTORS: Sector[] = ["oil-gas", "un-humanitarian", "telecom", "logistics"];
export const FILTERABLE_CATEGORIES: Category[] = [
  "politics",
  "oil",
  "security",
  "infrastructure",
  "economy",
  "humanitarian",
  "diplomacy",
];
