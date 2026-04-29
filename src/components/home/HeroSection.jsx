import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[520px] md:h-[600px] overflow-hidden">
      <div className="absolute inset-0 bg-primary z-10" />
      <img
        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80"
        alt="Laboratório de engenharia"
        className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-overlay opacity-60"
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
        <span className="inline-block bg-white text-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 self-start">
          Campus Sorocaba
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl font-heading">
          I Mostra de Projetos Integradores UniSENAI SP
        </h1>
        <p className="mt-6 text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
          A celebração da inovação técnica e excelência acadêmica. Conheça as soluções 
          desenvolvidas por nossos alunos para os desafios reais da indústria 4.0.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/projetos">
            <Button className="bg-white text-primary hover:bg-white/90 rounded-none px-8 py-3 text-xs uppercase font-bold tracking-wider h-auto gap-2">
              Ver Projetos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/fotos">
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-none px-8 py-3 text-xs uppercase font-bold tracking-wider h-auto">
              Fotos do Evento
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}