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
import { Plus, Upload, Pencil, Trash2, Send, ChevronRight, FolderOpen } from "lucide-react";
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

const statusConfig = {
  aprovado: { label: "APROVADO", cls: "bg-green-100 text-green-700" },
  submetido: { label: "EM AVALIAÇÃO", cls: "bg-blue-100 text-blue-700" },
  reprovado: { label: "REPROVADO", cls: "bg-red-100 text-red-700" },
  rascunho: { label: "RASCUNHO", cls: "bg-gray-100 text-gray-600" },
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

const steps = [
  { num: "01", label: "Detalhes" },
  { num: "02", label: "Equipe" },
  { num: "03", label: "Revisão" },
];

export default function MyProjects() {
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
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
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Projeto atualizado!" });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Projeto excluído." });
    },
  });

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyProject);
    setKeywordsText("");
    setFormStep(0);
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
    setFormStep(0);
    setShowForm(true);
  };

  const handleSave = () => {
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
    toast({ title: "Banner enviado!" });
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

  const addMember = () => setForm({ ...form, members: [...form.members, { name: "", ra: "" }] });
  const updateMember = (i, field, value) => {
    const updated = [...form.members];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, members: updated });
  };
  const removeMember = (i) => setForm({ ...form, members: form.members.filter((_, idx) => idx !== i) });

  if (showForm) {
    return (
      <div>
        {/* Form Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
            <span className="cursor-pointer hover:text-primary" onClick={closeForm}>Meus Projetos</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">{editing ? "Editar Projeto" : "Novo Projeto"}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">
            {editing ? "Editar Projeto" : "Submissão de Projeto"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Registre sua iniciativa inovadora. O processo de submissão é dividido em etapas para garantir a integridade técnica e acadêmica.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Step Navigator */}
          <div className="col-span-12 lg:col-span-3">
            <div className="flex flex-col gap-1 border-l border-border">
              {steps.map((step, i) => (
                <div
                  key={i}
                  onClick={() => i <= formStep && setFormStep(i)}
                  className={`pl-6 py-4 -ml-px cursor-pointer transition-all ${
                    formStep === i
                      ? "border-l-4 border-primary bg-white"
                      : i < formStep
                      ? "border-l-4 border-green-500"
                      : "border-l-4 border-transparent opacity-40"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    PASSO {step.num}
                  </span>
                  <h4 className={`text-lg font-bold ${formStep === i ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Form Panel */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white border border-border p-10">
              {/* Step 0: Details */}
              {formStep === 0 && (
                <>
                  <div className="flex items-center justify-between mb-10 border-b border-muted pb-6">
                    <h2 className="text-2xl font-bold font-heading">Especificações do Projeto</h2>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Título do Projeto *</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Sistema de Gestão Energética Sustentável"
                        className="rounded-none p-4 h-auto"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Categoria *</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                          <SelectTrigger className="rounded-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Sala/Local</Label>
                        <Input
                          value={form.room}
                          onChange={(e) => setForm({ ...form, room: e.target.value })}
                          placeholder="Ex: Lab 04, Sala 102"
                          className="rounded-none p-4 h-auto"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Resumo Executivo</Label>
                      <div className="relative border-l-4 border-primary pl-6 bg-muted/30 py-2">
                        <Textarea
                          value={form.abstract}
                          onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                          placeholder="Descreva o problema, a solução proposta e os impactos esperados..."
                          className="border-none bg-transparent focus:ring-0 resize-none h-28"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Descrição Completa</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="rounded-none h-32"
                        placeholder="Detalhamento técnico do projeto..."
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">
                        Palavras-chave (separadas por vírgula)
                      </Label>
                      <Input
                        value={keywordsText}
                        onChange={(e) => setKeywordsText(e.target.value)}
                        className="rounded-none"
                        placeholder="ex: IoT, automação, indústria 4.0"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Team */}
              {formStep === 1 && (
                <>
                  <div className="flex items-center justify-between mb-10 border-b border-muted pb-6">
                    <h2 className="text-2xl font-bold font-heading">Dados da Equipe</h2>
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Nome da Equipe *</Label>
                        <Input
                          value={form.team_name}
                          onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                          className="rounded-none p-4 h-auto"
                          placeholder="Ex: Grupo Alpha-4"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-3">Orientador</Label>
                        <Input
                          value={form.advisor}
                          onChange={(e) => setForm({ ...form, advisor: e.target.value })}
                          className="rounded-none p-4 h-auto"
                          placeholder="Nome do professor orientador"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest">Membros da Equipe</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addMember} className="text-xs font-bold gap-1">
                          <Plus className="w-3 h-3" /> Adicionar Membro
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {form.members.map((member, i) => (
                          <div key={i} className="flex gap-3 items-center p-4 border border-border bg-muted/20">
                            <span className="text-[10px] font-bold text-muted-foreground w-5">{i + 1}</span>
                            <Input
                              placeholder="Nome completo"
                              value={member.name}
                              onChange={(e) => updateMember(i, "name", e.target.value)}
                              className="rounded-none flex-1"
                            />
                            <Input
                              placeholder="RA"
                              value={member.ra}
                              onChange={(e) => updateMember(i, "ra", e.target.value)}
                              className="rounded-none w-32"
                            />
                            {form.members.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Review */}
              {formStep === 2 && (
                <>
                  <div className="flex items-center justify-between mb-10 border-b border-muted pb-6">
                    <h2 className="text-2xl font-bold font-heading">Revisão Final</h2>
                  </div>
                  <div className="space-y-6">
                    {[
                      { label: "Título", value: form.title },
                      { label: "Categoria", value: categoryLabels[form.category] },
                      { label: "Equipe", value: form.team_name },
                      { label: "Orientador", value: form.advisor || "—" },
                      { label: "Local", value: form.room || "—" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-3 border-b border-muted">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-sm text-right max-w-sm">{item.value}</span>
                      </div>
                    ))}
                    {form.abstract && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Resumo</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{form.abstract}</p>
                      </div>
                    )}
                    {form.members.filter(m => m.name).length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Membros</span>
                        <div className="space-y-2">
                          {form.members.filter(m => m.name).map((m, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                              <span className="font-bold">{m.name}</span>
                              {m.ra && <span className="text-muted-foreground">RA: {m.ra}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-muted/40 border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground">
                        Após salvar, seu projeto ficará como <strong>Rascunho</strong>. Use o botão <strong>Submeter</strong> quando estiver pronto para avaliação.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-10 border-t border-muted mt-8">
                <Button
                  variant="outline"
                  onClick={closeForm}
                  className="rounded-none text-xs uppercase font-bold tracking-wider"
                >
                  Cancelar
                </Button>
                <div className="flex gap-4">
                  {formStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setFormStep(formStep - 1)}
                      className="rounded-none text-xs uppercase font-bold tracking-wider"
                    >
                      Anterior
                    </Button>
                  )}
                  {formStep < 2 ? (
                    <Button
                      onClick={() => setFormStep(formStep + 1)}
                      disabled={formStep === 0 && !form.title}
                      className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2"
                    >
                      Próximo: {steps[formStep + 1]?.label} <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={!form.title || !form.team_name}
                      className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider"
                    >
                      {editing ? "Salvar Alterações" : "Criar Projeto"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/40 p-6 border-l-4 border-primary border border-border">
                <h5 className="font-bold text-sm uppercase tracking-widest mb-2">Orientações de Formatação</h5>
                <p className="text-sm text-muted-foreground">
                  Todos os diagramas devem seguir as normas ABNT NBR 14724. Projetos sem bibliografia serão desclassificados automaticamente.
                </p>
              </div>
              <div className="bg-foreground p-6 text-background">
                <h5 className="font-bold text-sm uppercase tracking-widest mb-2 text-white/90">Prazo de Envio</h5>
                <p className="text-sm text-white/60">
                  O portal de submissão está <span className="text-primary font-bold">ativo</span>. Submeta seu projeto antes do encerramento da mostra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Meus Projetos</h1>
          <p className="text-muted-foreground mt-1">Painel de Submissão · Ciclo de Inovação 2026</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => { setEditing(null); setForm(emptyProject); setKeywordsText(""); setFormStep(0); setShowForm(true); }}
            className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Projeto
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum projeto.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-border">
          <div className="bg-muted/40 border-b border-border px-6 py-4">
            <span className="text-[10px] font-bold uppercase tracking-widest">Lista de Projetos Cadastrados ({projects.length})</span>
          </div>
          <div className="divide-y divide-border">
            {projects.map((project) => {
              const st = statusConfig[project.status] || statusConfig.rascunho;
              return (
                <div key={project.id} className="p-6 flex items-center hover:bg-muted/20 transition-colors gap-4">
                  <div className="w-14 h-14 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-base truncate">{project.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {categoryLabels[project.category]} · {project.team_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbnailUpload(e, project.id)} />
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-[10px] font-bold uppercase hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-3 h-3" /> Imagem
                      </span>
                    </label>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleBannerUpload(e, project.id)} />
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-[10px] font-bold uppercase hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-3 h-3" /> Banner
                      </span>
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>
                      <Pencil className="w-4 h-4" />
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
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}