import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Package, GraduationCap, Store, Users, ShoppingCart, Repeat, Wallet,
  BarChart3, UserPlus, Puzzle, LifeBuoy, Menu, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Logo } from "./Logo";
import { formatMoney } from "@/lib/format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavItem = { label: string; icon: typeof Package; to: string; params?: { secao: string } };
const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Produtos", icon: Package, to: "/produtos" },
  { label: "Área de Membros", icon: GraduationCap, to: "/em-breve/$secao", params: { secao: "area-de-membros" } },
  { label: "Marketplace", icon: Store, to: "/em-breve/$secao", params: { secao: "marketplace" } },
  { label: "Meus Afiliados", icon: Users, to: "/em-breve/$secao", params: { secao: "afiliados" } },
  { label: "Vendas", icon: ShoppingCart, to: "/vendas" },
  { label: "Assinaturas", icon: Repeat, to: "/em-breve/$secao", params: { secao: "assinaturas" } },
  { label: "Financeiro", icon: Wallet, to: "/financeiro" },
  { label: "Relatórios", icon: BarChart3, to: "/em-breve/$secao", params: { secao: "relatorios" } },
  { label: "Colaboradores", icon: UserPlus, to: "/em-breve/$secao", params: { secao: "colaboradores" } },
  { label: "Apps", icon: Puzzle, to: "/em-breve/$secao", params: { secao: "apps" } },
  { label: "Ajuda", icon: LifeBuoy, to: "/em-breve/$secao", params: { secao: "ajuda" } },
];

const GOAL = 10000;

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: revenue = 0 } = useQuery({
    queryKey: ["revenue-total", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("amount_mzn").eq("status", "approved");
      return (data ?? []).reduce((s, o) => s + Number(o.amount_mzn), 0);
    },
  });
  const pct = Math.min(100, (revenue / GOAL) * 100);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-topbar px-4 text-topbar-foreground md:px-6">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu"><Menu className="h-6 w-6" /></button>
        <Link to="/dashboard"><Logo /></Link>
        <div className="ml-auto flex items-center gap-5">
          <div className="hidden w-56 sm:block">
            <div className="mb-1 flex justify-between text-xs font-medium opacity-90">
              <span>{formatMoney(revenue).replace(",00", "")}</span><span>MZN 10K</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/25">
              <div className="h-full rounded-full bg-primary-glow transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="hidden text-sm opacity-90 lg:inline">{user?.email}</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-semibold text-primary-glow">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Terminar sessão</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} fixed inset-y-16 left-0 z-30 w-64 overflow-y-auto bg-sidebar p-3 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)]`}>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                params={item.params as never}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                activeProps={{ className: "bg-sidebar-accent !text-sidebar-primary font-semibold" }}
                activeOptions={{ exact: false, includeSearch: false }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
