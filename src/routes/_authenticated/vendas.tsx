import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/payora/AppShell";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatMoney, METHOD_LABEL, STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vendas")({
  head: () => ({ meta: [{ title: "Vendas — Payora" }, { name: "robots", content: "noindex" }] }),
  component: Vendas,
});

export function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    approved: "bg-accent text-accent-foreground",
    pending: "bg-warning/20 text-foreground",
    refused: "bg-destructive/15 text-destructive",
    refunded: "bg-muted text-muted-foreground",
    chargeback: "bg-destructive/15 text-destructive",
  };
  return <Badge variant="outline" className={`border-0 ${cls[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</Badge>;
}

function Vendas() {
  const [status, setStatus] = useState("all");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders-list", status],
    queryFn: async () => {
      let q = supabase.from("orders").select("id,status,customer_name,customer_email,customer_phone,amount_mzn,method,created_at,products(name)").order("created_at", { ascending: false }).limit(500);
      if (status !== "all") q = q.eq("status", status);
      return (await q).data ?? [];
    },
  });
  return (
    <div>
      <PageHeader title="Vendas">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {["pending", "approved", "refused", "refunded"].map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>
      <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>{["Estado", "Cliente", "Produto", "Valor", "Método", "Data"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.customer_email} · {o.customer_phone}</div></td>
                <td className="px-4 py-3">{(o.products as { name: string } | null)?.name}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(Number(o.amount_mzn))}</td>
                <td className="px-4 py-3">{METHOD_LABEL[o.method]}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
              </tr>
            ))}
            {!isLoading && orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">Ainda não há vendas. Partilhe o link de checkout dos seus produtos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
