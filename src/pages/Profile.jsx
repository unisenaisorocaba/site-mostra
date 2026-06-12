import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Shield, Info, Plus, Trash2, Calendar, ClipboardList, Key, Settings } from "lucide-react";
import UserService from "@/services/userService";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states for Guests
  const [guestName, setGuestName] = useState("");
  const [guestDocument, setGuestDocument] = useState("");

  // Form states for Profile Edit
  const [fullName, setFullName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [className, setClassName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserService.me(),
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => UserService.myProfile(),
    enabled: !!user,
  });

  const { data: guests = [], isLoading: loadingGuests } = useQuery({
    queryKey: ["my-guests", user?.email],
    queryFn: () => UserService.listMyGuests(),
    enabled: !!user,
  });

  // Populate edit form once user/profile data is loaded
  useEffect(() => {
    if (user) {
      setFullName(profile?.full_name || user.name || "");
      setEnrollment(profile?.registration || user.enrollmentNumber || "");
      setClassName(profile?.course || user.className || "");
    }
  }, [user, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => UserService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Perfil atualizado com sucesso!" });
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: (data) => UserService.createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guests"] });
      toast({ title: "Convidado cadastrado com sucesso!" });
      setGuestName("");
      setGuestDocument("");
    },
    onError: (err) => {
      toast({
        title: "Erro ao cadastrar convidado",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (id) => UserService.deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-guests"] });
      toast({ title: "Convidado removido com sucesso." });
    },
    onError: (err) => {
      toast({
        title: "Erro ao remover convidado",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: "Nome completo é obrigatório.", variant: "destructive" });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast({ title: "A senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: "As senhas não coincidem.", variant: "destructive" });
        return;
      }
    }

    const payload = {
      name: fullName.trim(),
    };

    if (isStudent) {
      payload.enrollmentNumber = enrollment.trim() || null;
      payload.className = className.trim() || null;
    }

    if (newPassword) {
      payload.password = newPassword;
    }

    updateProfileMutation.mutate(payload);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestDocument.trim()) {
      toast({ title: "Por favor, preencha todos os campos do convidado.", variant: "destructive" });
      return;
    }
    addGuestMutation.mutate({ name: guestName.trim(), document: guestDocument.trim() });
  };

  if (loadingUser || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isStudent = user?.role === "STUDENT" || profile?.user_type === "aluno";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações da conta e convidados para o evento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Profile Info and Edit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Static Info Card */}
          <div className="bg-white border border-border p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
            <div className="flex flex-col items-center text-center pb-5 border-b border-muted">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary font-bold text-xl">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <h2 className="font-bold text-base leading-tight">{profile?.full_name || user?.name || "Usuário"}</h2>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 mt-1.5">
                {user?.role === "ADMIN" ? "Administrador" : user?.role === "TEACHER" ? "Professor" : "Estudante"}
              </span>
            </div>

            <div className="pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between py-1 border-b border-muted">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</span>
                <span className="font-bold truncate max-w-[200px]">{user?.email}</span>
              </div>
              {isStudent && (
                <>
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Matrícula / RA</span>
                    <span className="font-bold">{profile?.registration || user?.enrollmentNumber || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Curso / Turma</span>
                    <span className="font-bold">{profile?.course || user?.className || "—"}</span>
                  </div>
                </>
              )}
              {!isStudent && profile?.department && (
                <div className="flex justify-between py-1 border-b border-muted">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Departamento</span>
                  <span className="font-bold">{profile.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile & Password Form */}
          <div className="bg-white border border-border">
            <div className="bg-muted/40 border-b border-border px-5 py-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-heading">Editar Dados & Senha</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-none bg-background text-sm h-9"
                  placeholder="Seu nome completo"
                />
              </div>

              {isStudent && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="enrollment" className="text-[10px] font-bold uppercase tracking-widest">Matrícula / RA</Label>
                    <Input
                      id="enrollment"
                      value={enrollment}
                      onChange={(e) => setEnrollment(e.target.value)}
                      className="rounded-none bg-background text-sm h-9"
                      placeholder="Número do RA"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="className" className="text-[10px] font-bold uppercase tracking-widest">Turma / Curso</Label>
                    <Input
                      id="className"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="rounded-none bg-background text-sm h-9"
                      placeholder="Ex: DSM 3º Sem"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-muted pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-primary" /> Alterar Senha (Opcional)
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="newPass" className="text-[10px] font-bold uppercase tracking-widest">Nova Senha</Label>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-none bg-background text-sm h-9"
                    placeholder="Min. 6 caracteres"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" className="text-[10px] font-bold uppercase tracking-widest">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-none bg-background text-sm h-9"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-2.5 h-auto mt-2"
              >
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Panel: Guests registration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Institutional Warning */}
          <div className="bg-red-50/50 border border-red-200/60 p-6 flex gap-4 items-start">
            <div className="w-10 h-10 bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-red-950">Aviso sobre Acesso e Vestimenta</h4>
              <p className="text-sm text-red-900 leading-relaxed">
                O evento será aberto a familiares e convidados. Para participação, os visitantes deverão ser cadastrados previamente para liberação na portaria e deverão seguir as normas institucionais <strong className="font-bold">(não é permitido o uso de chinelo, sandália, shorts, bonés, entre outros)</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white border border-border">
            <div className="bg-muted/40 border-b border-border px-6 py-5">
              <h3 className="text-lg font-bold font-heading">Cadastrar Convidados</h3>
            </div>
            
            <div className="p-6">
              {/* Add Guest Form */}
              <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 pb-8 border-b border-muted">
                <div className="md:col-span-6 space-y-2">
                  <Label htmlFor="guestName" className="text-[10px] font-bold uppercase tracking-widest">Nome Completo do Visitante</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ex: João Silva Santos"
                    className="rounded-none bg-background text-sm h-9"
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label htmlFor="guestDoc" className="text-[10px] font-bold uppercase tracking-widest">RG ou CPF</Label>
                  <Input
                    id="guestDoc"
                    value={guestDocument}
                    onChange={(e) => setGuestDocument(e.target.value)}
                    placeholder="Ex: 12.345.678-9 ou 123.456.789-00"
                    className="rounded-none bg-background text-sm h-9"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={addGuestMutation.isPending}
                    className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider h-9 gap-1.5 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" /> {addGuestMutation.isPending ? "..." : "Adicionar"}
                  </Button>
                </div>
              </form>

              {/* Guest List */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4" /> Convidados Cadastrados ({guests.length})
                </h4>

                {loadingGuests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : guests.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Nenhum convidado cadastrado até o momento.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border">
                    {guests.map((g) => (
                      <div key={g.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div>
                          <p className="font-bold text-sm">{g.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">RG/CPF: {g.document}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 uppercase tracking-wider">
                            <Calendar className="w-3 h-3" /> Cadastrado em: {new Date(g.created_date).toLocaleDateString("pt-BR")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteGuestMutation.isPending}
                            onClick={() => {
                              if (confirm(`Remover cadastro de ${g.name}?`)) {
                                deleteGuestMutation.mutate(g.id);
                              }
                            }}
                            className="text-destructive hover:bg-destructive/10 rounded-none w-8 h-8"
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
          </div>
        </div>
      </div>
    </div>
  );
}
