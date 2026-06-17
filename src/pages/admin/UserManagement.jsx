import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Users, GraduationCap, BookOpen, Search, Mail, Upload, KeyRound } from "lucide-react";
import { UserService, SettingService } from "@/services";

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

  const settingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => SettingService.get(),
  });

  const evalsOpen = settingsQuery.data?.evaluations_open !== false;

  const toggleMutation = useMutation({
    mutationFn: (newValue) => SettingService.update(newValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({ title: "Período de avaliações atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar período: " + err.message, variant: "destructive" });
    }
  });

  const [showCSVImport, setShowCSVImport] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState("UniSenai2026");
  const [parsedUsers, setParsedUsers] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");

  const handleCSVChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        toast({ title: "Arquivo CSV vazio ou sem cabeçalhos", variant: "destructive" });
        return;
      }

      const firstLine = lines[0];
      const separator = firstLine.includes(";") ? ";" : ",";
      
      const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
      
      const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("e-mail"));
      const nameIdx = headers.findIndex(h => h.includes("nome") || h.includes("name") || h.includes("completo"));
      const roleIdx = headers.findIndex(h => h.includes("papel") || h.includes("role") || h.includes("tipo"));
      const regIdx = headers.findIndex(h => h.includes("matricula") || h.includes("ra") || h.includes("registration"));
      const courseIdx = headers.findIndex(h => h.includes("turma") || h.includes("curso") || h.includes("class") || h.includes("course"));
      const deptIdx = headers.findIndex(h => h.includes("departamento") || h.includes("department") || h.includes("depto"));

      if (emailIdx === -1 || nameIdx === -1 || roleIdx === -1) {
        toast({ title: "Colunas obrigatórias não encontradas (Nome, Email, Papel/Tipo)", variant: "destructive" });
        return;
      }

      const usersList = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator).map(v => v.trim());
        if (values.length < headers.length) continue;

        const email = values[emailIdx];
        const name = values[nameIdx];
        const roleRaw = values[roleIdx]?.toLowerCase();
        const registration = regIdx !== -1 ? values[regIdx] : "";
        const course = courseIdx !== -1 ? values[courseIdx] : "";
        const department = deptIdx !== -1 ? values[deptIdx] : "";

        if (!email || !name || !roleRaw) continue;

        let role = "aluno";
        if (roleRaw.includes("prof") || roleRaw.includes("teach") || roleRaw.includes("docente")) {
          role = "professor";
        } else if (roleRaw.includes("adm")) {
          role = "admin";
        }

        usersList.push({
          email,
          name,
          role,
          registration,
          course,
          department
        });
      }

      setParsedUsers(usersList);
    };

    reader.readAsText(file);
  };

  const importMutation = useMutation({
    mutationFn: ({ users, password }) => UserService.importBatch(users, password),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: `Importação concluída! Criados: ${res.created}, Atualizados: ${res.updated}` });
      if (res.errors?.length > 0) {
        console.warn("Erros na importação:", res.errors);
        toast({ title: `${res.errors.length} erro(s) durante a importação. Verifique o console.`, variant: "destructive" });
      }
      closeCSVModal();
    },
    onError: (err) => {
      toast({ title: "Erro ao importar: " + err.message, variant: "destructive" });
    }
  });

  const closeCSVModal = () => {
    setShowCSVImport(false);
    setParsedUsers([]);
    setCsvFileName("");
    setDefaultPassword("UniSenai2026");
  };

  const handleCSVSubmit = () => {
    if (parsedUsers.length === 0 || !defaultPassword) return;
    importMutation.mutate({ users: parsedUsers, password: defaultPassword });
  };

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => UserService.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const inviteRole = data.user_type === "professor" ? "professor" : "STUDENT";
      await UserService.invite(data.user_email, inviteRole);
      return UserService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário cadastrado e convite enviado!" });
      closeForm();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Perfil salvo. Verifique se o convite foi enviado." });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => UserService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário atualizado!" });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => UserService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
      toast({ title: "Usuário removido." });
    },
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => UserService.resetPassword(id, newPassword),
    onSuccess: () => {
      toast({ title: "Senha redefinida com sucesso!" });
      closeResetModal();
    },
    onError: (err) => {
      toast({ title: "Erro ao redefinir senha: " + err.message, variant: "destructive" });
    }
  });

  const openResetPassword = (profile) => {
    setResetUser(profile);
    setNewPassword("");
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetUser(null);
    setNewPassword("");
  };

  const handleResetPassword = () => {
    if (!resetUser || !newPassword || newPassword.length < 4) return;
    resetPasswordMutation.mutate({ id: resetUser.id, newPassword });
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyProfile); };

  const openEdit = (profile) => {
    setEditing(profile);
    setForm({ user_email: profile.user_email, full_name: profile.full_name, user_type: profile.user_type, registration: profile.registration || "", course: profile.course || "", department: profile.department || "", active: profile.active !== false });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.user_email || !form.full_name) return;
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = profiles
    .filter((p) => {
      const matchType = filterType === "all" || p.user_type === filterType;
      const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.user_email?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "pt-BR"));

  const alunoCount = profiles.filter(p => p.user_type === "aluno").length;
  const professorCount = profiles.filter(p => p.user_type === "professor").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">Cadastro de professores e alunos da Mostra</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCSVImport(true)} variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider gap-2 border-2">
            <Upload className="w-4 h-4" /> Importar CSV
          </Button>
          <Button onClick={() => { setEditing(null); setForm(emptyProfile); setShowForm(true); }} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Usuário
          </Button>
        </div>
      </div>

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

      {/* System Settings / Lock Evaluations */}
      <div className="bg-white border border-border p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        <div>
          <h3 className="font-bold text-base uppercase tracking-wider mb-1">Período de Avaliações</h3>
          <p className="text-xs text-muted-foreground">
            Tranque ou destranque o período de avaliações e edições de projetos para todos os alunos e professores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${evalsOpen ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
            {evalsOpen ? "Aberto para avaliações" : "Fechado / Encerrado"}
          </span>
          <Button
            onClick={() => toggleMutation.mutate(!evalsOpen)}
            disabled={settingsQuery.isLoading || toggleMutation.isPending}
            className={`rounded-none text-xs uppercase font-bold tracking-wider py-2.5 px-4 ${evalsOpen ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {toggleMutation.isPending ? "Processando..." : (evalsOpen ? "Encerrar Período" : "Abrir Período")}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-lg p-8">
            <h2 className="text-xl font-bold font-heading mb-6 border-b border-muted pb-4">{editing ? "Editar Usuário" : "Cadastrar Usuário"}</h2>
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
              {form.user_type === "aluno" && (<>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Matrícula / RA</Label>
                  <Input value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} className="rounded-none" placeholder="Ex: 2024001" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Curso</Label>
                  <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="rounded-none" placeholder="Ex: Mecatrônica" />
                </div>
              </>)}
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

      {showCSVImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-2xl p-8 max-h-[85vh] flex flex-col">
            <h2 className="text-xl font-bold font-heading mb-4 border-b border-muted pb-4">Importação em Lote via CSV</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Senha Padrão Inicial *</Label>
                  <Input value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} className="rounded-none" placeholder="Ex: UniSenai2026" />
                  <p className="text-[10px] text-muted-foreground mt-1">Todos os novos usuários importados iniciarão com esta senha.</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Selecionar Arquivo CSV *</Label>
                  <label className="flex items-center justify-between border border-border px-3 py-2 cursor-pointer bg-muted/20 hover:border-primary transition-colors">
                    <span className="text-xs truncate max-w-xs">{csvFileName || "Escolher arquivo..."}</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleCSVChange} />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">Colunas: Nome, Email, Papel (aluno/professor), RA/Matrícula, Curso/Turma, Departamento.</p>
                </div>
              </div>
            </div>

            {parsedUsers.length > 0 ? (
              <div className="flex-1 overflow-y-auto border border-border mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted text-[10px] font-bold uppercase tracking-widest border-b border-border">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Papel</th>
                      <th className="p-3">Matrícula/RA</th>
                      <th className="p-3">Curso/Turma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {parsedUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        <td className="p-3 font-bold">{u.name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-none font-bold text-[10px] uppercase tracking-widest ${u.role === "professor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">{u.registration || "—"}</td>
                        <td className="p-3">{u.course || u.department || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border py-12 mb-6 bg-muted/5">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum arquivo CSV carregado ou dados vazios.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-muted">
              <Button variant="outline" onClick={closeCSVModal} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
              <Button onClick={handleCSVSubmit} disabled={parsedUsers.length === 0 || !defaultPassword || importMutation.isPending} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">
                {importMutation.isPending ? "Processando..." : `Confirmar Importação (${parsedUsers.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-md p-8">
            <h2 className="text-xl font-bold font-heading mb-6 border-b border-muted pb-4">Redefinir Senha</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Definir uma nova senha para o usuário <strong>{resetUser?.full_name}</strong> ({resetUser?.user_email}).
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nova Senha *</Label>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-none"
                  placeholder="Mínimo 4 caracteres"
                  type="password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-muted">
              <Button variant="outline" onClick={closeResetModal} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
              <Button
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword.length < 4 || resetPasswordMutation.isPending}
                className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold"
              >
                {resetPasswordMutation.isPending ? "Salvando..." : "Redefinir Senha"}
              </Button>
            </div>
          </div>
        </div>
      )}

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

      <div className="bg-white border border-border">
        <div className="bg-muted/40 border-b border-border px-6 py-4">
          <span className="text-[10px] font-bold uppercase tracking-widest">{filtered.length} usuário(s)</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center"><Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Nenhum usuário encontrado.</p></div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((profile) => {
              const tc = typeConfig[profile.user_type] || typeConfig.aluno;
              const Icon = tc.icon;
              return (
                <div key={profile.id} className="p-5 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
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
                    <Button variant="ghost" size="sm" onClick={() => openResetPassword(profile)} title="Redefinir Senha"><KeyRound className="w-4 h-4 text-muted-foreground hover:text-primary" /></Button>
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