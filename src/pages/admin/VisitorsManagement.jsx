import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Search, RefreshCw, CheckCircle2, ChevronRight, UserCheck } from "lucide-react";
import UserService from "@/services/userService";

export default function VisitorsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: visitors = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["all-visitors"],
    queryFn: () => UserService.listAllGuests(),
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filtered = visitors.filter((v) => {
    const term = searchTerm.toLowerCase();
    const guestName = (v.name || "").toLowerCase();
    const guestDoc = (v.document || "").toLowerCase();
    const studentName = (v.user?.name || "").toLowerCase();
    const studentEmail = (v.user?.email || "").toLowerCase();
    const studentClass = (v.user?.className || "").toLowerCase();

    return (
      guestName.includes(term) ||
      guestDoc.includes(term) ||
      studentName.includes(term) ||
      studentEmail.includes(term) ||
      studentClass.includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Portaria & Visitantes</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Controle de Portaria</h1>
          <p className="text-muted-foreground mt-1">
            Lista de liberação de familiares e convidados cadastrados previamente pelos alunos.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          variant="outline"
          className="rounded-none text-xs uppercase font-bold tracking-wider gap-2 border-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Atualizar Lista
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total de Visitantes</p>
          <h2 className="text-4xl font-bold font-heading text-foreground">{visitors.length}</h2>
          <p className="text-xs text-muted-foreground mt-2">Cadastrados no sistema</p>
        </div>
        <div className="bg-white border border-border p-6 relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Resultados Filtrados</p>
          <h2 className="text-4xl font-bold font-heading text-foreground">{filtered.length}</h2>
          <p className="text-xs text-muted-foreground mt-2">Correspondentes à busca</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-green-950">Portaria Ativa</h4>
            <p className="text-xs text-green-800 leading-relaxed mt-0.5">
              Acesso condicionado a documento físico coincidente e vestimenta adequada.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-border p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por visitante (nome/documento) ou aluno responsável (nome/email/turma)..."
          className="border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-sm p-0 h-auto"
        />
      </div>

      {/* Visitor List Panel */}
      <div className="bg-white border border-border">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Carregando visitantes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">Nenhum visitante encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Verifique o termo pesquisado ou atualize a lista.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="p-4 pl-6">Visitante</th>
                  <th className="p-4">Documento (RG/CPF)</th>
                  <th className="p-4">Aluno Responsável</th>
                  <th className="p-4">RA / Turma</th>
                  <th className="p-4">Data Cadastro</th>
                  <th className="p-4 pr-6 text-right">Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold block text-foreground">{v.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-muted/60 px-2.5 py-1 text-muted-foreground border border-border font-bold">
                        {v.document}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground block">{v.user?.name || "—"}</span>
                      <span className="text-xs text-muted-foreground">{v.user?.email || "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="block text-xs font-bold text-muted-foreground">
                        {v.user?.enrollmentNumber ? `RA: ${v.user.enrollmentNumber}` : "—"}
                      </span>
                      <span className="text-xs text-primary font-bold">
                        {v.user?.className || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.created_date).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Liberado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
