import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ClipboardCheck, Camera, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="bg-white border border-border p-6 hover:border-primary transition-colors group">
    <div className="flex items-start justify-between">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
          {label}
        </span>
        <span className="text-3xl font-bold font-heading">{value}</span>
      </div>
      <div className={`w-12 h-12 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { data: myProjects } = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Project.filter({ created_by: user.email });
    },
    initialData: [],
  });

  const { data: evaluations } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Evaluation.filter({ created_by: user.email });
    },
    initialData: [],
  });

  const { data: photos } = useQuery({
    queryKey: ["photos-count"],
    queryFn: () => base44.entities.EventPhoto.list("-created_date", 200),
    initialData: [],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao painel da I Mostra de Projetos Integradores.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={FolderOpen}
          label="Meus Projetos"
          value={myProjects.length}
          color="bg-primary"
          to="/dashboard/projetos"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Avaliações Feitas"
          value={evaluations.length}
          color="bg-secondary"
          to="/dashboard/avaliacoes"
        />
        <StatCard
          icon={Camera}
          label="Fotos Enviadas"
          value={photos.length}
          color="bg-foreground"
          to="/dashboard/fotos"
        />
        <StatCard
          icon={TrendingUp}
          label="Projetos Submetidos"
          value={myProjects.filter((p) => p.status !== "rascunho").length}
          color="bg-primary"
          to="/dashboard/projetos"
        />
      </div>

      {myProjects.length > 0 && (
        <div className="bg-white border border-border p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Meus Projetos Recentes
          </h3>
          <div className="space-y-3">
            {myProjects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to="/dashboard/projetos"
                className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors"
              >
                <div>
                  <span className="font-bold">{project.title}</span>
                  <span className="text-xs text-muted-foreground ml-3">{project.team_name}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${
                    project.status === "aprovado"
                      ? "bg-green-100 text-green-700"
                      : project.status === "submetido"
                      ? "bg-blue-100 text-blue-700"
                      : project.status === "reprovado"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}