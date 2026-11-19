import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/payora/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeBalances } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { requestWithdrawal } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Payora" }, { name: "robots", content: "noindex" }] }),
  component: Financeiro,
});

const WD_STATUS: Record<string, string> = { requested: "Solicitado", paid: "Pago", rejected: "Recusado" };
const WD_METHOD: Record<string, string> = { mpesa: "M-Pesa", emola: "e-Mola", mkesh: "mKesh", banco: "Transferência bancária" };

function Financeiro() {
  const qc = useQueryClient();
  const request = useServerFn(requestWithdrawal);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", method: "mpesa", account: "" });
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const [o, w] = await Promise.all([
        supabase.from("orders").select("status,amount_mzn,method,created_at"),
        supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      ]);
      return { orders: o.data ?? [], withdrawals: w.data ?? [] };
    },
  });
  const b = computeBalances(data?.orders ?? [], data?.withdrawals ?? []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await request({ data: { amount: Number(form.amount), method: form.method, account: form.account } });
      toast.success("Pedido de saque registado");
      setOpen(false);
      setForm({ amount: "", method: "mpesa", account: "" });
      qc.invalidateQueries({ queryKey: ["finance"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao pedir saque");
    } finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader title="Financeiro">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="brand">Solicitar saque</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar saque</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-muted-foreground">Disponível: <b className="text-foreground">{formatMoney(b.available)}</b></p>
              <div className="space-y-1.5"><Label>Valor (MZN)</Label><Input type="number" min={100} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Receber por</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(WD_METHOD).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>{form.method === "banco" ? "NIB" : "Número de telemóvel"}</Label><Input required value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} /></div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>{busy ? "A enviar..." : "Confirmar pedido"}</Button>
              <p className="text-xs text-muted-foreground">Os saques são processados manualmente pela equipa Payora.</p>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-dark p-6 text-topbar-foreground shadow-card">
          <p className="text-sm opacity-80">Saldo disponível</p>
          <p className="mt-2 font-display text-3xl font-bold text-primary-glow">{formatMoney(b.available)}</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Saldo pendente</p>
          <p className="mt-2 font-display text-3xl font-bold">{formatMoney(b.pending)}</p>
        </div>
      </div>
      <h2 className="mb-3 text-lg font-semibold">Pedidos de saque</h2>
      <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr>{["Data", "Valor", "Método", "Conta", "Estado"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {(data?.withdrawals ?? []).map((w) => (
              <tr key={w.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{formatDate(w.created_at)}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(Number(w.amount_mzn))}</td>
                <td className="px-4 py-3">{WD_METHOD[w.method] ?? w.method}</td>
                <td className="px-4 py-3">{w.account}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{WD_STATUS[w.status]}</Badge></td>
              </tr>
            ))}
            {(data?.withdrawals ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Nenhum saque solicitado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
