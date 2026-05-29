import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Layers, Search, Image as ImageIcon, ExternalLink } from "lucide-react";
import { CategoryService } from "@/services";

const emptyCategory = { name: "", code: "", description: "", image_url: "" };

export default function CategoryManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria cadastrada com sucesso!" });
      closeForm();
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error || "Erro ao cadastrar categoria.";
      toast({ title: "Erro no cadastro", description: errMsg, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => CategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria atualizada!" });
      closeForm();
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error || "Erro ao atualizar categoria.";
      toast({ title: "Erro na atualização", description: errMsg, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria removida." });
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error || "Erro ao remover categoria.";
      toast({ title: "Erro na exclusão", description: errMsg, variant: "destructive" });
    },
  });

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyCategory);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      code: category.code,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    
    // Auto-generate code if it contains spaces or uppercase
    const cleanCode = form.code.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");

    const payload = {
      ...form,
      code: cleanCode,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = categories.filter((c) => {
    return (
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Gestão de Categorias</h1>
          <p className="text-muted-foreground mt-1">Cadastro de áreas e categorias de projetos da Mostra</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(emptyCategory);
            setShowForm(true);
          }}
          className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Categoria
        </Button>
      </div>

      <div className="bg-white border border-border p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total de Categorias</p>
          <p className="text-4xl font-bold font-heading">{categories.length}</p>
        </div>
        <Layers className="w-10 h-10 text-primary/20" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-lg p-8 shadow-lg relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <h2 className="text-xl font-bold font-heading mb-6 border-b border-muted pb-4">
              {editing ? "Editar Categoria" : "Cadastrar Categoria"}
            </h2>
            <div className="space-y-5">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome da Categoria *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    const codeVal = form.code || nameVal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
                    setForm({ ...form, name: nameVal, code: codeVal });
                  }}
                  className="rounded-none"
                  placeholder="Ex: Inteligência Artificial"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Código da Categoria *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="rounded-none"
                  placeholder="Ex: inteligencia-artificial"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Identificador de URL sem espaços (ex: software, mecatronica)</p>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-none"
                  placeholder="Breve descrição da categoria"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">URL da Imagem de Destaque</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="rounded-none"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">Link de imagem para ser usado na galeria de projetos</p>
              </div>
              {form.image_url && (
                <div className="mt-3 border border-border p-2 bg-muted/20 flex gap-3 items-center">
                  <img src={form.image_url} alt="Preview" className="w-16 h-12 object-cover border border-border" onError={(e) => { e.target.style.display = 'none'; }} />
                  <span className="text-[10px] font-semibold text-muted-foreground">Preview da imagem da categoria</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-muted">
              <Button variant="outline" onClick={closeForm} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
              <Button
                onClick={handleSave}
                disabled={!form.name || !form.code || createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold"
              >
                {editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, código ou descrição..."
          className="pl-10 rounded-none"
        />
      </div>

      <div className="bg-white border border-border">
        <div className="bg-muted/40 border-b border-border px-6 py-4">
          <span className="text-[10px] font-bold uppercase tracking-widest">{filtered.length} categoria(s)</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((cat) => (
              <div key={cat.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/20 transition-colors">
                <div className="w-16 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-bold text-sm">{cat.name}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-muted text-muted-foreground uppercase border tracking-wider">
                      {cat.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {cat.description || "Sem descrição cadastrada."}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center mt-3 sm:mt-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Remover a categoria "${cat.name}"?`)) {
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
