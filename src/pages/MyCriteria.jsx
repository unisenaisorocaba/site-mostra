import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ListChecks, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CriteriaService, UserService } from "@/services";

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

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["my-criteria-lists", user?.email],
    queryFn: () => CriteriaService.listMine(),
    enabled: !!user,
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
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEditList(list)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir esta lista e todos os seus critérios?")) deleteList.mutate(list.id); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
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
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => openEditCriteria(list, idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCriteria(list, idx)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                    {showCriteriaForm === list.id && (
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
                    {showCriteriaForm !== list.id && (
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
    </div>
  );
}