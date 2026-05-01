import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectService } from "@/services";

export default function FeaturedProjects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects-featured"],
    queryFn: () => ProjectService.listFeatured(),
  });

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase">Projetos em Destaque</h2>
        <Link to="/projetos">
          <Button variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <p className="text-muted-foreground">Nenhum projeto aprovado ainda. Fique atento!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} featured={i === 0} />
          ))}
        </div>
      )}
    </section>
  );
}