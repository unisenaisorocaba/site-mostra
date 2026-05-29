import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services";

export default function StatsBar() {
  const { data: statsData } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => ProjectService.getPublicStats(),
  });

  const stats = [
    { label: "Localização", value: "Sorocaba, SP" },
    { label: "Projetos Expostos", value: statsData ? `${statsData.projects} Unidades` : "..." },
    { label: "Categorias", value: statsData ? `${statsData.categories} Áreas` : "..." },
    { label: "Participantes", value: statsData ? `${statsData.students} Alunos` : "..." },
  ];

  return (
    <div className="max-w-7xl mx-auto -mt-1">
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white border border-border">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 md:p-6 border-b md:border-b-0 md:border-r last:border-r-0 border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
              {stat.label}
            </span>
            <span className="text-lg md:text-xl font-bold text-primary font-heading">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}