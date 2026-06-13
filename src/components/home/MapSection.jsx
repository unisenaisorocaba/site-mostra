import React from "react";
import { MapPin, Maximize2, Download } from "lucide-react";
import mapaImg from "@/components/public/mapa.png";

export default function MapSection() {
  return (
    <section className="bg-white border-b border-border py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">
            Localização e Espaços
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading uppercase">
            Mapa da Mostra
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Encontre a localização das bancas, salas de apresentações orais e painéis de banners no Bloco B do campus.
          </p>
        </div>

        <div className="relative border border-border bg-muted/10 p-2 md:p-4 group">
          {/* Action buttons overlay on hover */}
          <div className="absolute right-6 top-6 z-30 flex gap-2">
            <a
              href={mapaImg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 bg-white border border-border shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer text-muted-foreground"
              title="Expandir Mapa"
            >
              <Maximize2 className="w-4 h-4" />
            </a>
            <a
              href={mapaImg}
              download="mapa_mostra_unisenai.png"
              className="inline-flex items-center justify-center w-10 h-10 bg-white border border-border shadow-sm hover:border-primary hover:text-primary transition-colors cursor-pointer text-muted-foreground"
              title="Baixar Mapa"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          {/* Map Image container */}
          <div className="overflow-hidden border border-border bg-white flex justify-center items-center">
            <img
              src={mapaImg}
              alt="Mapa de Localização da I Mostra"
              className="w-full h-auto max-h-[700px] object-contain transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>

          {/* Legend/Info Footer */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Bloco B — Salas de Aula e Corredor Superior (Banners e Protótipos)</span>
            </div>
            <span>Clique nos botões do canto superior para expandir ou baixar a imagem em alta resolução.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
