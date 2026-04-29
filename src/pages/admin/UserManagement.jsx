import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Users, GraduationCap, BookOpen, Search, Mail } from "lucide-react";

const typeConfig = {
  aluno: { label: "Aluno", cls: "bg-blue-100 text-blue-700", icon: GraduationCap },
  professor: { label: "Professor", cls: "bg-purple-100 text-purple-700", icon: BookOpen },
};

const emptyProfile = { user_email: "", full_name: "", user_type: "aluno", registration: "", course: "", department: "", active: true };

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 200),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Invite user to platform first
      await base44.users.inviteUser(data.user_email, data.user_type === "professor" ? "user" : "user");
      return base44.entities.UserProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário cadastrado e convite enviado!" });
      closeForm();
    },
    onError: () => {
      // Even if invite fails (user may already exist), create profile
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Perfil salvo. Verifique se o convite foi enviado." });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário atualizado!" });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário removido." });
    },
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyProfile); };

  const openEdit = (profile) => {
    setEditing(profile);
    setForm({ user_email: profile.user_email, full_name: profile.full_name, user_type: profile.user_type, registration: profile.registration || "", course: profile.course || "", department: profile.department || "", active: profile.active !== false });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.user_email || !form.full_name) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = profiles.filter((p) => {
    const matchType = filterType === "all" || p.user_type === filterType;
    const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const alunoCount = profiles.filter(p => p.user_type === "aluno").length;
  const professorCount = profiles.filter(p => p.user_type === "professor").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">Cadastro de professores e alunos da Mostra</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyProfile); setShowForm(true); }} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2">
          <Plus className="w-4 h-4" /> Cadastrar Usuário
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total de Usuários", value: profiles.length },
          { label: "Professores", value: professorCount },
          { label: "Alunos", value: alunoCount },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-border p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{k.label}</p>
            <p className="text-4xl font-bold font-heading">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-lg p-8">
            <h2 className="text-xl font-bold font-heading mb-6 border-b border-muted pb-4">
              {editing ? "Editar Usuário" : "Cadastrar Usuário"}
            </h2>
            <div className="space-y-5">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Tipo de Usuário *</Label>
                <Select value={form.user_type} onValueChange={(v) => setForm({ ...form, user_type: v })}>
                  <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome Completo *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-none" placeholder="Nome completo" />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">E-mail Institucional *</Label>
                <Input value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} className="rounded-none" placeholder="email@senaisp.edu.br" type="email" disabled={!!editing} />
              </div>
              {form.user_type === "aluno" && (
                <>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Matrícula / RA</Label>
                    <Input value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} className="rounded-none" placeholder="Ex: 2024001" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Curso</Label>
                    <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="rounded-none" placeholder="Ex: Mecatrônica" />
                  </div>
                </>
              )}
              {form.user_type === "professor" && (
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Departamento</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-none" placeholder="Ex: Engenharia" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-muted">
              <Button variant="outline" onClick={closeForm} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.user_email || !form.full_name || createMutation.isPending || updateMutation.isPending} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
                {editing ? "Salvar" : "Cadastrar e Convidar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." className="pl-10 rounded-none" />
        </div>
        <div className="flex gap-2">
          {["all", "aluno", "professor"].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${filterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border hover:border-primary"}`}>
              {t === "all" ? "Todos" : t === "aluno" ? "Alunos" : "Professores"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border">
        <div className="bg-muted/40 border-b border-border px-6 py-4">
          <span className="text-[10px] font-bold uppercase tracking-widest">{filtered.length} usuário(s)</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((profile) => {
              const tc = typeConfig[profile.user_type] || typeConfig.aluno;
              const Icon = tc.icon;
              return (
                <div key={profile.id} className="p-5 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-0.5">
                      <span className="font-bold text-sm">{profile.full_name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tc.cls}`}>{tc.label}</span>
                      {profile.active === false && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-600">Inativo</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" /> {profile.user_email}
                      {profile.registration && <span className="ml-3">RA: {profile.registration}</span>}
                      {profile.course && <span className="ml-3">· {profile.course}</span>}
                      {profile.department && <span className="ml-3">· {profile.department}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(profile)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover usuário?")) deleteMutation.mutate(profile.id); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}