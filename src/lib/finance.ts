export type OrderLite = { status: string; amount_mzn: number | string; method: string; created_at: string };
export type WithdrawalLite = { status: string; amount_mzn: number | string };

const num = (v: number | string) => Number(v) || 0;

/** Disponível = vendas aprovadas − saques pedidos/pagos. Pendente = vendas pendentes. */
export function computeBalances(orders: OrderLite[], withdrawals: WithdrawalLite[]) {
  const approved = orders.filter((o) => o.status === "approved").reduce((s, o) => s + num(o.amount_mzn), 0);
  const pending = orders.filter((o) => o.status === "pending").reduce((s, o) => s + num(o.amount_mzn), 0);
  const withdrawn = withdrawals.filter((w) => w.status !== "rejected").reduce((s, w) => s + num(w.amount_mzn), 0);
  return { available: Math.max(0, approved - withdrawn), pending, approvedTotal: approved };
}

export function computeMetrics(orders: OrderLite[]) {
  const approved = orders.filter((o) => o.status === "approved");
  const card = orders.filter((o) => o.method === "card");
  const mobile = orders.filter((o) => o.method === "mpesa" || o.method === "emola");
  const pct = (a: number, b: number) => (b === 0 ? 0 : (a / b) * 100);
  return {
    net: approved.reduce((s, o) => s + num(o.amount_mzn), 0),
    sales: approved.length,
    cardApproval: pct(card.filter((o) => o.status === "approved").length, card.length),
    oneClick: 0,
    refunds: orders.filter((o) => o.status === "refunded").reduce((s, o) => s + num(o.amount_mzn), 0),
    mobileConversion: pct(mobile.filter((o) => o.status === "approved").length, mobile.length),
    chargebacks: orders.filter((o) => o.status === "chargeback").length,
    generated: orders.length,
  };
}

export function mapPaySuiteStatus(s: string | undefined | null): "approved" | "refused" | "pending" {
  const v = (s ?? "").toLowerCase();
  if (["paid", "completed", "success", "successful", "approved"].includes(v)) return "approved";
  if (["failed", "cancelled", "canceled", "expired", "rejected"].includes(v)) return "refused";
  return "pending";
}
