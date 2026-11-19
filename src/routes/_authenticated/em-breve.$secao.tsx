import { createFileRoute, Link } from "@tanstack/react-router";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAMES: Record<string, string> = {
  "area-de-membros": "Área de Membros", marketplace: "Marketplace", afiliados: "Meus Afiliados",
  assinaturas: "Assinaturas", relatorios: "Relatórios", colaboradores: "Colaboradores", apps: "Apps", ajuda: "Ajuda",
};

export const Route = createFileRoute("/_authenticated/em-breve/$secao")({
  head: () => ({ meta: [{ title: "Em breve — Payora" }, { name: "robots", content: "noindex" }] }),
  component: EmBreve,
});

function EmBreve() {
  const { secao } = Route.useParams();
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-card p-10 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary"><Hourglass /></div>
      <h1 className="text-2xl font-bold">{NAMES[secao] ?? "Esta secção"} chega em breve</h1>
      <p className="mt-2 text-muted-foreground">Estamos a preparar esta funcionalidade para a próxima fase da Payora.</p>
      <Button asChild variant="brand" className="mt-6"><Link to="/dashboard">Voltar ao Dashboard</Link></Button>
    </div>
  );
}
