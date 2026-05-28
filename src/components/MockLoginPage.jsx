import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function MockLoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados dos formulários
  const [email, setEmail] = useState("admin@senaisp.edu.br");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [className, setClassName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const payload = {
          name,
          email,
          password,
          role: role === "STUDENT" ? "aluno" : "professor",
          enrollmentNumber: role === "STUDENT" ? enrollmentNumber : undefined,
          className: role === "STUDENT" ? className : undefined,
        };
        await register(payload);
        toast.success("Cadastro realizado com sucesso! Faça login.");
        setIsRegister(false);
      } else {
        await login(email, password);
        toast.success("Login efetuado com sucesso!");
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
      toast.error(err.message || "Erro na operação");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold font-heading mb-1">
            {isRegister ? "Criar nova conta" : "Acesso ao Sistema"}
          </h1>
          <p className="text-muted-foreground text-sm">
            I Mostra de Projetos Integradores · 2026
          </p>
        </div>

        <div className="bg-white border border-border p-8 relative shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Nome Completo
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-none"
                  placeholder="Nome do usuário"
                  required
                />
              </div>
            )}

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
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
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
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

            {isRegister && (
              <>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
                    Tipo de Usuário
                  </Label>
                  <Select value={role} onValueChange={(v) => setRole(v)}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Aluno</SelectItem>
                      <SelectItem value="TEACHER">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
                        Matrícula / RA
                      </Label>
                      <Input
                        type="text"
                        value={enrollmentNumber}
                        onChange={(e) => setEnrollmentNumber(e.target.value)}
                        className="rounded-none"
                        placeholder="Ex: 2026001"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">
                        Turma / Curso
                      </Label>
                      <Input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="rounded-none"
                        placeholder="Ex: DDS-3A"
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-3 h-auto mt-4"
            >
              {loading
                ? (isRegister ? "Cadastrando..." : "Entrando...")
                : (isRegister ? "Cadastrar-se" : "Entrar no Sistema")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-xs text-primary font-bold hover:underline uppercase tracking-wide bg-transparent border-0 cursor-pointer"
            >
              {isRegister
                ? "Já tem uma conta? Entrar"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}