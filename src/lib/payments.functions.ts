import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeBalances, mapPaySuiteStatus } from "@/lib/finance";

const PAYSUITE_API = "https://paysuite.tech/api/v1";
const METHODS = ["mpesa", "emola", "mkesh", "card"] as const;
type Method = (typeof METHODS)[number];

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function fetchPaySuiteStatus(token: string, ref: string) {
  const res = await fetch(`${PAYSUITE_API}/payments/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { status?: string; transaction?: { status?: string } | null } };
  return mapPaySuiteStatus(json.data?.transaction?.status ?? json.data?.status);
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { productId: string; name: string; email: string; phone: string; method: Method; origin: string }) => {
    const name = String(input.name ?? "").trim();
    const email = String(input.email ?? "").trim();
    const phone = String(input.phone ?? "").replace(/\s/g, "");
    if (name.length < 2 || name.length > 120) throw new Error("Nome inválido");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) throw new Error("E-mail inválido");
    if (!/^\+?\d{8,15}$/.test(phone)) throw new Error("Número de telemóvel inválido");
    if (!METHODS.includes(input.method)) throw new Error("Método inválido");
    if (!/^[0-9a-f-]{36}$/i.test(input.productId)) throw new Error("Produto inválido");
    return { ...input, name, email, phone };
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: product } = await db.from("products").select("id,user_id,name,price_mzn,active").eq("id", data.productId).maybeSingle();
    if (!product || !product.active) throw new Error("Produto indisponível");

    const { data: order, error } = await db
      .from("orders")
      .insert({
        product_id: product.id,
        seller_id: product.user_id,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        method: data.method,
        amount_mzn: product.price_mzn,
      })
      .select("id")
      .single();
    if (error || !order) throw new Error("Não foi possível criar o pedido");

    const token = process.env["PAYSUITE_TOKEN"];
    if (!token) return { redirect: `/pagamento/simulado/${order.id}`, testMode: true };

    const origin = /^https?:\/\//.test(data.origin) ? data.origin : "";
    const res = await fetch(`${PAYSUITE_API}/payments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        amount: Number(product.price_mzn).toFixed(2),
        reference: order.id.replace(/-/g, "").slice(0, 20),
        description: product.name.slice(0, 120),
        method: data.method === "card" ? "credit_card" : data.method,
        return_url: `${origin}/pedido/${order.id}`,
        callback_url: `${origin}/api/public/paysuite-webhook`,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: { id?: string; checkout_url?: string }; message?: string };
    if (!res.ok || !json.data?.checkout_url) {
      await db.from("orders").update({ status: "refused" }).eq("id", order.id);
      throw new Error(json.message ?? "O gateway de pagamento recusou o pedido");
    }
    await db.from("orders").update({ provider_ref: json.data.id ?? null, checkout_url: json.data.checkout_url }).eq("id", order.id);
    return { redirect: json.data.checkout_url, testMode: false };
  });

export const getOrderPublic = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.orderId)) throw new Error("Pedido inválido");
    return input;
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: order } = await db
      .from("orders")
      .select("id,status,amount_mzn,method,customer_name,provider_ref,products(name,delivery_url)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("Pedido não encontrado");
    const token = process.env["PAYSUITE_TOKEN"];
    let status = order.status;
    if (status === "pending" && token && order.provider_ref) {
      const s = await fetchPaySuiteStatus(token, order.provider_ref);
      if (s && s !== "pending") {
        await db.from("orders").update({ status: s, updated_at: new Date().toISOString() }).eq("id", order.id);
        status = s;
      }
    }
    const product = order.products as unknown as { name: string; delivery_url: string | null } | null;
    let delivery: string | null = null;
    if (status === "approved" && product?.delivery_url) {
      if (product.delivery_url.startsWith("file:")) {
        const { data: signed } = await db.storage.from("product-files").createSignedUrl(product.delivery_url.slice(5), 60 * 60 * 24);
        delivery = signed?.signedUrl ?? null;
      } else delivery = product.delivery_url;
    }
    return {
      id: order.id,
      status,
      amount: Number(order.amount_mzn),
      method: order.method,
      customer: order.customer_name,
      productName: product?.name ?? "",
      delivery,
      testMode: !token,
    };
  });

export const simulatePayment = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string; result: "approved" | "refused" }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.orderId)) throw new Error("Pedido inválido");
    if (input.result !== "approved" && input.result !== "refused") throw new Error("Resultado inválido");
    return input;
  })
  .handler(async ({ data }) => {
    if (process.env["PAYSUITE_TOKEN"]) throw new Error("Modo de teste desativado");
    const db = await admin();
    await db.from("orders").update({ status: data.result, updated_at: new Date().toISOString() }).eq("id", data.orderId).eq("status", "pending");
    return { ok: true };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number; method: string; account: string }) => {
    const amount = Number(input.amount);
    if (!(amount >= 100)) throw new Error("O valor mínimo de saque é MZN 100");
    if (!["mpesa", "emola", "mkesh", "banco"].includes(input.method)) throw new Error("Método inválido");
    const account = String(input.account ?? "").trim();
    if (account.length < 6 || account.length > 60) throw new Error("Conta/número inválido");
    return { amount, method: input.method, account };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: orders }, { data: wds }] = await Promise.all([
      supabase.from("orders").select("status,amount_mzn,method,created_at").eq("seller_id", userId),
      supabase.from("withdrawals").select("status,amount_mzn").eq("user_id", userId),
    ]);
    const { available } = computeBalances(orders ?? [], wds ?? []);
    if (data.amount > available) throw new Error("Saldo disponível insuficiente");
    const { error } = await supabase.from("withdrawals").insert({ user_id: userId, amount_mzn: data.amount, method: data.method, account: data.account });
    if (error) throw new Error("Não foi possível registar o saque");
    return { ok: true };
  });
