import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Lock, Smartphone } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/payora/Logo";
import { formatMoney } from "@/lib/format";
import { createCheckout } from "@/lib/payments.functions";

const getProduct = createServerFn({ method: "GET" })
  .inputValidator((id: string) => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("bad id");
    return id;
  })
  .handler(async ({ data: id }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      } },
    });
    const { data } = await db.from("products").select("id,name,description,price_mzn,image_url").eq("id", id).eq("active", true).maybeSingle();
    return data;
  });

export const Route = createFileRoute("/checkout/$id")({
  loader: async ({ params }) => {
    const p = await getProduct({ data: params.id }).catch(() => null);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — Checkout Payora` : "Produto indisponível — Payora";
    const d = loaderData?.description?.slice(0, 150) || "Pagamento seguro com M-Pesa, e-Mola, mKesh ou cartão.";
    return { meta: [
      { title: t }, { name: "description", content: d },
      { property: "og:title", content: t }, { property: "og:description", content: d },
      { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.image_url ? [{ property: "og:image", content: loaderData.image_url }, { name: "twitter:image", content: loaderData.image_url }] : []),
    ] };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div><h1 className="text-2xl font-bold">Produto indisponível</h1><p className="mt-2 text-muted-foreground">Este produto não existe ou foi desativado.</p></div>
    </div>
  ),
  component: Checkout,
});

const METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "emola", label: "e-Mola", icon: Smartphone },
  { id: "mkesh", label: "mKesh", icon: Smartphone },
  { id: "card", label: "Visa / Mastercard", icon: CreditCard },
] as const;

function Checkout() {
  const p = Route.useLoaderData();
  const create = useServerFn(createCheckout);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("mpesa");
  const [form, setForm] = useState({ name: "", email: "", phone: "+258 " });
  const [busy, setBusy] = useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await create({ data: { productId: p.id, ...form, method, origin: window.location.origin } });
      window.location.href = r.redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao iniciar pagamento");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-ink py-3"><div className="mx-auto flex max-w-5xl items-center gap-2 px-4"><LogoMark className="h-6 w-6" /><span className="font-display text-sm font-bold tracking-[0.12em] text-topbar-foreground">PAYORA</span><span className="ml-auto flex items-center gap-1 text-xs text-topbar-foreground/70"><Lock className="h-3 w-3" />Pagamento seguro</span></div></div>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-card shadow-card">
            {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-video w-full object-cover" />}
            <div className="p-5">
              <h1 className="text-xl font-bold">{p.name}</h1>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-4 font-display text-3xl font-bold text-primary">{formatMoney(Number(p.price_mzn))}</p>
            </div>
          </div>
        </div>
        <form onSubmit={pay} className="space-y-5 rounded-2xl bg-card p-6 shadow-card md:col-span-3">
          <h2 className="text-lg font-semibold">Os seus dados</h2>
          <div className="space-y-1.5"><Label>Nome completo</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Telemóvel</Label><Input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <h2 className="pt-2 text-lg font-semibold">Método de pagamento</h2>
          <div className="grid grid-cols-2 gap-3">
            {METHODS.map((m) => (
              <button type="button" key={m.id} onClick={() => setMethod(m.id)}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-medium transition-colors ${method === m.id ? "border-primary bg-accent text-accent-foreground" : "border-border hover:border-primary/50"}`}>
                <m.icon className="h-4 w-4" />{m.label}
              </button>
            ))}
          </div>
          {method === "card" && <p className="text-xs text-muted-foreground">Ideal para clientes fora de Moçambique. O valor é cobrado em MZN.</p>}
          <Button type="submit" variant="brand" size="lg" className="h-12 w-full text-base" disabled={busy}>
            {busy ? "A processar..." : `Pagar ${formatMoney(Number(p.price_mzn))}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
