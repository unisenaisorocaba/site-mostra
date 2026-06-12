import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { PhotoService } from "@/services";

const categoryLabels = {
  abertura: "Abertura",
  apresentacoes: "Apresentações",
  premiacao: "Premiação",
  encerramento: "Encerramento",
  geral: "Geral",
};

export default function PublicPhotos() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos-public"],
    queryFn: () => PhotoService.listAll(),
  });

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase mb-2">Fotos do Evento</h1>
        <p className="text-muted-foreground">Momentos registrados durante a I Mostra de Projetos Integradores.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[{ key: "all", label: "Todas" }, ...Object.entries(categoryLabels).map(([k, v]) => ({ key: k, label: v }))].map((cat) => (
          <button key={cat.key} onClick={() => setFilter(cat.key)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${filter === cat.key ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {Array(8).fill(0).map((_, i) => (<Skeleton key={i} className="h-48 w-full break-inside-avoid" />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <p className="text-muted-foreground">Nenhuma foto disponível ainda.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((photo) => (
            <div key={photo.id} className="break-inside-avoid cursor-pointer group" onClick={() => setLightbox(photo)}>
              <div className="border border-border overflow-hidden bg-white">
                <img src={photo.photo_url} alt={photo.caption || "Foto do evento"} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3 space-y-1">
                  {photo.caption && <p className="text-xs text-muted-foreground">{photo.caption}</p>}
                  <p className="text-[10px] text-muted-foreground/80">
                    Enviada por: <span className="font-semibold text-primary">{photo.uploader_name || "Visitante"}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] text-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.photo_url} alt={lightbox.caption || ""} className="max-w-full max-h-[85vh] object-contain mx-auto" />
            <div className="mt-4 text-white space-y-1">
              {lightbox.caption && <p className="text-sm">{lightbox.caption}</p>}
              <p className="text-xs text-white/70">
                Enviada por: <span className="font-semibold text-primary">{lightbox.uploader_name || "Visitante"}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}