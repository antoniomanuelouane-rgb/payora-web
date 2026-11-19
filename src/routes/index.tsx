import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/payora/Logo";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Payora — Venda produtos digitais em Moçambique" },
    { name: "description", content: "Venda e-books, cursos e mais com M-Pesa, e-Mola, mKesh e cartão. Receba em meticais." },
    { property: "og:title", content: "Payora — Venda produtos digitais em Moçambique" },
    { property: "og:description", content: "Venda com M-Pesa, e-Mola, mKesh e cartão. Receba em meticais." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-dark text-topbar-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-6">
        <Logo />
        <Button asChild variant="brand"><Link to="/auth">Entrar</Link></Button>
      </header>
      <main className="mx-auto max-w-3xl px-6 pt-20 pb-32 text-center">
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">Venda os seus produtos digitais <span className="text-primary-glow">em meticais</span></h1>
        <p className="mt-6 text-lg opacity-80">Checkout com M-Pesa, e-Mola, mKesh e Visa/Mastercard. Painel completo de vendas e saques.</p>
        <Button asChild variant="brand" size="lg" className="mt-10 h-12 px-10 text-base"><Link to="/auth">Começar a vender</Link></Button>
      </main>
    </div>
  );
}
