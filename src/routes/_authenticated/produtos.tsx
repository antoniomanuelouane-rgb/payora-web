import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, ImageIcon, Pencil, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/payora/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/format";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Payora" }, { name: "robots", content: "noindex" }] }),
  component: Produtos,
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

function Produtos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      return (await supabase.from("products").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false })).data ?? [];
    },
  });

  async function toggle(p: Product) {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["products"] });
  }
  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/checkout/${id}`);
    toast.success("Link de checkout copiado");
  }

  return (
    <div>
      <PageHeader title="Produtos">
        <Button variant="brand" onClick={() => setEditing({ active: true })}><Plus />Novo produto</Button>
      </PageHeader>
      {!isLoading && products.length === 0 && (
        <div className="rounded-2xl bg-card p-12 text-center shadow-card">
          <p className="text-lg font-semibold">Crie o seu primeiro produto digital</p>
          <p className="mt-1 text-muted-foreground">E-books, cursos, modelos — venda com M-Pesa, e-Mola, mKesh e cartão.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
            <div className="flex aspect-video items-center justify-center bg-muted">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{p.name}</h3>
                <Switch checked={p.active} onCheckedChange={() => toggle(p)} aria-label="Ativar produto" />
              </div>
              <p className="mt-1 font-display text-lg font-bold text-primary">{formatMoney(Number(p.price_mzn))}</p>
              <p className="text-xs text-muted-foreground">{p.active ? "Ativo" : "Desativado"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil />Editar</Button>
                <Button size="sm" variant="outline" onClick={() => copyLink(p.id)}><Copy />Link</Button>
                <Button size="sm" variant="ghost" asChild><a href={`/checkout/${p.id}`} target="_blank" rel="noreferrer"><ExternalLink />Ver</a></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <ProductDialog product={editing} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["products"] }); }} />}
    </div>
  );
}

function ProductDialog({ product, onClose }: { product: Partial<Product>; onClose: () => void }) {
  const isFile = product.delivery_url?.startsWith("file:");
  const [form, setForm] = useState({
    name: product.name ?? "",
    description: product.description ?? "",
    price: product.price_mzn != null ? String(product.price_mzn) : "",
    image_url: product.image_url ?? "",
    delivery_url: isFile ? "" : product.delivery_url ?? "",
    active: product.active ?? true,
  });
  const [deliveryMode, setDeliveryMode] = useState<"url" | "file">(isFile ? "file" : "url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !(price > 0)) { toast.error("Indique nome e preço válidos"); return; }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      let image_url = form.image_url || null;
      if (imageFile) {
        const path = `${uid}/${Date.now()}-${imageFile.name.replace(/[^\w.-]/g, "_")}`;
        const up = await supabase.storage.from("product-images").upload(path, imageFile);
        if (up.error) throw up.error;
        const { data: s } = await supabase.storage.from("product-images").createSignedUrl(path, TEN_YEARS);
        image_url = s?.signedUrl ?? null;
      }
      let delivery_url: string | null = deliveryMode === "url" ? form.delivery_url.trim() || null : product.delivery_url ?? null;
      if (deliveryMode === "file" && deliveryFile) {
        const path = `${uid}/${Date.now()}-${deliveryFile.name.replace(/[^\w.-]/g, "_")}`;
        const up = await supabase.storage.from("product-files").upload(path, deliveryFile);
        if (up.error) throw up.error;
        delivery_url = `file:${path}`;
      }
      if (delivery_url && !delivery_url.startsWith("file:") && !/^https?:\/\//.test(delivery_url)) throw new Error("O link de entrega deve começar por http(s)://");
      const row = { name: form.name.trim(), description: form.description, price_mzn: price, image_url, delivery_url, active: form.active };
      const res = product.id
        ? await supabase.from("products").update(row).eq("id", product.id)
        : await supabase.from("products").insert({ ...row, user_id: uid });
      if (res.error) throw res.error;
      toast.success("Produto guardado");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar");
    } finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product.id ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Nome</Label><Input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Descrição</Label><Textarea rows={4} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Preço (MZN)</Label><Input type="number" min={1} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Imagem</Label><Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} /></div>
          <div className="space-y-2">
            <Label>Entrega do produto</Label>
            <Tabs value={deliveryMode} onValueChange={(v) => setDeliveryMode(v as "url" | "file")}>
              <TabsList><TabsTrigger value="url">Link (URL)</TabsTrigger><TabsTrigger value="file">Ficheiro</TabsTrigger></TabsList>
            </Tabs>
            {deliveryMode === "url"
              ? <Input placeholder="https://..." value={form.delivery_url} onChange={(e) => setForm({ ...form, delivery_url: e.target.value })} />
              : <><Input type="file" onChange={(e) => setDeliveryFile(e.target.files?.[0] ?? null)} />{isFile && !deliveryFile && <p className="text-xs text-muted-foreground">Ficheiro atual mantido.</p>}</>}
          </div>
          <div className="flex items-center gap-3"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><span className="text-sm">Produto ativo</span></div>
          <Button type="submit" variant="brand" className="w-full" disabled={busy}>{busy ? "A guardar..." : "Guardar produto"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
