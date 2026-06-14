import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ListChecks, ChevronDown, ChevronRight, FolderOpen, Settings2, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CriteriaService, UserService, ProjectService } from "@/services";

function BulkSettingsCard({ onApplyBulk }) {
  const [evalOption, setEvalOption] = useState(2);
  const [weightAdvisor, setWeightAdvisor] = useState(40);
  const [weightTeachers, setWeightTeachers] = useState(40);
  const [weightStudents, setWeightStudents] = useState(20);

  const totalWeight = Number(weightAdvisor) + Number(weightTeachers) + Number(weightStudents);
  const isWeightValid = totalWeight === 100;

  const handleApply = () => {
    if (evalOption === 2 && !isWeightValid) {
      alert("A soma dos pesos deve ser exatamente 100%!");
      return;
    }
    if (confirm("Deseja aplicar esta configuração a TODOS os seus projetos orientados? (Nota: para a Opção 1, a nota de cada projeto continuará sendo editada separadamente).")) {
      onApplyBulk({
        eval_option: evalOption,
        weight_advisor: Number(weightAdvisor),
        weight_teachers: Number(weightTeachers),
        weight_students: Number(weightStudents),
      });
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 p-6 relative mb-6">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Configuração em Lote (Todos os Orientados)</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Defina a regra geral e aplique a todos os seus projetos de uma única vez para economizar tempo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-4">
          <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2 text-primary">Opção de Avaliação</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="radio" name="bulk_opt" checked={evalOption === 1} onChange={() => setEvalOption(1)} className="accent-primary" />
              Opção 1: Digitar nota diretamente
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="radio" name="bulk_opt" checked={evalOption === 2} onChange={() => setEvalOption(2)} className="accent-primary" />
              Opção 2: Pesos personalizados
            </label>
          </div>
        </div>

        <div className="lg:col-span-8">
          {evalOption === 1 ? (
            <div className="text-xs text-muted-foreground leading-relaxed bg-white border border-border p-4 h-full flex flex-col justify-center">
              <p>
                ℹ️ <strong>Regra da Opção 1:</strong> Os projetos serão avaliados digitando a nota diretamente.
                A nota de premiação terá obrigatoriamente <strong>peso 20% da média das avaliações dos alunos</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-border p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Peso Orientador (%)</Label>
                  <Input type="number" min={0} max={100} value={weightAdvisor} onChange={(e) => setWeightAdvisor(Number(e.target.value))} className="rounded-none h-8 text-xs bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Outros Prof. (%)</Label>
                  <Input type="number" min={0} max={100} value={weightTeachers} onChange={(e) => setWeightTeachers(Number(e.target.value))} className="rounded-none h-8 text-xs bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Alunos (%)</Label>
                  <Input type="number" min={0} max={100} value={weightStudents} onChange={(e) => setWeightStudents(Number(e.target.value))} className="rounded-none h-8 text-xs bg-white" />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold flex-wrap gap-2">
                <span>Total: <span className={isWeightValid ? "text-green-600" : "text-destructive"}>{totalWeight}%</span></span>
                {!isWeightValid && <span className="text-destructive font-normal">⚠️ A soma deve ser exatamente 100%</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-primary/10 flex justify-end">
        <Button onClick={handleApply} disabled={evalOption === 2 && !isWeightValid} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold px-6">
          Aplicar a Todos os Projetos
        </Button>
      </div>
    </div>
  );
}

function ProjectSettingsCard({ project, onSave }) {
  const [evalOption, setEvalOption] = useState(project.eval_option ?? 2);
  const [advisorRawScore, setAdvisorRawScore] = useState(project.advisor_raw_score !== null ? String(project.advisor_raw_score) : "");
  const [weightAdvisor, setWeightAdvisor] = useState(project.weight_advisor ?? 40);
  const [weightTeachers, setWeightTeachers] = useState(project.weight_teachers ?? 40);
  const [weightStudents, setWeightStudents] = useState(project.weight_students ?? 20);

  const totalWeight = Number(weightAdvisor) + Number(weightTeachers) + Number(weightStudents);
  const isWeightValid = totalWeight === 100;

  const handleSaveClick = () => {
    if (evalOption === 1) {
      const scoreVal = advisorRawScore === "" ? null : Number(advisorRawScore);
      if (scoreVal !== null && (scoreVal < 0 || scoreVal > 10)) {
        alert("A nota deve ser entre 0 e 10");
        return;
      }
      onSave(project.id, {
        eval_option: 1,
        advisor_raw_score: scoreVal,
        weight_advisor: Number(weightAdvisor),
        weight_teachers: Number(weightTeachers),
        weight_students: Number(weightStudents),
      });
    } else {
      if (!isWeightValid) {
        alert("A soma dos pesos deve ser exatamente 100%");
        return;
      }
      onSave(project.id, {
        eval_option: 2,
        advisor_raw_score: null,
        weight_advisor: Number(weightAdvisor),
        weight_teachers: Number(weightTeachers),
        weight_students: Number(weightStudents),
      });
    }
  };

  return (
    <div className="bg-white border border-border p-6 relative text-left">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      <div className="mb-4">
        <h3 className="font-bold text-base line-clamp-1">{project.title}</h3>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">{project.team_name}</p>
      </div>

      <div className="space-y-4 pt-4 border-t border-muted">
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Opção de Avaliação</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="radio" name={`eval_opt_${project.id}`} checked={evalOption === 1} onChange={() => setEvalOption(1)} className="accent-primary" />
              Opção 1: Digitar nota diretamente
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="radio" name={`eval_opt_${project.id}`} checked={evalOption === 2} onChange={() => setEvalOption(2)} className="accent-primary" />
              Opção 2: Pesos personalizados
            </label>
          </div>
        </div>

        {evalOption === 1 ? (
          <div className="bg-muted/30 p-4 border border-border space-y-3">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Nota do Trabalho (0.0 a 10.0)</Label>
              <Input type="number" min={0} max={10} step={0.1} value={advisorRawScore} onChange={(e) => setAdvisorRawScore(e.target.value)} className="rounded-none max-w-[150px] bg-white text-xs h-8" placeholder="Ex: 8.5" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ℹ️ <strong>Cálculo de Premiação:</strong> Nota do Trabalho com peso 80% + Média dos Alunos com peso 20%.
            </p>
          </div>
        ) : (
          <div className="bg-muted/30 p-4 border border-border space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[9px] font-bold uppercase tracking-widest block mb-1">Orientador (%)</Label>
                <Input type="number" min={0} max={100} value={weightAdvisor} onChange={(e) => setWeightAdvisor(Number(e.target.value))} className="rounded-none bg-white h-8 text-xs px-2" />
              </div>
              <div>
                <Label className="text-[9px] font-bold uppercase tracking-widest block mb-1">Outros Prof. (%)</Label>
                <Input type="number" min={0} max={100} value={weightTeachers} onChange={(e) => setWeightTeachers(Number(e.target.value))} className="rounded-none bg-white h-8 text-xs px-2" />
              </div>
              <div>
                <Label className="text-[9px] font-bold uppercase tracking-widest block mb-1">Alunos (%)</Label>
                <Input type="number" min={0} max={100} value={weightStudents} onChange={(e) => setWeightStudents(Number(e.target.value))} className="rounded-none bg-white h-8 text-xs px-2" />
              </div>
            </div>
            
            <div className="flex justify-between items-center flex-wrap gap-2 text-xs font-bold">
              <span>Total: <span className={isWeightValid ? "text-green-600" : "text-destructive"}>{totalWeight}%</span></span>
              {!isWeightValid && (
                <span className="text-destructive font-normal">⚠️ Deve somar 100%</span>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button onClick={handleSaveClick} disabled={evalOption === 2 && !isWeightValid} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold w-full sm:w-auto h-9">
            Salvar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
}

const emptyList = { name: "", description: "" };
const emptyCriteria = { name: "", description: "", weight: 1 };

export default function MyCriteria() {
  const [showListForm, setShowListForm] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listForm, setListForm] = useState(emptyList);
  const [expandedList, setExpandedList] = useState(null);
  const [showCriteriaForm, setShowCriteriaForm] = useState(null);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [criteriaForm, setCriteriaForm] = useState(emptyCriteria);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => UserService.me() });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => UserService.myProfile(),
    enabled: !!user,
  });

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["my-criteria-lists", user?.email],
    queryFn: () => CriteriaService.listMine(),
    enabled: !!user,
  });

  const { data: myProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => ProjectService.listMine(),
    enabled: !!user,
  });

  const advisedProjects = myProjects.filter((p) => {
    const isAdvisor = 
      p.advisor?.toLowerCase() === user?.email?.toLowerCase() || 
      (profile?.full_name && p.advisor?.toLowerCase() === profile.full_name.toLowerCase());
    return isAdvisor;
  });

  const createList = useMutation({
    mutationFn: (data) => CriteriaService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria-lists"] }); toast({ title: "Lista criada!" }); closeListForm(); },
  });

  const updateList = useMutation({
    mutationFn: ({ id, data }) => CriteriaService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria-lists"] }); toast({ title: "Lista atualizada!" }); closeListForm(); },
  });

  const deleteList = useMutation({
    mutationFn: (id) => CriteriaService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria-lists"] }); toast({ title: "Lista excluída." }); },
  });

  const saveCriteria = useMutation({
    mutationFn: ({ listId, criteria }) => CriteriaService.update(listId, { criteria }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria-lists"] }); toast({ title: "Critério salvo!" }); closeCriteriaForm(); },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => ProjectService.updateEvalSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: "Configuração do projeto salva com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao salvar configuração",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
  });

  const bulkSettingsMutation = useMutation({
    mutationFn: (data) => ProjectService.bulkUpdateEvalSettings(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      toast({ title: res.message || "Configurações em lote aplicadas com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao salvar configurações em lote",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProjectSettings = (id, data) => {
    updateSettingsMutation.mutate({ id, data });
  };

  const handleApplyBulk = (data) => {
    bulkSettingsMutation.mutate(data);
  };

  const closeListForm = () => { setShowListForm(false); setEditingList(null); setListForm(emptyList); };
  const closeCriteriaForm = () => { setShowCriteriaForm(null); setEditingCriteria(null); setCriteriaForm(emptyCriteria); };

  const openEditList = (list) => {
    setEditingList(list);
    setListForm({ name: list.name, description: list.description || "" });
    setShowListForm(true);
  };

  const handleSaveList = () => {
    if (!listForm.name.trim()) return;
    if (editingList) updateList.mutate({ id: editingList.id, data: listForm });
    else createList.mutate(listForm);
  };

  const openAddCriteria = (listId) => {
    setEditingCriteria(null);
    setCriteriaForm(emptyCriteria);
    setShowCriteriaForm(listId);
    setExpandedList(listId);
  };

  const openEditCriteria = (list, index) => {
    const c = list.criteria[index];
    setEditingCriteria({ listId: list.id, index });
    setCriteriaForm({ name: c.name, description: c.description || "", weight: c.weight || 1 });
    setShowCriteriaForm(list.id);
    setExpandedList(list.id);
  };

  const handleSaveCriteria = (list) => {
    if (!criteriaForm.name.trim()) return;
    const existing = list.criteria || [];
    let updated;
    if (editingCriteria !== null && editingCriteria.listId === list.id) {
      updated = existing.map((c, i) => i === editingCriteria.index ? { ...criteriaForm, weight: Number(criteriaForm.weight) || 1 } : c);
    } else {
      updated = [...existing, { ...criteriaForm, weight: Number(criteriaForm.weight) || 1 }];
    }
    saveCriteria.mutate({ listId: list.id, criteria: updated });
  };

  const handleDeleteCriteria = (list, index) => {
    const updated = list.criteria.filter((_, i) => i !== index);
    saveCriteria.mutate({ listId: list.id, criteria: updated });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Listas de Critérios</h1>
          <p className="text-muted-foreground mt-1">Organize critérios por disciplina ou tema de avaliação</p>
        </div>
        <Button onClick={() => { setEditingList(null); setListForm(emptyList); setShowListForm(true); }}
          className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
          <Plus className="w-4 h-4" /> Nova Lista
        </Button>
      </div>

      {showListForm && (
        <div className="bg-white border border-border p-8 mb-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <h3 className="font-bold text-lg mb-6">{editingList ? "Editar Lista" : "Nova Lista de Critérios"}</h3>
          <div className="space-y-5">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome da Lista *</Label>
              <Input value={listForm.name} onChange={(e) => setListForm({ ...listForm, name: e.target.value })} className="rounded-none" placeholder="Ex: Banco de Dados, Linguagem de Programação..." />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição</Label>
              <Textarea value={listForm.description} onChange={(e) => setListForm({ ...listForm, description: e.target.value })} className="rounded-none h-20" placeholder="Ex: Critérios para disciplina de BD do 3º semestre" />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-muted">
            <Button variant="outline" onClick={closeListForm} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
            <Button onClick={handleSaveList} disabled={!listForm.name.trim()} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
              {editingList ? "Salvar Alterações" : "Criar Lista"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma lista criada ainda.</p>
          <Button onClick={() => setShowListForm(true)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
            <Plus className="w-4 h-4" /> Criar Primeira Lista
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => {
            const isOpen = expandedList === list.id;
            const criteria = list.criteria || [];
            return (
              <div key={list.id} className="bg-white border border-border">
                <div className="flex items-center gap-3 p-5 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedList(isOpen ? null : list.id)}>
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">{list.name}</h3>
                    {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {criteria.length} critério{criteria.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {list.id !== "geral" ? (
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => openEditList(list)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir esta lista e todos os seus critérios?")) deleteList.mutate(list.id); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-500 uppercase rounded flex-shrink-0">Padrão do Sistema</span>
                  )}
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>

                {isOpen && (
                  <div className="border-t border-border">
                    {criteria.map((c, idx) => (
                      <div key={idx} className="flex items-start gap-4 px-6 py-4 border-b border-muted last:border-b-0 bg-muted/10">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">{c.weight || 1}x</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{c.name}</p>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                        </div>
                        {list.id !== "geral" && (
                          <div className="flex gap-1 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => openEditCriteria(list, idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCriteria(list, idx)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {showCriteriaForm === list.id && list.id !== "geral" && (
                      <div className="px-6 py-5 bg-accent/30 border-b border-border">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{editingCriteria ? "Editar Critério" : "Novo Critério"}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="md:col-span-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Nome *</Label>
                            <Input value={criteriaForm.name} onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })} className="rounded-none" placeholder="Ex: Modelagem Relacional" />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Peso</Label>
                            <Input type="number" min={1} max={10} value={criteriaForm.weight} onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value })} className="rounded-none" />
                          </div>
                        </div>
                        <div className="mb-4">
                          <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Descrição</Label>
                          <Input value={criteriaForm.description} onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })} className="rounded-none" placeholder="Instrução para o avaliador..." />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={closeCriteriaForm} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
                          <Button size="sm" onClick={() => handleSaveCriteria(list)} disabled={!criteriaForm.name.trim()} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
                            {editingCriteria ? "Salvar" : "Adicionar"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {showCriteriaForm !== list.id && list.id !== "geral" && (
                      <div className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => openAddCriteria(list.id)} className="rounded-none text-xs uppercase font-bold gap-2 border-dashed">
                          <Plus className="w-3.5 h-3.5" /> Adicionar Critério
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Supervised Projects Section */}
      <div className="mt-14 pt-10 border-t border-border">
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="w-6 h-6 text-primary animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold font-heading">Configurações de Notas e Pesos</h2>
            <p className="text-muted-foreground text-sm">Defina como as notas de seus projetos orientados serão calculadas</p>
          </div>
        </div>

        {isProjectsLoading ? (
          <p className="text-muted-foreground">Carregando projetos...</p>
        ) : advisedProjects.length === 0 ? (
          <div className="bg-white border border-border p-6 text-center text-muted-foreground">
            Nenhum projeto sob sua orientação encontrado.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bulk Configuration Panel */}
            <BulkSettingsCard onApplyBulk={handleApplyBulk} />

            {/* Individual Projects Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advisedProjects.map((project) => (
                <ProjectSettingsCard 
                  key={project.id} 
                  project={project} 
                  onSave={handleSaveProjectSettings} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}