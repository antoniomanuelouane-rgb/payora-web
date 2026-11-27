export const CURRENCIES = ["MZN", "USD", "BRL", "EUR", "GBP", "ZAR", "AOA", "CAD"] as const;

export type Currency = (typeof CURRENCIES)[number];
export type GuaranteeDays = 7 | 14 | 15 | 30;

export const GUARANTEE_DAYS = [7, 14, 15, 30] as const satisfies readonly GuaranteeDays[];

export const WITHDRAWAL_LIMITS: Record<Currency, { minimum: number; maximum: number }> = {
  MZN: { minimum: 500, maximum: 150_000 },
  USD: { minimum: 20, maximum: 10_000 },
  BRL: { minimum: 50, maximum: 50_000 },
  EUR: { minimum: 20, maximum: 10_000 },
  GBP: { minimum: 20, maximum: 10_000 },
  ZAR: { minimum: 300, maximum: 100_000 },
  AOA: { minimum: 10_000, maximum: 2_000_000 },
  CAD: { minimum: 25, maximum: 10_000 },
};

const CURRENCY_PREFIX: Record<Currency, string> = {
  MZN: "MZN",
  USD: "$",
  BRL: "R$",
  EUR: "€",
  GBP: "£",
  ZAR: "R",
  AOA: "Kz",
  CAD: "C$",
};

export function formatCurrency(amount: number, currency: Currency = "MZN") {
  const formatted = new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === "AOA") return `${formatted} ${CURRENCY_PREFIX[currency]}`;
  return `${CURRENCY_PREFIX[currency]} ${formatted}`;
}

export function isGuaranteeDays(value: number): value is GuaranteeDays {
  return GUARANTEE_DAYS.some((days) => days === value);
}

export function isWithdrawalAmountAllowed(amount: number, currency: Currency) {
  const limit = WITHDRAWAL_LIMITS[currency];
  return Number.isFinite(amount) && amount >= limit.minimum && amount <= limit.maximum;
}