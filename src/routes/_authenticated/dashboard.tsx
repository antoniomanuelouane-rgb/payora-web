import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/payora/AppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeMetrics } from "@/lib/finance";
import { formatMznInLegacyDisplayCurrency, USD_RATE, type LegacyDisplayCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Payora" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const PERIODS = { hoje: 0, "7d": 6, "30d": 29 } as const;
type Period = keyof typeof PERIODS;

function startOf(period: Period) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - PERIODS[period]);
  return d;
}

function Dashboard() {
  const [period, setPeriod] = useState<Period>("7d");
  const [productId, setProductId] = useState("all");
  const [currency, setCurrency] = useState<LegacyDisplayCurrency>("MZN");

  const { data: products = [] } = useQuery({
    queryKey: ["products-min"],
    queryFn: async () => (await supabase.from("products").select("id,name").order("created_at")).data ?? [],
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders-dash", period, productId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      let q = supabase.from("orders").select("status,amount_mzn,method,created_at").eq("seller_id", u.user!.id).gte("created_at", startOf(period).toISOString());
      if (productId !== "all") q = q.eq("product_id", productId);
      return (await q).data ?? [];
    },
  });

  const m = computeMetrics(orders);
  const chart = useMemo(() => {
    const days = PERIODS[period] + 1;
    const start = startOf(period);
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      return { key: d.toDateString(), label: d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit" }), valor: 0 };
    });
    for (const o of orders) {
      if (o.status !== "approved") continue;
      const b = buckets.find((x) => x.key === new Date(o.created_at).toDateString());
      if (b) b.valor += Number(o.amount_mzn) / (currency === "USD" ? USD_RATE : 1);
    }
    return buckets;
  }, [orders, period, currency]);

  const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;
  const cards = [
    { label: "Valor líquido", value: formatMznInLegacyDisplayCurrency(m.net, currency) },
    { label: "Vendas", value: String(m.sales) },
    { label: "Aprovação cartão", value: pct(m.cardApproval) },
    { label: "Vendas 1-click", value: String(m.oneClick) },
    { label: "Reembolso", value: formatMznInLegacyDisplayCurrency(m.refunds, currency) },
    { label: "Conversão (M-Pesa/e-Mola)", value: pct(m.mobileConversion) },
    { label: "Chargeback", value: String(m.chargebacks) },
    { label: "Pagamentos gerados", value: String(m.generated) },
  ];

  return (
    <div>
      <PageHeader title="Dashboard">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="hoje">Hoje</SelectItem><SelectItem value="7d">7 dias</SelectItem><SelectItem value="30d">30 dias</SelectItem></SelectContent>
        </Select>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          <SelectTrigger className="w-24 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="MZN">MZN</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
        </Select>
      </PageHeader>

      <div className="mb-6 rounded-2xl bg-card p-5 shadow-card">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">Vendas do período</h2>
          <span className="text-sm text-muted-foreground">{formatMznInLegacyDisplayCurrency(m.net, currency)}</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="fillV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v: number) => formatMznInLegacyDisplayCurrency(v, currency)} />
              <Area type="monotone" dataKey="valor" name="Vendas" stroke="var(--primary)" strokeWidth={2.5} fill="url(#fillV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border-l-4 border-primary bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
      {currency === "USD" && <p className="mt-3 text-xs text-muted-foreground">Conversão aproximada: 1 USD ≈ {USD_RATE} MZN.</p>}
    </div>
  );
}
