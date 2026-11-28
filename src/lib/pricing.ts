import type { Currency } from "@/lib/currency";

/** Converte para cêntimos inteiros para evitar erros de vírgula flutuante. */
export const toCents = (v: number | string) => Math.round(Number(v) * 100);
export const fromCents = (c: number) => c / 100;

export type Split = { gross: number; platformFee: number; affiliateCommission: number; net: number };

/**
 * Taxa Payora = gross × percentagem + taxa fixa.
 * Comissão do afiliado = percentagem sobre (gross − taxa Payora).
 * Líquido do produtor = gross − taxa − comissão (nunca negativo).
 */
export function computeSplit(input: { gross: number; feePercent: number; fixedFee: number; affiliatePercent: number }): Split {
  const g = toCents(input.gross);
  const fee = Math.min(g, Math.round((g * input.feePercent) / 100) + toCents(input.fixedFee));
  const commission = Math.round(((g - fee) * Math.max(0, input.affiliatePercent)) / 100);
  const net = Math.max(0, g - fee - commission);
  return { gross: fromCents(g), platformFee: fromCents(fee), affiliateCommission: fromCents(commission), net: fromCents(net) };
}

export function availableAt(paidAt: Date, holdDays: number, guaranteeDays: number) {
  const d = new Date(paidAt);
  d.setUTCDate(d.getUTCDate() + Math.max(holdDays, guaranteeDays));
  return d;
}

export type LedgerOrder = {
  status: string; currency: string; net_amount: number | string; affiliate_commission: number | string;
  available_at: string | null; seller_id: string; affiliate_id: string | null; provider: string;
};
export type LedgerWithdrawal = { status: string; currency: string; amount: number | string };
export type Wallet = { currency: Currency; available: number; pending: number; withdrawn: number };

/** Saldos por moeda. Pedidos de teste nunca contam. Pendente até available_at. */
export function computeWallets(userId: string, orders: LedgerOrder[], withdrawals: LedgerWithdrawal[], now = new Date()): Wallet[] {
  const map = new Map<string, { a: number; p: number; w: number }>();
  const get = (c: string) => map.get(c) ?? (map.set(c, { a: 0, p: 0, w: 0 }), map.get(c)!);
  for (const o of orders) {
    if (o.status !== "approved" || o.provider === "test") continue;
    let cents = 0;
    if (o.seller_id === userId) cents += toCents(o.net_amount);
    if (o.affiliate_id === userId) cents += toCents(o.affiliate_commission);
    if (!cents) continue;
    const b = get(o.currency);
    if (o.available_at && new Date(o.available_at) <= now) b.a += cents; else b.p += cents;
  }
  for (const w of withdrawals) {
    if (w.status === "rejected") continue;
    const b = get(w.currency);
    b.a -= toCents(w.amount);
    if (w.status === "paid") b.w += toCents(w.amount);
  }
  return [...map.entries()].map(([currency, b]) => ({
    currency: currency as Currency, available: fromCents(Math.max(0, b.a)), pending: fromCents(b.p), withdrawn: fromCents(b.w),
  }));
}

/** Métodos de pagamento por moeda; só ficam activos quando há integração real configurada. */
export const METHODS_BY_CURRENCY: Record<string, string[]> = {
  MZN: ["mpesa", "emola", "mkesh", "card"],
  BRL: ["pix", "card"],
  USD: ["card", "paypal"], EUR: ["card", "paypal"], GBP: ["card", "paypal"],
  ZAR: ["card"], AOA: ["card"], CAD: ["card"],
};
/** Métodos que o adaptador PaySuite actual suporta (apenas MZN). */
export const PAYSUITE_METHODS = ["mpesa", "emola", "mkesh", "card"];
export function activeMethods(currency: string, paysuiteConfigured: boolean, testMode: boolean) {
  if (currency !== "MZN") return [];
  if (paysuiteConfigured || testMode) return PAYSUITE_METHODS;
  return [];
}

export function withinGuarantee(paidAt: string | null, guaranteeDays: number, now = new Date()) {
  if (!paidAt) return false;
  return now.getTime() - new Date(paidAt).getTime() <= guaranteeDays * 86_400_000;
}