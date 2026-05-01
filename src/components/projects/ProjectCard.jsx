import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORY_LABELS, getCategoryImage } from "@/services";

export default function ProjectCard({ project, featured = false }) {
  const image = project.thumbnail_url || getCategoryImage(project.category, 600);

  if (featured) {
    return (
      <Link
        to={`/projetos/${project.id}`}
        className="md:col-span-2 md:row-span-2 relative group overflow-hidden border border-border bg-white flex flex-col hover:border-primary transition-colors"
      >
        <div className="h-64 md:h-2/3 overflow-hidden">
          <img
            src={image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 md:p-8 flex-1 flex flex-col border-l-4 border-primary">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
            DESTAQUE • {CATEGORY_LABELS[project.category] || project.category}
          </span>
          <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 leading-tight">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {project.abstract || project.description}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase tracking-tight">
              {project.team_name}
            </span>
            <span className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/projetos/${project.id}`}
      className="border border-border bg-white hover:border-primary transition-all group"
    >
      <div className="h-48 overflow-hidden border-b border-border">
        <img
          src={image}
          alt={project.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      </div>
      <div className="p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
          {CATEGORY_LABELS[project.category] || project.category}
        </span>
        <h4 className="text-lg font-bold font-heading mb-2 leading-tight">
          {project.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {project.abstract || project.description}
        </p>
        <div className="mt-4 flex justify-between items-center border-t border-border pt-3">
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {project.room || project.team_name}
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
      </div>
    </Link>
  );
}