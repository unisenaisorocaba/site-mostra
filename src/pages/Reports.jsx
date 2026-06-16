import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EvaluationService } from "@/services";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, FileText } from "lucide-react";

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ["student-evaluations-report"],
    queryFn: () => EvaluationService.getStudentReport(),
  });

  const filteredData = useMemo(() => {
    return reportData.filter((row) => {
      const q = searchQuery.toLowerCase();
      return row.name.toLowerCase().includes(q) || 
             row.email.toLowerCase().includes(q) || 
             (row.turma && row.turma.toLowerCase().includes(q));
    });
  }, [reportData, searchQuery]);

  return (
    <div>
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Relatórios</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Relatório de Engajamento</h1>
        <p className="text-muted-foreground mt-1 text-base">Acompanhe a quantidade de projetos avaliados por cada aluno diariamente.</p>
      </div>

      <div className="bg-white border border-border">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail ou data..." 
              className="pl-9 rounded-none bg-muted/20"
            />
          </div>
          <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 self-start sm:self-auto">
            {filteredData.length} registros
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando relatório...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Nenhum dado encontrado para esta busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest border-b border-border text-muted-foreground">
                  <th className="px-6 py-4">Nome do Aluno</th>
                  <th className="px-6 py-4">Turma / Curso</th>
                  <th className="px-6 py-4 text-center">Dia 01 (16/06)</th>
                  <th className="px-6 py-4 text-center">Dia 02 (17/06)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{row.name}</p>
                      <p className="text-[10px] text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{row.turma}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[10px] sm:text-xs ${
                        row.assignedDay1 === 0 ? "bg-muted text-muted-foreground" :
                        row.evaluatedDay1 >= row.assignedDay1 ? "bg-green-100 text-green-700" :
                        row.evaluatedDay1 > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {row.evaluatedDay1} / {row.assignedDay1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[10px] sm:text-xs ${
                        row.assignedDay2 === 0 ? "bg-muted text-muted-foreground" :
                        row.evaluatedDay2 >= row.assignedDay2 ? "bg-green-100 text-green-700" :
                        row.evaluatedDay2 > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {row.evaluatedDay2} / {row.assignedDay2}
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
