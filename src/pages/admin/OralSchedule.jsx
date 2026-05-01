import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Clock, MapPin, CheckCircle, XCircle, Mic, Search } from "lucide-react";
import { ProjectService } from "@/services";

const categoryLabels = { mecatronica: "Mecatrônica", software: "Software", gestao: "Gestão", logistica: "Logística", energia: "Energia", quimica: "Química", automacao: "Automação", outros: "Outros" };

export default function OralSchedule() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ room: "", schedule_time: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["oral-projects"],
    queryFn: () => ProjectService.listOral(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ProjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oral-projects"] });
      toast({ title: "Projeto atualizado!" });
      setEditingId(null);
    },
  });

  const approveOral = (project) => updateMutation.mutate({ id: project.id, data: { oral_approved: true, status: "aprovado" } });
  const rejectOral = (project) => updateMutation.mutate({ id: project.id, data: { oral_approved: false, status: "reprovado" } });
  const saveSchedule = (project) => updateMutation.mutate({ id: project.id, data: { room: editForm.room, schedule_time: editForm.schedule_time } });

  const filtered = projects.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.team_name?.toLowerCase().includes(search.toLowerCase())
  );

  const approved = filtered.filter(p => p.oral_approved);
  const pending = filtered.filter(p => !p.oral_approved && p.status !== "reprovado");
  const rejected = filtered.filter(p => p.status === "reprovado");

  const Section = ({ title, items, badge, badgeCls }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        <span className={`px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}>{badge}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Nenhum projeto nesta categoria.</p>
      ) : (
        <div className="bg-white border border-border divide-y divide-border">
          {items.map((project) => (
            <div key={project.id} className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-bold text-base">{project.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground uppercase">{categoryLabels[project.category] || project.category}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700"><Mic className="w-3 h-3" /> ORAL</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.team_name} · {project.advisor || "Sem orientador"}</p>
                  {project.room && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.room}</span>
                      {project.schedule_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.schedule_time}</span>}
                    </div>
                  )}
                  {project.slides_url && (
                    <a href={project.slides_url} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">Ver Apresentação →</a>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {!project.oral_approved && project.status !== "reprovado" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveOral(project)} className="bg-green-600 text-white rounded-none text-xs uppercase font-bold gap-1"><CheckCircle className="w-3.5 h-3.5" /> Aprovar</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectOral(project)} className="border-destructive text-destructive rounded-none text-xs uppercase font-bold gap-1"><XCircle className="w-3.5 h-3.5" /> Reprovar</Button>
                    </div>
                  )}
                  {project.oral_approved && editingId !== project.id && (
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(project.id); setEditForm({ room: project.room || "", schedule_time: project.schedule_time || "" }); }} className="rounded-none text-xs uppercase font-bold">
                      {project.room ? "Editar Horário" : "Definir Sala/Hora"}
                    </Button>
                  )}
                </div>
              </div>
              {editingId === project.id && (
                <div className="mt-4 p-4 bg-muted/30 border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Sala</Label>
                    <Input value={editForm.room} onChange={(e) => setEditForm({ ...editForm, room: e.target.value })} className="rounded-none" placeholder="Ex: Auditório A" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Horário</Label>
                    <Input value={editForm.schedule_time} onChange={(e) => setEditForm({ ...editForm, schedule_time: e.target.value })} className="rounded-none" placeholder="Ex: 09:00 - 09:30" />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button size="sm" onClick={() => saveSchedule(project)} className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold">Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="rounded-none text-xs uppercase font-bold">Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Apresentações Orais</h1>
        <p className="text-muted-foreground mt-1">Gerencie salas e horários para projetos com apresentação oral</p>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: "Inscritos para Oral", value: projects.length, cls: "" },
          { label: "Aprovados", value: approved.length, cls: "text-green-600" },
          { label: "Reprovados / Sem vaga", value: rejected.length, cls: "text-destructive" },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-border p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{k.label}</p>
            <p className={`text-4xl font-bold font-heading ${k.cls}`}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projeto ou equipe..." className="pl-10 rounded-none" />
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <>
          <Section title="Aguardando Aprovação" items={pending} badge={`${pending.length}`} badgeCls="bg-yellow-100 text-yellow-700" />
          <Section title="Aprovados para Apresentação Oral" items={approved} badge={`${approved.length}`} badgeCls="bg-green-100 text-green-700" />
          <Section title="Reprovados / Sem Vaga" items={rejected} badge={`${rejected.length}`} badgeCls="bg-red-100 text-red-700" />
        </>
      )}
    </div>
  );
}