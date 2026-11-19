import { createFileRoute } from "@tanstack/react-router";
import { fetchPaySuiteStatus } from "@/lib/payments.functions";

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/paysuite-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["PAYSUITE_TOKEN"];
        if (!token) return new Response("not configured", { status: 503 });
        const raw = await request.text();
        const secret = process.env["PAYSUITE_WEBHOOK_SECRET"];
        if (secret) {
          const given = request.headers.get("x-webhook-signature") ?? "";
          if (given !== (await hmacHex(secret, raw))) return new Response("invalid signature", { status: 401 });
        }
        let payload: { data?: { id?: string } } = {};
        try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
        const ref = payload.data?.id;
        if (!ref) return new Response("missing id", { status: 400 });
        // Nunca confiar no corpo: confirmar o estado diretamente na PaySuite.
        const status = await fetchPaySuiteStatus(token, ref);
        if (status && status !== "pending") {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("provider_ref", ref).eq("status", "pending");
        }
        return Response.json({ ok: true });
      },
    },
  },
});
