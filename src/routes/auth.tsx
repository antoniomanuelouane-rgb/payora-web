import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/payora/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar — Payora" }, { name: "description", content: "Entre ou crie a sua conta de produtor na Payora." },
    { property: "og:title", content: "Entrar — Payora" }, { property: "og:description", content: "Entre ou crie a sua conta de produtor na Payora." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: f.name } } });
        if (error) throw error;
        toast.success("Conta criada! Confirme o seu e-mail para entrar.");
        setMode("login");
      }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); } finally { setBusy(false); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
          <h1 className="text-xl font-bold">{mode === "login" ? "Entrar na sua conta" : "Criar conta de produtor"}</h1>
          {mode === "signup" && <div className="space-y-1.5"><Label>Nome</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>}
          <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Senha</Label><Input type="password" minLength={6} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <Button type="submit" variant="brand" className="w-full" disabled={busy}>{mode === "login" ? "Entrar" : "Criar conta"}</Button>
          <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Ainda não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
