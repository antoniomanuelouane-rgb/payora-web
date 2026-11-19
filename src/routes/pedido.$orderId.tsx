import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderPublic } from "@/lib/payments.functions";
import { formatMoney, METHOD_LABEL } from "@/lib/format";

export const Route = createFileRoute("/pedido/$orderId")({
  head: () => ({ meta: [{ title: "Estado do pedido — Payora" }, { name: "description", content: "Acompanhe o estado do seu pagamento na Payora." }, { name: "robots", content: "noindex" }] }),
  component: Pedido,
});

function Pedido() {
  const { orderId } = Route.useParams();
  const fetchOrder = useServerFn(getOrderPublic);
  const { data, error } = useQuery({
    queryKey: ["order-public", orderId],
    queryFn: () => fetchOrder({ data: { orderId } }),
    refetchInterval: (q) => (q.state.data?.status === "pending" ? 4000 : false),
  });
  if (error) return <Center><p>Pedido não encontrado.</p></Center>;
  if (!data) return <Center><p className="text-muted-foreground">A carregar...</p></Center>;
  const icon = data.status === "approved" ? <CheckCircle2 className="h-14 w-14 text-primary" /> : data.status === "pending" ? <Clock className="h-14 w-14 text-warning" /> : <XCircle className="h-14 w-14 text-destructive" />;
  const title = data.status === "approved" ? "Pagamento aprovado!" : data.status === "pending" ? "A aguardar pagamento" : "Pagamento não concluído";
  return (
    <Center>
      <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex justify-center">{icon}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{data.productName} · {formatMoney(data.amount)} · {METHOD_LABEL[data.method]}</p>
        {data.status === "pending" && <p className="mt-4 text-sm text-muted-foreground">Confirme o pagamento no seu telemóvel. Esta página atualiza automaticamente.</p>}
        {data.status === "approved" && data.delivery && (
          <Button asChild variant="brand" size="lg" className="mt-6 w-full"><a href={data.delivery} target="_blank" rel="noreferrer"><Download />Aceder ao produto</a></Button>
        )}
      </div>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4">{children}</div>;
}
