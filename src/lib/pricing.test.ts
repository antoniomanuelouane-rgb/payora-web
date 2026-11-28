import { describe, expect, it } from "vitest";
import { activeMethods, availableAt, computeSplit, computeWallets, withinGuarantee } from "./pricing";

describe("split financeiro", () => {
  it("taxa 6,99% + fixa e comissão de 30% sobre o líquido", () => {
    const s = computeSplit({ gross: 1000, feePercent: 6.99, fixedFee: 10, affiliatePercent: 30 });
    expect(s.platformFee).toBe(79.9);
    expect(s.affiliateCommission).toBe(276.03);
    expect(s.net).toBe(644.07);
    expect(s.platformFee + s.affiliateCommission + s.net).toBeCloseTo(1000, 2);
  });
  it("sem afiliado o produtor recebe gross menos taxa", () => {
    expect(computeSplit({ gross: 500, feePercent: 10, fixedFee: 0, affiliatePercent: 0 }).net).toBe(450);
  });
  it("líquido nunca fica negativo", () => {
    expect(computeSplit({ gross: 5, feePercent: 10, fixedFee: 50, affiliatePercent: 0 }).net).toBe(0);
  });
});

describe("retenção e garantia", () => {
  it("liberta após o maior entre retenção e garantia", () => {
    expect(availableAt(new Date("2026-01-01T00:00:00Z"), 7, 30).toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
  it("reembolso só dentro do prazo de garantia", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(withinGuarantee("2026-01-05T00:00:00Z", 7, now)).toBe(true);
    expect(withinGuarantee("2026-01-01T00:00:00Z", 7, now)).toBe(false);
  });
});

describe("carteiras", () => {
  const base = { seller_id: "s", affiliate_id: "a", provider: "paysuite", status: "approved", currency: "MZN", net_amount: 600, affiliate_commission: 300 };
  const now = new Date("2026-02-01T00:00:00Z");
  it("separa pendente e disponível e desconta saques", () => {
    const w = computeWallets("s", [
      { ...base, available_at: "2026-01-20T00:00:00Z" },
      { ...base, available_at: "2026-02-20T00:00:00Z" },
    ], [{ status: "requested", currency: "MZN", amount: 100 }, { status: "rejected", currency: "MZN", amount: 999 }], now);
    expect(w[0]).toEqual({ currency: "MZN", available: 500, pending: 600, withdrawn: 0 });
  });
  it("afiliado recebe só a comissão; pedidos de teste e reembolsados não contam", () => {
    const w = computeWallets("a", [
      { ...base, available_at: "2026-01-20T00:00:00Z" },
      { ...base, provider: "test", available_at: "2026-01-20T00:00:00Z" },
      { ...base, status: "refunded", available_at: "2026-01-20T00:00:00Z" },
    ], [], now);
    expect(w[0]?.available).toBe(300);
  });
});

describe("métodos activos", () => {
  it("moedas sem integração não mostram métodos", () => {
    expect(activeMethods("USD", true, false)).toEqual([]);
    expect(activeMethods("MZN", false, false)).toEqual([]);
    expect(activeMethods("MZN", true, false)).toContain("mpesa");
  });
});