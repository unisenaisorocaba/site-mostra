import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Pencil, Trash2, Send, ChevronRight, FolderOpen, Mic, Image, Link, Github } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProjectService, CATEGORY_LABELS } from "@/services";

const statusConfig = {
  aprovado: { label: "APROVADO", cls: "bg-green-100 text-green-700" },
  submetido: { label: "EM AVALIAÇÃO", cls: "bg-blue-100 text-blue-700" },
  reprovado: { label: "REPROVADO", cls: "bg-red-100 text-red-700" },
  rascunho: { label: "RASCUNHO", cls: "bg-gray-100 text-gray-600" },
};

const emptyProject = {
  title: "", description: "", abstract: "", category: "software",
  team_name: "", advisor: "", keywords: [],
  members: [{ name: "", email: "" }],
  presentation_type: "banner",
  pitch_youtube_url: "", github_url: "",
};

const steps = [
  { num: "01", label: "Detalhes" },
  { num: "02", label: "Equipe" },
  { num: "03", label: "Materiais" },
  { num: "04", label: "Revisão" },
];

export default function MyProjects() {
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [keywordsText, setKeywordsText] = useState("");
  const [uploading, setUploading] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => ProjectService.listMine(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => ProjectService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-projects"] }); toast({ title: "Projeto criado!" }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ProjectService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-projects"] }); toast({ title: "Projeto atualizado!" }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ProjectService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-projects"] }); toast({ title: "Projeto excluído." }); },
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyProject); setKeywordsText(""); setFormStep(0); };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || "", description: project.description || "", abstract: project.abstract || "",
      category: project.category || "software", team_name: project.team_name || "", advisor: project.advisor || "",
      keywords: project.keywords || [], members: project.members?.length ? project.members : [{ name: "", email: "" }],
      presentation_type: project.presentation_type || "banner",
      pitch_youtube_url: project.pitch_youtube_url || "", github_url: project.github_url || "",
    });
    setKeywordsText((project.keywords || []).join(", "));
    setFormStep(0); setShowForm(true);
  };

  const handleSave = () => {
    const data = { ...form, keywords: keywordsText.split(",").map(k => k.trim()).filter(Boolean), members: form.members.filter(m => m.name) };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleFileUpload = async (e, projectId, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(u => ({ ...u, [field]: true }));
    await ProjectService.uploadFile(projectId, field, file);
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    toast({ title: "Arquivo enviado!" });
    setUploading(u => ({ ...u, [field]: false }));
    e.target.value = "";
  };

  const submitProject = async (project) => {
    if (!project.banner_url) { toast({ title: "Banner obrigatório antes de submeter!", variant: "destructive" }); return; }
    await ProjectService.submit(project.id);
    queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    toast({ title: "Projeto submetido para avaliação!" });
  };

  const addMember = () => setForm({ ...form, members: [...form.members, { name: "", email: "" }] });
  const updateMember = (i, field, value) => { const m = [...form.members]; m[i] = { ...m[i], [field]: value }; setForm({ ...form, members: m }); };
  const removeMember = (i) => setForm({ ...form, members: form.members.filter((_, idx) => idx !== i) });

  const UploadBtn = ({ label, field, accept, projectId }) => (
    <label className="cursor-pointer">
      <input type="file" accept={accept} className="hidden" onChange={(e) => handleFileUpload(e, projectId, field)} />
      <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-[10px] font-bold uppercase hover:border-primary transition-colors cursor-pointer">
        <Upload className="w-3 h-3" /> {uploading[field] ? "Enviando..." : label}
      </span>
    </label>
  );

  if (showForm) {
    return (
      <div>
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
            <span className="cursor-pointer hover:text-primary" onClick={closeForm}>Meus Projetos</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">{editing ? "Editar Projeto" : "Novo Projeto"}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">{editing ? "Editar Projeto" : "Submissão de Projeto"}</h1>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <div className="flex flex-col gap-1 border-l border-border">
              {steps.map((step, i) => (
                <div key={i} onClick={() => i <= formStep && setFormStep(i)}
                  className={`pl-6 py-4 -ml-px cursor-pointer transition-all ${formStep === i ? "border-l-4 border-primary bg-white" : i < formStep ? "border-l-4 border-green-500" : "border-l-4 border-transparent opacity-40"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">PASSO {step.num}</span>
                  <h4 className={`text-lg font-bold ${formStep === i ? "text-primary" : "text-muted-foreground"}`}>{step.label}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white border border-border p-10">
              {formStep === 0 && (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-8 pb-4 border-b border-muted">Especificações do Projeto</h2>
                  <div className="space-y-7">
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Título do Projeto *</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Sistema de Gestão Energética Sustentável" className="rounded-none" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Categoria *</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Tipo de Apresentação</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[{ val: "banner", label: "Somente Banner", desc: "Apresentação expositiva com banner impresso" }, { val: "oral", label: "Oral + Banner", desc: "Apresentação oral com slides (sujeito a aprovação)" }].map((opt) => (
                          <div key={opt.val} onClick={() => setForm({ ...form, presentation_type: opt.val })}
                            className={`p-4 border-2 cursor-pointer transition-all ${form.presentation_type === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {opt.val === "oral" ? <Mic className="w-4 h-4 text-primary" /> : <Image className="w-4 h-4 text-primary" />}
                              <span className="font-bold text-sm">{opt.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Resumo Executivo</Label>
                      <Textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} placeholder="Descreva o problema, a solução proposta e os impactos esperados..." className="rounded-none h-28" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição Completa</Label>
                      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none h-32" placeholder="Detalhamento técnico do projeto..." />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Palavras-chave (separadas por vírgula)</Label>
                      <Input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} className="rounded-none" placeholder="ex: IoT, automação, indústria 4.0" />
                    </div>
                  </div>
                </>
              )}

              {formStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-8 pb-4 border-b border-muted">Dados da Equipe</h2>
                  <div className="space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome da Equipe *</Label>
                        <Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} className="rounded-none" placeholder="Ex: Grupo Alpha-4" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Orientador</Label>
                        <Input value={form.advisor} onChange={(e) => setForm({ ...form, advisor: e.target.value })} className="rounded-none" placeholder="Nome do professor orientador" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest">Membros da Equipe</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addMember} className="text-xs font-bold gap-1"><Plus className="w-3 h-3" /> Adicionar</Button>
                      </div>
                      <div className="space-y-3">
                        {form.members.map((member, i) => (
                          <div key={i} className="flex gap-3 items-center p-4 border border-border bg-muted/20">
                            <span className="text-[10px] font-bold text-muted-foreground w-5">{i + 1}</span>
                            <Input placeholder="Nome completo" value={member.name} onChange={(e) => updateMember(i, "name", e.target.value)} className="rounded-none flex-1" />
                            <Input placeholder="E-mail" value={member.email} onChange={(e) => updateMember(i, "email", e.target.value)} className="rounded-none flex-1" type="email" />
                            {form.members.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formStep === 2 && (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-8 pb-4 border-b border-muted">Links e Materiais</h2>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Github className="w-3.5 h-3.5" /> Link do Repositório GitHub
                      </Label>
                      <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className="rounded-none" placeholder="https://github.com/usuario/repositorio" type="url" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Link className="w-3.5 h-3.5" /> Link do Pitch no YouTube
                      </Label>
                      <Input value={form.pitch_youtube_url} onChange={(e) => setForm({ ...form, pitch_youtube_url: e.target.value })} className="rounded-none" placeholder="https://youtube.com/watch?v=..." type="url" />
                    </div>
                  </div>
                </>
              )}

              {formStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold font-heading mb-8 pb-4 border-b border-muted">Revisão Final</h2>
                  <div className="space-y-4">
                    {[
                      { label: "Título", value: form.title },
                      { label: "Categoria", value: CATEGORY_LABELS[form.category] },
                      { label: "Equipe", value: form.team_name },
                      { label: "Orientador", value: form.advisor || "—" },
                      { label: "Apresentação", value: form.presentation_type === "oral" ? "Oral + Banner" : "Somente Banner" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-3 border-b border-muted">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-sm text-right max-w-xs truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-muted mt-8">
                <Button variant="outline" onClick={closeForm} className="rounded-none text-xs uppercase font-bold tracking-wider">Cancelar</Button>
                <div className="flex gap-4">
                  {formStep > 0 && <Button variant="outline" onClick={() => setFormStep(formStep - 1)} className="rounded-none text-xs uppercase font-bold">Anterior</Button>}
                  {formStep < 3 ? (
                    <Button onClick={() => setFormStep(formStep + 1)} disabled={formStep === 0 && !form.title} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
                      Próximo: {steps[formStep + 1]?.label} <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSave} disabled={!form.title || !form.team_name} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
                      {editing ? "Salvar Alterações" : "Criar Projeto"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Meus Projetos</h1>
          <p className="text-muted-foreground mt-1">Painel de Submissão · Ciclo de Inovação 2026</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyProject); setKeywordsText(""); setFormStep(0); setShowForm(true); }} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum projeto.</p>
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2"><Plus className="w-4 h-4" /> Criar Primeiro Projeto</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const st = statusConfig[project.status] || statusConfig.rascunho;
            return (
              <div key={project.id} className="bg-white border border-border">
                <div className="p-6 flex items-start gap-4 flex-wrap">
                  <div className="w-14 h-14 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-base">{project.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${st.cls}`}>{st.label}</span>
                      {project.presentation_type === "oral" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Mic className="w-3 h-3" /> ORAL {project.oral_approved ? "✓ APROVADO" : "- PENDENTE"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[project.category]} · {project.team_name}</p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase ${project.banner_url ? "text-green-600" : "text-red-500"}`}>
                        {project.banner_url ? "✓ Banner" : "✗ Banner (obrigatório)"}
                      </span>
                      {project.article_url && <span className="text-[10px] font-bold text-green-600">✓ Artigo</span>}
                      {project.slides_url && <span className="text-[10px] font-bold text-green-600">✓ Slides</span>}
                      {project.github_url && <span className="text-[10px] font-bold text-green-600">✓ GitHub</span>}
                      {project.pitch_youtube_url && <span className="text-[10px] font-bold text-green-600">✓ Pitch</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(project)}><Pencil className="w-4 h-4" /></Button>
                    {project.status === "rascunho" && (
                      <Button size="sm" onClick={() => submitProject(project)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-1">
                        <Send className="w-3.5 h-3.5" /> Submeter
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir projeto?")) deleteMutation.mutate(project.id); }} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="px-6 pb-5 flex gap-3 flex-wrap border-t border-muted pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground self-center mr-2">Upload:</span>
                  <UploadBtn label="Banner*" field="banner_url" accept="image/*,.pdf" projectId={project.id} />
                  <UploadBtn label="Artigo (PDF)" field="article_url" accept=".pdf" projectId={project.id} />
                  <UploadBtn label="Thumbnail" field="thumbnail_url" accept="image/*" projectId={project.id} />
                  {project.presentation_type === "oral" && (
                    <UploadBtn label="Slides" field="slides_url" accept=".pdf,.ppt,.pptx" projectId={project.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}