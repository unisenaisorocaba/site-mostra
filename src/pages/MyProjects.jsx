import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Pencil, Trash2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

const emptyProject = {
  title: "",
  description: "",
  abstract: "",
  category: "software",
  team_name: "",
  advisor: "",
  room: "",
  keywords: [],
  members: [{ name: "", ra: "" }],
};

export default function MyProjects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [keywordsText, setKeywordsText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Project.filter({ created_by: user.email }, "-created_date");
    },
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Projeto criado com sucesso!" });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Projeto atualizado!" });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Projeto excluído." });
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyProject);
    setKeywordsText("");
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || "",
      description: project.description || "",
      abstract: project.abstract || "",
      category: project.category || "software",
      team_name: project.team_name || "",
      advisor: project.advisor || "",
      room: project.room || "",
      keywords: project.keywords || [],
      members: project.members?.length ? project.members : [{ name: "", ra: "" }],
    });
    setKeywordsText((project.keywords || []).join(", "));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      keywords: keywordsText.split(",").map((k) => k.trim()).filter(Boolean),
      members: form.members.filter((m) => m.name),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBannerUpload = async (e, projectId) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Project.update(projectId, { banner_url: file_url });
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    toast({ title: "Banner enviado com sucesso!" });
  };

  const handleThumbnailUpload = async (e, projectId) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Project.update(projectId, { thumbnail_url: file_url });
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    toast({ title: "Imagem enviada!" });
  };

  const submitProject = async (project) => {
    await base44.entities.Project.update(project.id, { status: "submetido" });
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    toast({ title: "Projeto submetido para avaliação!" });
  };

  const addMember = () => {
    setForm({ ...form, members: [...form.members, { name: "", ra: "" }] });
  };

  const updateMember = (index, field, value) => {
    const updated = [...form.members];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, members: updated });
  };

  const removeMember = (index) => {
    setForm({ ...form, members: form.members.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Meus Projetos</h1>
          <p className="text-muted-foreground mt-1">Cadastre e gerencie seus projetos integradores.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditing(null); setForm(emptyProject); setKeywordsText(""); }}
              className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editing ? "Editar Projeto" : "Novo Projeto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-xs uppercase font-bold tracking-wider">Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-none mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase font-bold tracking-wider">Categoria *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-none mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase font-bold tracking-wider">Nome da Equipe *</Label>
                  <Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} className="rounded-none mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase font-bold tracking-wider">Orientador</Label>
                  <Input value={form.advisor} onChange={(e) => setForm({ ...form, advisor: e.target.value })} className="rounded-none mt-1" />
                </div>
                <div>
                  <Label className="text-xs uppercase font-bold tracking-wider">Sala/Local</Label>
                  <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="rounded-none mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase font-bold tracking-wider">Resumo</Label>
                <Textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} className="rounded-none mt-1 h-20" />
              </div>
              <div>
                <Label className="text-xs uppercase font-bold tracking-wider">Descrição Completa</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none mt-1 h-32" />
              </div>
              <div>
                <Label className="text-xs uppercase font-bold tracking-wider">Palavras-chave (separadas por vírgula)</Label>
                <Input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} className="rounded-none mt-1" placeholder="ex: IoT, automação, indústria 4.0" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs uppercase font-bold tracking-wider">Membros da Equipe</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addMember} className="text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                {form.members.map((member, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Nome"
                      value={member.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      className="rounded-none"
                    />
                    <Input
                      placeholder="RA"
                      value={member.ra}
                      onChange={(e) => updateMember(i, "ra", e.target.value)}
                      className="rounded-none w-32"
                    />
                    {form.members.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={closeDialog} className="rounded-none text-xs uppercase font-bold">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.title || !form.team_name}
                  className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold"
                >
                  {editing ? "Salvar" : "Criar Projeto"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum projeto.</p>
          <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
            <Plus className="w-4 h-4" /> Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{project.title}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                      project.status === "aprovado"
                        ? "bg-green-100 text-green-700"
                        : project.status === "submetido"
                        ? "bg-blue-100 text-blue-700"
                        : project.status === "reprovado"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {categoryLabels[project.category]} • {project.team_name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbnailUpload(e, project.id)} />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold uppercase hover:border-primary transition-colors">
                    <Upload className="w-3 h-3" /> Imagem
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleBannerUpload(e, project.id)} />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold uppercase hover:border-primary transition-colors">
                    <Upload className="w-3 h-3" /> Banner
                  </span>
                </label>
                <Button variant="ghost" size="sm" onClick={() => openEdit(project)} className="gap-1">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {project.status === "rascunho" && (
                  <Button
                    size="sm"
                    onClick={() => submitProject(project)}
                    className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Submeter
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { if (confirm("Excluir este projeto?")) deleteMutation.mutate(project.id); }}
                  className="text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}