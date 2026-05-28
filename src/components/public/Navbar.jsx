import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated: authenticated } = useAuth();

  const links = [
    { label: "Início", path: "/" },
    { label: "Projetos", path: "/projetos" },
    { label: "Fotos", path: "/fotos" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-xl font-bold uppercase text-primary tracking-tight font-heading">
            UniSENAI SP
          </span>
          <span className="hidden sm:block text-xs font-bold uppercase text-muted-foreground tracking-widest border-l border-border pl-3">
            Mostra I
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                isActive(link.path)
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authenticated ? (
            <Link to="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase font-bold tracking-wider px-6">
                Área Logada
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => {}}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase font-bold tracking-wider px-6"
            >
              Entrar
            </Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white px-6 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-bold uppercase tracking-wide text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {authenticated ? (
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              <Button className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
                Área Logada
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => {}}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold"
            >
              Entrar
            </Button>
          )}
        </div>
      )}
    </header>
  );
}