import React from "react";

const stats = [
  { label: "Localização", value: "Sorocaba, SP" },
  { label: "Projetos Expostos", value: "60+ Unidades" },
  { label: "Categorias", value: "08 Áreas" },
  { label: "Participantes", value: "240 Alunos" },
];

export default function StatsBar() {
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