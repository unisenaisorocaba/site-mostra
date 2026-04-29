import React from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Users, MapPin, Tag, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels = {
  mecatronica: "Mecatrônica",
  software: "Software",
  gestao: "Gestão",
  logistica: "Logística",
  energia: "Energia",
  quimica: "Química",
  automacao: "Automação",
  outros: "Outros",
};

const defaultImages = {
  mecatronica: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
  software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  gestao: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  logistica: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  energia: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
  quimica: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
  automacao: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  outros: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
};

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.Project.filter({ id }, null, 1),
  });

  const project = projects?.[0];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-80 w-full mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-40 w-full" />
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

  const image = project.thumbnail_url || defaultImages[project.category] || defaultImages.outros;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        to="/projetos"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar aos Projetos
      </Link>

      <div className="relative h-64 md:h-96 overflow-hidden border border-border mb-8">
        <img src={image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8">
          <Badge className="bg-primary text-white rounded-none mb-3 text-[10px] uppercase tracking-widest font-bold">
            {categoryLabels[project.category] || project.category}
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold text-white font-heading leading-tight">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {project.abstract && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Resumo
              </h3>
              <p className="text-base leading-relaxed">{project.abstract}</p>
            </div>
          )}
          {project.description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Descrição
              </h3>
              <p className="text-base leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          )}
          {project.banner_url && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Banner do Projeto
              </h3>
              <div className="border border-border">
                <img src={project.banner_url} alt="Banner" className="w-full" />
              </div>
              <a href={project.banner_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="mt-3 rounded-none text-xs uppercase font-bold gap-2">
                  <Download className="w-4 h-4" /> Baixar Banner
                </Button>
              </a>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                  Equipe
                </span>
                <span className="font-bold">{project.team_name}</span>
              </div>
            </div>

            {project.advisor && (
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                    Orientador
                  </span>
                  <span className="font-bold">{project.advisor}</span>
                </div>
              </div>
            )}

            {project.room && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                    Local
                  </span>
                  <span className="font-bold">{project.room}</span>
                </div>
              </div>
            )}

            {project.keywords?.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                    Palavras-chave
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {project.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="rounded-none text-[10px] uppercase">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {project.members?.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Membros
                </span>
                <div className="space-y-1.5">
                  {project.members.map((m, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-semibold">{m.name}</span>
                      {m.ra && <span className="text-muted-foreground ml-2">RA: {m.ra}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}