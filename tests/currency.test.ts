import { describe, expect, it } from "vitest";
import { quotesAreComparable, formatPremium } from "../src/lib/currency";
import type { FxQuote } from "../src/lib/currency";

const official: FxQuote = {
  indicatorType: "fx-official",
  value: 5,
  unit: "LYD_per_1_foreign",
  currencyPair: "USD/LYD",
  observedAt: "2026-09-03T12:00:00+02:00",
  location: "CBL",
  buySell: "mid",
  cashTransfer: "unspecified",
};

const parallel: FxQuote = {
  indicatorType: "fx-parallel",
  value: 7.5,
  unit: "LYD_per_1_foreign",
  currencyPair: "USD/LYD",
  observedAt: "2026-09-03T13:00:00+02:00",
  location: "Tripoli",
  buySell: "buy",
  cashTransfer: "cash",
};

describe("FX premium", () => {
  it("calculates premium for compatible quotes", () => {
    const result = quotesAreComparable(official, parallel, 48);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.percent).toBeCloseTo(50);
      expect(formatPremium(result.percent)).toBe("+50.0%");
    }
  });

  it("rejects missing values", () => {
    const result = quotesAreComparable(official, { ...parallel, value: null }, 48);
    expect(result.ok).toBe(false);
  });

  it("rejects incompatible currency pairs", () => {
    const result = quotesAreComparable(official, { ...parallel, currencyPair: "EUR/LYD" }, 48);
    expect(result.ok).toBe(false);
  });

  it("rejects stale or misaligned dates", () => {
    const result = quotesAreComparable(
      official,
      { ...parallel, observedAt: "2026-07-01T12:00:00+02:00" },
      48,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects missing observation times", () => {
    const result = quotesAreComparable(official, { ...parallel, observedAt: null }, 48);
    expect(result.ok).toBe(false);
  });
});
