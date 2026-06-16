import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, ArrowRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectService, EvaluationService, UserService } from "@/services";
import { useToast } from "@/components/ui/use-toast";

const statusConfig = {
  aprovado: { label: "APROVADO", cls: "bg-green-100 text-green-700" },
  submetido: { cls: "bg-blue-100 text-blue-700", label: "SUBMETIDO" },
  reprovado: { cls: "bg-red-100 text-red-700", label: "REPROVADO" },
  rascunho: { cls: "bg-gray-100 text-gray-600", label: "RASCUNHO" },
};

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserService.me(),
  });

  const isTeacherOrAdmin = user?.role?.toUpperCase() === "TEACHER" || user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "PROFESSOR";

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

  const publishAllGrades = useMutation({
    mutationFn: () => ProjectService.bulkPublishGrades(true),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: res.message || "Notas publicadas com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao publicar notas",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base md:text-lg">Painel da I Mostra de Projetos Integradores · 2026</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/dashboard/projetos" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider border-2 w-full">Projetos</Button>
          </Link>
          <Link to="/dashboard/avaliacoes" className="flex-1 sm:flex-initial">
            <Button className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider w-full">Nova Avaliação</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { label: "Pendentes de Avaliação", value: pendingCount, note: "Projetos na fila", to: "/dashboard/avaliacoes", highlight: true },
          { label: "Avaliações Concluídas", value: evaluations.length, note: "Total neste semestre", to: "/dashboard/avaliacoes" },
          { label: "Média de Desempenho", value: avgScore, note: "/ 10 pontos", to: "/dashboard/avaliacoes" },
          { label: "Projetos Submetidos", value: submitted, note: "De " + myProjects.length + " cadastrados", to: "/dashboard/projetos" },
        ].map((card, i) => (
          <Link key={i} to={card.to} className="bg-white border border-border p-4 sm:p-6 relative overflow-hidden hover:border-primary transition-colors group">
            {card.highlight && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{card.label}</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">{card.value}</h2>
            <p className="text-xs text-muted-foreground mt-2">{card.note}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="bg-muted/50 border-b border-border px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest">Lista de Projetos Cadastrados</span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isTeacherOrAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs uppercase font-bold tracking-wide gap-1.5 border-dashed rounded-none h-8 bg-white border-2 hover:bg-muted"
                onClick={() => {
                  if (confirm("Deseja publicar publicamente as notas de todos os seus projetos orientados de uma única vez?")) {
                    publishAllGrades.mutate();
                  }
                }}
                disabled={publishAllGrades.isPending || myProjects.length === 0}
              >
                <Globe className="w-3.5 h-3.5" />
                {publishAllGrades.isPending ? "Publicando..." : "Publicar Todas as Notas"}
              </Button>
            )}
            <Link to="/dashboard/avaliacoes">
              <Button variant="ghost" size="sm" className="text-xs uppercase font-bold tracking-wide text-primary gap-1 h-8 rounded-none">
                Avaliar Projetos <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

        {myProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado ainda.</p>
            <Link to="/dashboard/projetos">
              <Button className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">Criar Primeiro Projeto</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest border-b border-border text-muted-foreground">
                  <th className="px-6 py-4">#ID</th>
                  <th className="px-6 py-4">Nome do Projeto</th>
                  <th className="px-6 py-4 hidden md:table-cell">Orientador</th>
                  <th className="px-6 py-4 hidden md:table-cell">Integrantes</th>
                  <th className="px-6 py-4 text-center">Nota Projeto</th>
                  <th className="px-6 py-4 text-center">Nota Award</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {myProjects.sort((a, b) => a.id - b.id).map((project) => (
                  <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {project.project_number ? `#${project.project_number}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/projetos/${project.id}`} className="font-bold text-foreground hover:text-primary hover:underline transition-colors block">
                        {project.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-mono">{project.team_name}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                      {project.advisor || "—"}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground max-w-xs truncate" title={Array.isArray(project.members) ? project.members.map((m) => m.name).join(", ") : ""}>
                      {Array.isArray(project.members)
                        ? project.members.map((m) => m.name || m.email.split("@")[0]).join(", ")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {project.grade_work !== undefined ? project.grade_work : "—"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {project.grade_award !== undefined ? project.grade_award : "—"}
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