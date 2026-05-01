import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectService, CATEGORY_LABELS } from "@/services";

const categories = [
  { key: "all", label: "Todos" },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label })),
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects-public"],
    queryFn: () => ProjectService.listApprovedAll(),
  });

  const filtered = projects.filter((p) => {
    const matchCategory = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.team_name?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase mb-2">Galeria de Projetos</h1>
        <p className="text-muted-foreground">Explore os projetos integradores desenvolvidos pelos alunos do UniSENAI SP.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${activeCategory === cat.key ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary"}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (<div key={i}><Skeleton className="h-48 w-full" /><Skeleton className="h-5 w-3/4 mt-4" /><Skeleton className="h-4 w-full mt-2" /></div>))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} featured={i === 0 && activeCategory === "all"} />
          ))}
        </div>
      )}
    </div>
  );
}