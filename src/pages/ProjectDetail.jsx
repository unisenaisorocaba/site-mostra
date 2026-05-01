import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Users, MapPin, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectService, CATEGORY_LABELS, getCategoryImage } from "@/services";

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => ProjectService.getById(id),
  });

  const project = projects;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8"><Skeleton className="h-64 w-full" /></div>
          <div className="col-span-4"><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Projeto não encontrado.</p>
        <Link to="/projetos">
          <Button variant="outline" className="rounded-none gap-2">
            <ChevronLeft className="w-4 h-4" /> Voltar aos Projetos
          </Button>
        </Link>
      </div>
    );
  }

  const image = project.thumbnail_url || getCategoryImage(project.category);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        to="/projetos"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Projetos Integradores
      </Link>

      {/* Project Header */}
      <div className="mb-10 border-l-8 border-primary pl-8 py-2">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
              {CATEGORY_LABELS[project.category] || project.category}
              {project.room && ` • ${project.room}`}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-3 leading-tight">
              {project.title}
            </h1>
            {project.abstract && (
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {project.abstract}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
              {project.status === "aprovado" ? "APROVADO" :
               project.status === "submetido" ? "EM AVALIAÇÃO" :
               project.status === "reprovado" ? "REPROVADO" : "RASCUNHO"}
            </span>
            {project.category && (
              <span className="px-3 py-1 border border-border text-[10px] font-bold uppercase tracking-widest">
                {CATEGORY_LABELS[project.category]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technical Summary */}
        <div className="lg:col-span-8 bg-white border border-border p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-muted pb-4">
            <h3 className="text-xl font-bold font-heading">Resumo Técnico</h3>
          </div>
          <div className="space-y-4">
            {project.description ? (
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">Descrição não fornecida.</p>
            )}
            {project.keywords?.length > 0 && (
              <div className="pt-4 border-t border-muted">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">
                  Palavras-chave
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 border border-border text-[10px] font-bold uppercase tracking-wider">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Sidebar */}
        <div className="lg:col-span-4 bg-white border border-border p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-muted pb-3">
            Equipe de Pesquisa
          </h3>
          <div className="space-y-5">
            {project.advisor && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{project.advisor}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Orientador</p>
                </div>
              </div>
            )}
            {project.members?.length > 0 ? (
              project.members.map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0 text-lg font-bold text-muted-foreground">
                    {m.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{m.name}</p>
                    {m.ra && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        RA: {m.ra}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm">{project.team_name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Equipe</p>
                </div>
              </div>
            )}
            {project.room && (
              <div className="pt-4 border-t border-muted">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Local de Apresentação
                    </span>
                    <span className="font-bold text-sm">{project.room}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery / Banner */}
        {(project.banner_url || project.thumbnail_url) && (
          <div className="lg:col-span-12 bg-white border border-border p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-heading">Material do Projeto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.thumbnail_url && (
                <div className="relative group overflow-hidden aspect-video bg-muted">
                  <img
                    src={project.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">IMAGEM DO PROJETO</p>
                  </div>
                </div>
              )}
              {project.banner_url && (
                <div className="relative group overflow-hidden aspect-video bg-muted">
                  <img
                    src={project.banner_url}
                    alt="Banner"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">BANNER DO PROJETO</p>
                  </div>
                </div>
              )}
            </div>
            {project.banner_url && (
              <div className="mt-6">
                <a href={project.banner_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white">
                    <Download className="w-4 h-4" /> Baixar Banner
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info strip */}
        <div className="lg:col-span-12 bg-secondary/10 border border-border p-8">
          <div className="flex flex-wrap gap-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Equipe</span>
              <span className="font-bold">{project.team_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Categoria</span>
              <span className="font-bold">{CATEGORY_LABELS[project.category] || project.category}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Status</span>
              <span className="font-bold capitalize">{project.status}</span>
            </div>
            {project.advisor && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Orientador</span>
                <span className="font-bold">{project.advisor}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}