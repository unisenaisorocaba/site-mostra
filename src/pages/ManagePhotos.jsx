import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PhotoService } from "@/services";

const categoryLabels = {
  abertura: "Abertura",
  apresentacoes: "Apresentações",
  premiacao: "Premiação",
  encerramento: "Encerramento",
  geral: "Geral",
};

export default function ManagePhotos() {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("geral");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["my-photos"],
    queryFn: () => PhotoService.listMine(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => PhotoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-photos"] });
      toast({ title: "Foto excluída." });
    },
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      await PhotoService.upload({ file, caption, category });
    }
    queryClient.invalidateQueries({ queryKey: ["my-photos"] });
    toast({ title: `${files.length} foto(s) enviada(s) com sucesso!` });
    setUploading(false);
    setCaption("");
    e.target.value = "";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Fotos do Evento</h1>
        <p className="text-muted-foreground mt-1">Envie fotos registradas durante a mostra.</p>
      </div>

      <div className="bg-white border border-border p-6 mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Enviar Fotos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs uppercase font-bold tracking-wider">Legenda</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} className="rounded-none mt-1" placeholder="Descrição da foto" />
          </div>
          <div>
            <Label className="text-xs uppercase font-bold tracking-wider">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-none mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <label className="cursor-pointer w-full">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
              <span className="inline-flex items-center justify-center gap-2 w-full px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? "Enviando..." : "Selecionar Fotos"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma foto enviada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border border-border bg-white group relative overflow-hidden">
              <img src={photo.photo_url} alt={photo.caption || "Foto"} className="w-full h-48 object-cover" />
              <div className="p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
                  {categoryLabels[photo.category] || photo.category}
                </span>
                {photo.caption && <p className="text-xs text-muted-foreground line-clamp-2">{photo.caption}</p>}
              </div>
              <button onClick={() => { if (confirm("Excluir esta foto?")) deleteMutation.mutate(photo.id); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}