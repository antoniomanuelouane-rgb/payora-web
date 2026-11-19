import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { simulatePayment } from "@/lib/payments.functions";

export const Route = createFileRoute("/pagamento/simulado/$orderId")({
  head: () => ({ meta: [{ title: "Pagamento de teste — Payora" }, { name: "description", content: "Simulador de pagamento da Payora." }, { name: "robots", content: "noindex" }] }),
  component: Simulado,
});

function Simulado() {
  const { orderId } = Route.useParams();
  const simulate = useServerFn(simulatePayment);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function go(result: "approved" | "refused") {
    setBusy(true);
    try { await simulate({ data: { orderId, result } }); } finally { navigate({ to: "/pedido/$orderId", params: { orderId } }); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-card">
        <FlaskConical className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Modo de teste</h1>
        <p className="mt-2 text-sm text-muted-foreground">A integração com a PaySuite ainda não está ativa. Escolha o resultado deste pagamento simulado.</p>
        <div className="mt-6 grid gap-3">
          <Button variant="brand" size="lg" disabled={busy} onClick={() => go("approved")}>Aprovar pagamento</Button>
          <Button variant="outline" size="lg" disabled={busy} onClick={() => go("refused")}>Recusar pagamento</Button>
        </div>
      </div>
    </div>
  );
}
