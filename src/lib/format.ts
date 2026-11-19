export const USD_RATE = 63.9; // 1 USD ≈ 63,9 MZN (taxa de referência)

export type Currency = "MZN" | "USD";

export function formatMoney(valueMzn: number, currency: Currency = "MZN") {
  const v = currency === "USD" ? valueMzn / USD_RATE : valueMzn;
  const n = new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  return currency === "USD" ? `US$ ${n}` : `MZN ${n}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-MZ", { dateStyle: "short", timeStyle: "short" });
}

export const METHOD_LABEL: Record<string, string> = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  mkesh: "mKesh",
  card: "Visa/Mastercard",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  refused: "Recusada",
  refunded: "Reembolsada",
  chargeback: "Chargeback",
};
