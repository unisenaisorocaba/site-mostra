import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectService, EvaluationService } from "@/services";

const statusConfig = {
  aprovado: { label: "APROVADO", cls: "bg-green-100 text-green-700" },
  submetido: { cls: "bg-blue-100 text-blue-700", label: "SUBMETIDO" },
  reprovado: { cls: "bg-red-100 text-red-700", label: "REPROVADO" },
  rascunho: { cls: "bg-gray-100 text-gray-600", label: "RASCUNHO" },
};

export default function Dashboard() {
  const { data: myProjects = [] } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => ProjectService.listMine(),
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: () => EvaluationService.listMine(),
  });

  const { data: projectsForEval = [] } = useQuery({
    queryKey: ["projects-for-eval"],
    queryFn: () => ProjectService.listApproved(),
  });

  const submitted = myProjects.filter((p) => p.status !== "rascunho").length;
  const avgScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + parseFloat(EvaluationService.average(e) || 0), 0) / evaluations.length).toFixed(1)
    : "—";

  const pendingCount = Math.max(0, projectsForEval.length - evaluations.length);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Painel da I Mostra de Projetos Integradores · 2026</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/projetos">
            <Button variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider border-2">Meus Projetos</Button>
          </Link>
          <Link to="/dashboard/avaliacoes">
            <Button className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider">Nova Avaliação</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Pendentes de Avaliação", value: pendingCount, note: "Projetos na fila", to: "/dashboard/avaliacoes", highlight: true },
          { label: "Avaliações Concluídas", value: evaluations.length, note: "Total neste semestre", to: "/dashboard/avaliacoes" },
          { label: "Média de Desempenho", value: avgScore, note: "/ 10 pontos", to: "/dashboard/avaliacoes" },
          { label: "Projetos Submetidos", value: submitted, note: "De " + myProjects.length + " cadastrados", to: "/dashboard/projetos" },
        ].map((card, i) => (
          <Link key={i} to={card.to} className="bg-white border border-border p-6 relative overflow-hidden hover:border-primary transition-colors group">
            {card.highlight && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{card.label}</p>
            <h2 className="text-4xl font-bold font-heading text-foreground">{card.value}</h2>
            <p className="text-xs text-muted-foreground mt-2">{card.note}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="bg-muted/50 border-b border-border px-6 py-4 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest">Lista de Projetos Cadastrados</span>
          <Link to="/dashboard/projetos">
            <Button variant="ghost" size="sm" className="text-xs uppercase font-bold tracking-wide text-primary gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado ainda.</p>
            <Link to="/dashboard/projetos">
              <Button className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">Criar Primeiro Projeto</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myProjects.slice(0, 5).map((project) => {
              const st = statusConfig[project.status] || statusConfig.rascunho;
              return (
                <div key={project.id} className="p-6 flex items-center hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0 mr-6">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-base">{project.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.team_name}</p>
                  </div>
                  <Link to="/dashboard/projetos">
                    <Button size="sm" variant={project.status === "rascunho" ? "default" : "outline"}
                      className={`rounded-none text-xs uppercase font-bold ${project.status === "rascunho" ? "bg-primary text-primary-foreground" : ""}`}>
                      {project.status === "rascunho" ? "Submeter" : "Ver Detalhes"}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}