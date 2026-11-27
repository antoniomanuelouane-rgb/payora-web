import { formatCurrency, type Currency } from "@/lib/currency";

export const USD_RATE = 63.9; // Taxa de referência mantida apenas para o dashboard legado.
export type { Currency } from "@/lib/currency";
export type LegacyDisplayCurrency = "MZN" | "USD";

export function formatMoney(amount: number, currency: Currency = "MZN") {
  return formatCurrency(amount, currency);
}

export function formatMznInLegacyDisplayCurrency(amountMzn: number, currency: LegacyDisplayCurrency = "MZN") {
  return formatCurrency(currency === "USD" ? amountMzn / USD_RATE : amountMzn, currency);
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
