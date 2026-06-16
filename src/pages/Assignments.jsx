import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService, ProjectService, AssignmentService } from "@/services";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UserCheck, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Assignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [evalDate, setEvalDate] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["users-profiles"],
    queryFn: () => UserService.listAll()
  });

  const students = profiles.filter(p => p.user_type === "aluno" || p.user_type === "STUDENT");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-approved-all"],
    queryFn: () => ProjectService.listApprovedAll()
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => AssignmentService.listAll()
  });

  const createMutation = useMutation({
    mutationFn: (data) => AssignmentService.create(data),
    onSuccess: () => {
      toast({ title: "Projeto atribuído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setSelectedProject("");
    },
    onError: (err) => {
      toast({ title: "Erro ao atribuir", description: err.response?.data?.error || err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => AssignmentService.delete(id),
    onSuccess: () => {
      toast({ title: "Atribuição removida!" });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    }
  });

  const handleAssign = () => {
    if (!selectedStudent || !selectedProject || !evalDate) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      user_email: selectedStudent,
      project_id: selectedProject,
      eval_date: evalDate
    });
  };

  return (
    <div>
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Atribuições</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Atribuição de Avaliadores</h1>
        <p className="text-muted-foreground mt-1 text-base">Gerencie quais projetos cada aluno deverá avaliar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-border p-6">
            <h2 className="text-lg font-bold font-heading mb-4">Nova Atribuição</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Aluno</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.user_email} value={s.user_email}>
                        {s.full_name} ({s.user_email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Projeto</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.project_number ? `#${p.project_number} - ` : ""}{p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Data da Avaliação</Label>
                <Input type="date" className="rounded-none" value={evalDate} onChange={e => setEvalDate(e.target.value)} />
              </div>

              <Button 
                onClick={handleAssign} 
                disabled={createMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider"
              >
                Atribuir Projeto
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border border-border">
            <div className="bg-muted/30 border-b border-border px-6 py-4 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Projetos Atribuídos</span>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1">{assignments.length} registros</span>
            </div>
            
            {assignments.length === 0 ? (
              <div className="text-center py-16">
                <UserCheck className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Nenhuma atribuição cadastrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-[10px] font-bold uppercase tracking-widest border-b border-border text-muted-foreground">
                      <th className="px-6 py-4">Aluno</th>
                      <th className="px-6 py-4">Projeto</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {assignments.map(a => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold">{a.user?.name || a.user_email}</td>
                        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={a.project?.title}>
                          {a.project?.project_number ? `#${a.project.project_number} ` : ""}{a.project?.title}
                        </td>
                        <td className="px-6 py-4 font-mono">{a.eval_date}</td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 rounded-none h-8 px-2"
                            onClick={() => {
                              if (confirm("Remover esta atribuição?")) {
                                deleteMutation.mutate(a.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
