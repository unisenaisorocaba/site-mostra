import React, { useState } from "react";
import { useAuth } from "@/lib/mockAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MockLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@senaisp.edu.br");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">UniSENAI SP</span>
          </div>
          <h1 className="text-2xl font-bold font-heading mb-1">Acesso ao Sistema</h1>
          <p className="text-muted-foreground text-sm">I Mostra de Projetos Integradores · 2026</p>
        </div>

        <div className="bg-white border border-border p-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">
                E-mail Institucional
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none"
                placeholder="email@senaisp.edu.br"
                required
              />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">
                Senha
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none"
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-3 h-auto mt-2"
            >
              {loading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Modo demonstração · qualquer email e senha são aceitos
        </p>
      </div>
    </div>
  );
}