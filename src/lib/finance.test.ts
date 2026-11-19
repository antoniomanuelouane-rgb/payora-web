import { describe, expect, it } from "vitest";
import { computeBalances, computeMetrics, mapPaySuiteStatus } from "./finance";

const o = (status: string, amount: number, method = "mpesa") => ({ status, amount_mzn: amount, method, created_at: "" });

describe("finance", () => {
  it("saldo disponível desconta saques pedidos e pagos, ignora recusados", () => {
    const b = computeBalances([o("approved", 1000), o("approved", 500), o("pending", 300)], [
      { status: "requested", amount_mzn: 200 },
      { status: "paid", amount_mzn: 100 },
      { status: "rejected", amount_mzn: 999 },
    ]);
    expect(b.available).toBe(1200);
    expect(b.pending).toBe(300);
  });
  it("começa em zero sem dados", () => {
    const m = computeMetrics([]);
    expect(m.net).toBe(0);
    expect(m.sales).toBe(0);
    expect(m.mobileConversion).toBe(0);
  });
  it("conversão M-Pesa/e-Mola conta só esses métodos", () => {
    const m = computeMetrics([o("approved", 10, "mpesa"), o("refused", 10, "emola"), o("approved", 10, "card")]);
    expect(m.mobileConversion).toBe(50);
    expect(m.cardApproval).toBe(100);
  });
  it("mapeia estados da PaySuite", () => {
    expect(mapPaySuiteStatus("paid")).toBe("approved");
    expect(mapPaySuiteStatus("failed")).toBe("refused");
    expect(mapPaySuiteStatus("processing")).toBe("pending");
  });
});
