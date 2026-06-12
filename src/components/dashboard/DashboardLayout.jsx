import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  Camera,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Users,
  UsersRound,
  Mic,
  ListChecks,
  Layers,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import UserService from "@/services/userService";

const studentNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projetos", path: "/dashboard/projetos", icon: FolderOpen },
  { label: "Perfil", path: "/dashboard/perfil", icon: User },
  { label: "Fotos", path: "/dashboard/fotos", icon: Camera },
];

const teacherNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projetos", path: "/dashboard/projetos", icon: FolderOpen },
  { label: "Categorias", path: "/dashboard/categorias", icon: Layers },
  { label: "Avaliações", path: "/dashboard/avaliacoes", icon: ClipboardCheck },
  { label: "Critérios", path: "/dashboard/criterios", icon: ListChecks },
  { label: "Perfil", path: "/dashboard/perfil", icon: User },
  { label: "Visitantes", path: "/dashboard/visitantes", icon: Users },
  { label: "Fotos", path: "/dashboard/fotos", icon: Camera },
];

const adminNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projetos", path: "/dashboard/projetos", icon: FolderOpen },
  { label: "Categorias", path: "/dashboard/categorias", icon: Layers },
  { label: "Avaliações", path: "/dashboard/avaliacoes", icon: ClipboardCheck },
  { label: "Meus Critérios", path: "/dashboard/criterios", icon: ListChecks },
  { label: "Perfil", path: "/dashboard/perfil", icon: User },
  { label: "Visitantes", path: "/dashboard/visitantes", icon: Users },
  { label: "Usuários", path: "/dashboard/usuarios", icon: UsersRound },
  { label: "Fotos", path: "/dashboard/fotos", icon: Camera },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => UserService.me() });
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => UserService.myProfile(),
    enabled: !!user,
  });

  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";
  const isTeacher = isAdmin || profile?.user_type === "professor";
  const navItems = isAdmin ? adminNavItems : isTeacher ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button className="xl:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold uppercase text-primary tracking-tight font-heading">
              UniSENAI SP
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs uppercase font-bold tracking-wide gap-2">
              <ChevronLeft className="w-4 h-4" /> Site Público
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-xs uppercase font-bold tracking-wide gap-2 text-destructive"
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed xl:sticky top-16 left-0 bottom-0 w-64 bg-white border-r border-border flex flex-col z-40 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
            }`}
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-heading">
              Painel da Mostra
            </h2>
          </div>
          <nav className="flex-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all ${isActive(item.path)
                    ? "text-primary border-l-4 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-4 border-transparent"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}