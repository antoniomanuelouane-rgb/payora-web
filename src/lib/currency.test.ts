import { describe, expect, it } from "vitest";
import {
  GUARANTEE_DAYS,
  WITHDRAWAL_LIMITS,
  formatCurrency,
  isGuaranteeDays,
  isWithdrawalAmountAllowed,
} from "./currency";

describe("Payora currencies", () => {
  it.each([
    ["MZN", 500, 150_000],
    ["USD", 20, 10_000],
    ["BRL", 50, 50_000],
    ["EUR", 20, 10_000],
    ["GBP", 20, 10_000],
    ["ZAR", 300, 100_000],
    ["AOA", 10_000, 2_000_000],
    ["CAD", 25, 10_000],
  ] as const)("uses the specified withdrawal bounds for %s", (currency, minimum, maximum) => {
    expect(WITHDRAWAL_LIMITS[currency]).toEqual({ minimum, maximum });
    expect(isWithdrawalAmountAllowed(minimum, currency)).toBe(true);
    expect(isWithdrawalAmountAllowed(maximum, currency)).toBe(true);
    expect(isWithdrawalAmountAllowed(minimum - 0.01, currency)).toBe(false);
    expect(isWithdrawalAmountAllowed(maximum + 0.01, currency)).toBe(false);
  });

  it("allows only the four product guarantee periods in the PDF", () => {
    expect(GUARANTEE_DAYS).toEqual([7, 14, 15, 30]);
    expect(isGuaranteeDays(7)).toBe(true);
    expect(isGuaranteeDays(14)).toBe(true);
    expect(isGuaranteeDays(15)).toBe(true);
    expect(isGuaranteeDays(30)).toBe(true);
    expect(isGuaranteeDays(10)).toBe(false);
  });

  it("formats each amount in the selected currency without converting its value", () => {
    expect(formatCurrency(100, "MZN")).toBe("MZN 100,00");
    expect(formatCurrency(100, "AOA")).toBe("100,00 Kz");
    expect(formatCurrency(100, "USD")).toBe("$ 100,00");
  });
});