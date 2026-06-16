import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Pencil, Trash2, Send, ChevronRight, FolderOpen, Mic, Image, Link, Github, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProjectService, GroupService, UserService, EvaluationService } from "@/services";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate } from "react-router-dom";

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

const ProjectGradesDetail = ({ project }) => {
  const { data: averageData, isLoading } = useQuery({
    queryKey: ["project-average", project.id],
    queryFn: () => EvaluationService.getProjectAverage(project.id),
    enabled: project.status !== "rascunho"
  });

  if (project.status === "rascunho") return null;
  if (isLoading || !averageData) return null;

  if (averageData.totalEvaluations === 0) {
    return (
      <div className="mt-4 p-4 border border-dashed border-border bg-muted/10 w-full">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest text-center">Nenhuma avaliação recebida ainda.</p>
      </div>
    );
  }

  const teacherEvals = (project.evaluations || []).filter(e => e.evaluation_type === "professor");

  const calcTeacherAverage = (scores) => {
    if (!scores || scores.length === 0) return 0;
    return (scores.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / scores.length).toFixed(1);
  };

  return (
    <div className="mt-4 p-4 border border-border bg-muted/20 w-full">
      <div className="mb-4 bg-white p-3 border border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Composição da Nota Final</p>
        {project.eval_option === 1 ? (
          <p className="text-xs">
            <strong className="text-primary">Opção 1:</strong> Nota do Trabalho (Peso 80%) + Média de Alunos (Peso 20%).<br/>
            Nota Recebida no Trabalho: <strong>{project.advisor_raw_score || "—"}</strong>
          </p>
        ) : (
          <p className="text-xs">
            <strong className="text-primary">Opção 2:</strong> 
            Orientador (Peso {project.weight_advisor || 40}), 
            Professores (Peso {project.weight_teachers || 40}), 
            Alunos (Peso {project.weight_students || 20}).
          </p>
        )}
      </div>

      {teacherEvals.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Avaliações dos Docentes</p>
          <div className="space-y-2">
            {teacherEvals.map(ev => (
              <div key={ev.id} className="flex justify-between items-center bg-white border border-border px-3 py-2 text-xs">
                <span className="font-bold">{ev.evaluator_name}</span>
                <span className="font-bold bg-primary/10 text-primary px-2 py-0.5">Nota: {calcTeacherAverage(ev.criteria_scores)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-3 border-b border-border pb-2 flex-wrap mt-4">
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Avaliações de Alunos: <span className="text-primary">{averageData.studentEvaluationsCount}</span>
        </div>
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Média Alunos: <span className="text-primary">{averageData.studentAverage}</span>
        </div>
      </div>
      
      {averageData.studentCriteriaAverages && Object.keys(averageData.studentCriteriaAverages).length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Desempenho por Critério (Avaliação de Alunos)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(averageData.studentCriteriaAverages).map(([key, value]) => {
              const labels = {
                innovation: "Inovação",
                technical: "Técnico",
                presentation: "Apresentação",
                relevance: "Relevância",
                organization: "Organização",
                clarity: "Clareza",
                design: "Design",
                objectivity: "Objetividade",
                impact: "Impacto"
              };
              return (
                <div key={key} className="flex justify-between items-center bg-white border border-border px-2 py-1.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">{labels[key] || key}</span>
                  <span className="text-xs font-bold">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function MyProjects() {
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [keywordsText, setKeywordsText] = useState("");
  const [uploading, setUploading] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { categories = [], getCategoryLabel } = useCategories();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => ProjectService.listMine(),
  });

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => UserService.me() });

  const isStudent = user?.role?.toUpperCase() === "STUDENT";
  const isTeacherOrAdmin = user?.role?.toUpperCase() === "TEACHER" || user?.role?.toUpperCase() === "ADMIN";

  const getProjectGradesText = (project) => {
    if (project.grade_work !== undefined && project.grade_award !== undefined) {
      if (project.eval_option === 1) {
        return `Nota (Trabalho): ${project.grade_work} | Nota (Premiação): ${project.grade_award}`;
      }
      return `Média: ${project.grade_work}`;
    }
    return "—";
  };

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: () => UserService.listTeachers(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => UserService.listStudents(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => ProjectService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-projects"] }); toast({ title: "Projeto criado!" }); closeForm(); },
    onError: (err) => {
      toast({
        title: "Erro ao criar projeto",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ProjectService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-projects"] }); toast({ title: "Projeto atualizado!" }); closeForm(); },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
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
    const data = {
      ...form,
      keywords: keywordsText.split(",").map(k => k.trim()).filter(Boolean),
      members: form.members.filter(m => m.email).map(m => ({ email: m.email, name: m.name || "" }))
    };
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

  const addMember = () => setForm(prev => ({ ...prev, members: [...prev.members, { name: "", email: "" }] }));
  const updateMember = (i, field, value) => {
    setForm(prev => {
      const m = [...prev.members];
      m[i] = { ...m[i], [field]: value };
      return { ...prev, members: m };
    });
  };
  const updateMemberFields = (i, fieldsObj) => {
    setForm(prev => {
      const m = [...prev.members];
      m[i] = { ...m[i], ...fieldsObj };
      return { ...prev, members: m };
    });
  };
  const removeMember = (i) => setForm(prev => ({ ...prev, members: prev.members.filter((_, idx) => idx !== i) }));

  const UploadBtn = ({ label, field, accept, projectId }) => (
    <label className="cursor-pointer block w-full sm:w-auto">
      <input type="file" accept={accept} className="hidden" onChange={(e) => handleFileUpload(e, projectId, field)} />
      <span className="flex sm:inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 border border-border text-[10px] font-bold uppercase hover:border-primary transition-colors cursor-pointer w-full sm:w-auto">
        <Upload className="w-3.5 h-3.5 sm:w-3 sm:h-3" /> {uploading[field] ? "Enviando..." : label}
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
                        <SelectContent>
                          {Array.isArray(categories) && categories.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Orientador *</Label>
                        <Select
                          value={form.advisor || undefined}
                          onValueChange={(val) => setForm({ ...form, advisor: val })}
                        >
                          <SelectTrigger className="rounded-none bg-white">
                            <SelectValue placeholder="Selecione um orientador..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(teachers) && teachers
                              .filter((t) => t.id && (t.full_name || t.user_email))
                              .map((t) => (
                                <SelectItem key={t.id} value={t.full_name || t.user_email}>
                                  {t.full_name || t.user_email} ({t.user_email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest">Membros da Equipe</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addMember} className="text-xs font-bold gap-1"><Plus className="w-3 h-3" /> Adicionar</Button>
                      </div>
                      <div className="space-y-3">
                        {Array.isArray(form.members) && form.members.map((member, i) => (
                          <div key={i} className="flex gap-3 items-center p-4 border border-border bg-muted/20">
                            <span className="text-[10px] font-bold text-muted-foreground w-5">{i + 1}</span>
                            <div className="flex-1 space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest block">Selecionar Aluno *</Label>
                              <Select
                                value={member.email || undefined}
                                onValueChange={(val) => {
                                  const selected = Array.isArray(students) && students.find((s) => s.user_email === val);
                                  if (selected) {
                                    updateMemberFields(i, {
                                      email: selected.user_email,
                                      name: selected.full_name || selected.user_email
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="rounded-none bg-white w-full text-xs h-9">
                                  <SelectValue placeholder="Selecione um aluno..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(students) && students
                                    .filter((s) => s.id && s.user_email)
                                    .map((s) => (
                                      <SelectItem key={s.id} value={s.user_email}>
                                        {s.full_name || s.user_email} ({s.user_email})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {form.members.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} className="text-destructive self-end mb-1"><Trash2 className="w-4 h-4" /></Button>
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
                      { label: "Categoria", value: getCategoryLabel(form.category) },
                      { label: "Equipe", value: form.team_name },
                      { label: "Orientador", value: form.advisor || "—" },
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
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Projetos</h1>
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
                {/* Main Card Content: Stack vertically on mobile, row on desktop */}
                <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Title & Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base">
                          {project.project_number && `#${project.project_number} - `}
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase ${st.cls}`}>{st.label}</span>
                          {project.presentation_type === "oral" && (
                            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Mic className="w-3 h-3" /> ORAL {project.oral_approved ? "✓ APROVADO" : "- PENDENTE"}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground">{getCategoryLabel(project.category)} · {project.team_name}</p>

                      {/* Members */}
                      {project.members && project.members.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-primary" /> Integrantes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {project.members.map((member, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 border border-border text-[9px] sm:text-[10px] font-bold bg-muted/40 text-muted-foreground">
                                {member.name || member.email}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grades for Teachers/Admins */}
                      {isTeacherOrAdmin && (
                        <div className="mt-2.5 flex items-center gap-4 flex-wrap bg-muted/50 p-2 border border-border w-full sm:w-fit">
                          <span className="text-xs font-bold text-foreground">
                            {getProjectGradesText(project)}
                          </span>
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!project.show_grade_publicly}
                              onChange={(e) => {
                                updateMutation.mutate({
                                  id: project.id,
                                  data: {
                                    ...project,
                                    show_grade_publicly: e.target.checked
                                  }
                                });
                              }}
                              className="rounded-none border-border"
                            />
                            Publicar Nota no Site Público
                          </label>
                        </div>
                      )}

                      {/* Links Indicator */}
                      <div className="flex gap-3 mt-3 flex-wrap border-t border-dashed border-border/60 pt-2.5">
                        {project.banner_url ? (
                          <a href={project.banner_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ Banner
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-red-500">
                            ✗ Banner (obrigatório)
                          </span>
                        )}
                        {project.article_url && (
                          <a href={project.article_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ Artigo
                          </a>
                        )}
                        {project.slides_url && (
                          <a href={project.slides_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ Slides
                          </a>
                        )}
                        {project.thumbnail_url && (
                          <a href={project.thumbnail_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ Imagem de Capa
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ GitHub
                          </a>
                        )}
                        {project.pitch_youtube_url && (
                          <a href={project.pitch_youtube_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase text-green-600 hover:underline">
                            ✓ Pitch
                          </a>
                        )}
                      </div>

                      {/* Grades Details */}
                      {isStudent && <ProjectGradesDetail project={project} />}
                    </div>
                  </div>

                  {/* Right Side: Action Buttons (Bottom row on mobile, top right on desktop) */}
                  {(isTeacherOrAdmin || (isStudent && project.status === "rascunho")) && (
                    <div className="flex flex-wrap items-center gap-2 lg:self-start w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
                      {isTeacherOrAdmin && project.status !== "rascunho" && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/dashboard/avaliacoes?projectId=${project.id}`)}
                          className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold flex-1 sm:flex-initial h-10 lg:h-9"
                        >
                          Avaliar
                        </Button>
                      )}
                      {(!isStudent || project.status === "rascunho") && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(project)} className="w-10 h-10 lg:w-9 lg:h-9 border border-border lg:border-none rounded-none shrink-0 flex items-center justify-center"><Pencil className="w-4 h-4" /></Button>
                      )}
                      {project.status === "rascunho" && (
                        <Button size="sm" onClick={() => submitProject(project)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-1 flex-1 sm:flex-initial h-10 lg:h-9">
                          <Send className="w-3.5 h-3.5" /> Submeter
                        </Button>
                      )}
                      {(!isStudent || project.status === "rascunho") && (
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir projeto?")) deleteMutation.mutate(project.id); }} className="text-destructive w-10 h-10 lg:w-9 lg:h-9 border border-border lg:border-none rounded-none shrink-0 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Section - Allow submitted projects to only upload/change Imagem de Capa */}
                {(() => {
                  const showAllUploads = !isStudent || project.status === "rascunho";
                  return (
                    <div className="px-4 sm:px-6 pb-5 border-t border-muted pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">Upload:</span>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                        {showAllUploads && (
                          <>
                            <UploadBtn label="Banner*" field="banner_url" accept="image/*,.pdf" projectId={project.id} />
                            <UploadBtn label="Artigo (PDF)" field="article_url" accept=".pdf" projectId={project.id} />
                          </>
                        )}
                        <UploadBtn label="Imagem de Capa" field="thumbnail_url" accept="image/*" projectId={project.id} />
                        {showAllUploads && project.presentation_type === "oral" && (
                          <UploadBtn label="Slides" field="slides_url" accept=".pdf,.ppt,.pptx" projectId={project.id} />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}