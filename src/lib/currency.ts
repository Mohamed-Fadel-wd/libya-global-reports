import { hoursBetween } from "./time";
import type { IndicatorObservation } from "./schemas";

export type FxQuote = Pick<
  IndicatorObservation,
  "indicatorType" | "value" | "unit" | "currencyPair" | "observedAt" | "location" | "buySell" | "cashTransfer"
>;

export type PremiumResult =
  | {
      ok: true;
      percent: number;
      official: FxQuote;
      parallel: FxQuote;
      alignmentHours: number;
    }
  | {
      ok: false;
      reason: string;
    };

const FX_TYPES = new Set(["fx-official", "fx-parallel"]);

export function isFxQuote(observation: FxQuote): boolean {
  return FX_TYPES.has(observation.indicatorType);
}

export function quotesAreComparable(official: FxQuote, parallel: FxQuote, alignmentHours: number): PremiumResult {
  if (official.indicatorType !== "fx-official") {
    return { ok: false, reason: "The first observation is not an official FX quote." };
  }
  if (parallel.indicatorType !== "fx-parallel") {
    return { ok: false, reason: "The second observation is not a parallel-market FX quote." };
  }
  if (official.value === null || parallel.value === null) {
    return { ok: false, reason: "A numeric rate is missing, so no premium can be calculated." };
  }
  if (official.value <= 0 || parallel.value <= 0) {
    return { ok: false, reason: "Rates must be positive to calculate a premium." };
  }
  if (!official.unit || !parallel.unit || official.unit !== parallel.unit) {
    return { ok: false, reason: "Units are missing or incompatible." };
  }
  if (!official.currencyPair || !parallel.currencyPair || official.currencyPair !== parallel.currencyPair) {
    return { ok: false, reason: "Currency pairs are missing or do not match." };
  }
  if (!official.observedAt || !parallel.observedAt) {
    return { ok: false, reason: "Observation times are missing, so dates cannot be aligned." };
  }
  const gap = hoursBetween(official.observedAt, parallel.observedAt);
  if (gap === null || gap > alignmentHours) {
    return {
      ok: false,
      reason: `Observation times are more than ${alignmentHours} hours apart or could not be compared.`,
    };
  }
  return {
    ok: true,
    percent: (parallel.value / official.value - 1) * 100,
    official,
    parallel,
    alignmentHours: gap,
  };
}

export function formatPremium(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)}%`;
}

export function locationSpecificPremiums(
  observations: FxQuote[],
  alignmentHours: number,
): Array<PremiumResult & { location: string }> {
  const official = observations.filter((item) => item.indicatorType === "fx-official");
  const parallel = observations.filter((item) => item.indicatorType === "fx-parallel");
  return parallel.map((quote) => {
    const compatibleOfficial = official.find((item) => quotesAreComparable(item, quote, alignmentHours).ok);
    if (!compatibleOfficial) {
      const attempt = official[0]
        ? quotesAreComparable(official[0], quote, alignmentHours)
        : { ok: false as const, reason: "No official quote is available for comparison." };
      return { ...attempt, location: quote.location };
    }
    return { ...quotesAreComparable(compatibleOfficial, quote, alignmentHours), location: quote.location };
  });
}
