import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Users, UserPlus, Check, X, Trash2, Mail } from "lucide-react";

export default function Groups() {
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userQuery = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const user = userQuery.data;

  const { data: myGroups, isLoading: loadingMy } = useQuery({
    queryKey: ["my-groups"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Group.filter({ owner_email: u.email }, "-created_date");
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: invitedGroups, isLoading: loadingInvites } = useQuery({
    queryKey: ["invited-groups"],
    queryFn: async () => {
      const u = await base44.auth.me();
      const all = await base44.entities.Group.list("-created_date", 200);
      return all.filter(g =>
        g.owner_email !== u.email &&
        g.members?.some(m => m.email === u.email)
      );
    },
    enabled: !!user,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const u = await base44.auth.me();
      return base44.entities.Group.create({ ...data, owner_email: u.email, members: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Grupo criado!" });
      setShowCreate(false); setNewGroupName(""); setNewGroupDesc("");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ group, email }) => {
      const existing = group.members || [];
      if (existing.some(m => m.email === email)) throw new Error("Já convidado");
      const updated = [...existing, { email, name: email.split("@")[0], status: "pending" }];
      return base44.entities.Group.update(group.id, { members: updated });
    },
    onSuccess: (_, { group }) => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setInviteEmail({ ...inviteEmail, [group.id]: "" });
      toast({ title: "Convite enviado!" });
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  });

  const respondMutation = useMutation({
    mutationFn: async ({ group, email, accept }) => {
      const updated = (group.members || []).map(m =>
        m.email === email ? { ...m, status: accept ? "accepted" : "rejected" } : m
      );
      return base44.entities.Group.update(group.id, { members: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invited-groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Resposta enviada!" });
    },
  });

  const removeMember = async (group, email) => {
    const updated = (group.members || []).filter(m => m.email !== email);
    await base44.entities.Group.update(group.id, { members: updated });
    queryClient.invalidateQueries({ queryKey: ["my-groups"] });
  };

  const deleteGroup = useMutation({
    mutationFn: (id) => base44.entities.Group.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-groups"] }); toast({ title: "Grupo excluído." }); },
  });

  const statusBadge = (status) => ({
    pending: <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700">PENDENTE</span>,
    accepted: <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700">ACEITO</span>,
    rejected: <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600">RECUSADO</span>,
  }[status]);

  const myPendingInvites = invitedGroups.filter(g =>
    g.members?.some(m => m.email === user?.email && m.status === "pending")
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Grupos</h1>
          <p className="text-muted-foreground mt-1">Forme sua equipe e convide colegas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-2">
          <Plus className="w-4 h-4" /> Criar Grupo
        </Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border w-full max-w-md p-8">
            <h2 className="text-xl font-bold font-heading mb-6 border-b border-muted pb-4">Criar Novo Grupo</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Nome do Grupo *</Label>
                <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="rounded-none" placeholder="Ex: Grupo Alpha-4" />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição</Label>
                <Textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="rounded-none h-20" placeholder="Breve descrição do grupo..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-muted">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
              <Button onClick={() => createMutation.mutate({ name: newGroupName, description: newGroupDesc })} disabled={!newGroupName || createMutation.isPending} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">Criar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending invites banner */}
      {myPendingInvites.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-500 p-6 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-3">Convites Pendentes ({myPendingInvites.length})</h3>
          <div className="space-y-3">
            {myPendingInvites.map((group) => (
              <div key={group.id} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="font-bold">{group.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">por {group.owner_email}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respondMutation.mutate({ group, email: user.email, accept: true })} className="bg-green-600 text-white rounded-none text-xs uppercase font-bold gap-1">
                    <Check className="w-3.5 h-3.5" /> Aceitar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => respondMutation.mutate({ group, email: user.email, accept: false })} className="border-destructive text-destructive rounded-none text-xs uppercase font-bold gap-1">
                    <X className="w-3.5 h-3.5" /> Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My groups */}
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Meus Grupos</h2>
      {loadingMy ? <p className="text-muted-foreground">Carregando...</p> : myGroups.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border mb-8">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Você não criou nenhum grupo ainda.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-10">
          {myGroups.map((group) => (
            <div key={group.id} className="bg-white border border-border">
              <div className="p-6 border-b border-muted flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-lg">{group.name}</h3>
                  {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Excluir grupo?")) deleteGroup.mutate(group.id); }} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {/* Members */}
              <div className="p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Membros Convidados</h4>
                {(!group.members || group.members.length === 0) ? (
                  <p className="text-sm text-muted-foreground mb-4">Nenhum membro convidado ainda.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {group.members.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{m.email}</span>
                          {statusBadge(m.status)}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeMember(group, m.email)} className="text-destructive"><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Invite form */}
                <div className="flex gap-3">
                  <Input
                    value={inviteEmail[group.id] || ""}
                    onChange={(e) => setInviteEmail({ ...inviteEmail, [group.id]: e.target.value })}
                    placeholder="email@senaisp.edu.br"
                    className="rounded-none flex-1"
                    type="email"
                  />
                  <Button
                    onClick={() => inviteMutation.mutate({ group, email: inviteEmail[group.id] })}
                    disabled={!inviteEmail[group.id] || inviteMutation.isPending}
                    className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold gap-1"
                  >
                    <UserPlus className="w-4 h-4" /> Convidar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups I'm a member of */}
      {invitedGroups.filter(g => g.members?.some(m => m.email === user?.email && m.status === "accepted")).length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Grupos que Participo</h2>
          <div className="space-y-4">
            {invitedGroups.filter(g => g.members?.some(m => m.email === user?.email && m.status === "accepted")).map((group) => (
              <div key={group.id} className="bg-white border border-border p-6">
                <h3 className="font-bold text-base">{group.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">Criado por {group.owner_email}</p>
                {group.description && <p className="text-sm text-muted-foreground mt-2">{group.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}