import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = { name: "", description: "", weight: 1 };

export default function MyCriteria() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: criteria, isLoading } = useQuery({
    queryKey: ["my-criteria", user?.email],
    queryFn: () => base44.entities.EvaluationCriteria.filter({ owner_email: user.email }, "name"),
    enabled: !!user,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EvaluationCriteria.create({ ...data, owner_email: user.email }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria"] }); toast({ title: "Critério criado!" }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EvaluationCriteria.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria"] }); toast({ title: "Critério atualizado!" }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EvaluationCriteria.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-criteria"] }); toast({ title: "Critério excluído." }); },
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || "", weight: c.weight || 1 }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = { ...form, weight: Number(form.weight) || 1 };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Meus Critérios de Avaliação</h1>
          <p className="text-muted-foreground mt-1">Cadastre critérios personalizados para usar nas avaliações</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
          <Plus className="w-4 h-4" /> Novo Critério
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-border p-8 mb-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <h3 className="font-bold text-lg mb-6">{editing ? "Editar Critério" : "Novo Critério"}</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome do Critério *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" placeholder="Ex: Apresentação Visual do Banner" />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Peso (1–10)</Label>
                <Input type="number" min={1} max={10} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="rounded-none" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição / Instrução</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none h-24" placeholder="Como o avaliador deve interpretar este critério..." />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-muted">
            <Button variant="outline" onClick={closeForm} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
              {editing ? "Salvar Alterações" : "Criar Critério"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : criteria.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhum critério cadastrado ainda.</p>
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
            <Plus className="w-4 h-4" /> Criar Primeiro Critério
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((c) => (
            <div key={c.id} className="bg-white border border-border p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                {c.weight || 1}x
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{c.name}</h3>
                {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir critério?")) deleteMutation.mutate(c.id); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}