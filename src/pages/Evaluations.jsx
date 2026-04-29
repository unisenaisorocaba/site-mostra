import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, Check } from "lucide-react";

const criteria = [
  { key: "criteria_innovation", label: "Inovação" },
  { key: "criteria_technical", label: "Qualidade Técnica" },
  { key: "criteria_presentation", label: "Apresentação" },
  { key: "criteria_relevance", label: "Relevância Industrial" },
];

export default function Evaluations() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scores, setScores] = useState({
    criteria_innovation: 5,
    criteria_technical: 5,
    criteria_presentation: 5,
    criteria_relevance: 5,
  });
  const [comments, setComments] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["projects-for-eval"],
    queryFn: () => base44.entities.Project.filter({ status: "aprovado" }),
    initialData: [],
  });

  const { data: myEvaluations } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Evaluation.filter({ created_by: user.email }, "-created_date");
    },
    initialData: [],
  });

  const createEval = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Evaluation.create({
        ...data,
        evaluator_name: user.full_name || user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });
      toast({ title: "Avaliação salva com sucesso!" });
      setSelectedProjectId("");
      setScores({ criteria_innovation: 5, criteria_technical: 5, criteria_presentation: 5, criteria_relevance: 5 });
      setComments("");
    },
  });

  const handleSubmit = () => {
    if (!selectedProjectId) return;
    createEval.mutate({
      project_id: selectedProjectId,
      ...scores,
      comments,
    });
  };

  const getProjectTitle = (id) => {
    const p = projects.find((p) => p.id === id);
    return p ? p.title : id;
  };

  const avg = (eval_) => {
    const vals = criteria.map((c) => eval_[c.key] || 0);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Avaliação de Projetos</h1>
        <p className="text-muted-foreground mt-1">
          Avalie os projetos apresentados na mostra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white border border-border p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Nova Avaliação
          </h3>

          <div>
            <Label className="text-xs uppercase font-bold tracking-wider">Projeto</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="rounded-none mt-1">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {p.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {criteria.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{c.label}</Label>
                <span className="text-lg font-bold text-primary font-heading">{scores[c.key]}</span>
              </div>
              <Slider
                value={[scores[c.key]]}
                onValueChange={([v]) => setScores({ ...scores, [c.key]: v })}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          ))}

          <div>
            <Label className="text-xs uppercase font-bold tracking-wider">Comentários</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="rounded-none mt-1 h-24"
              placeholder="Observações sobre o projeto..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedProjectId || createEval.isPending}
            className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider"
          >
            Salvar Avaliação
          </Button>
        </div>

        {/* History */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Avaliações Realizadas ({myEvaluations.length})
          </h3>
          {myEvaluations.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border">
              <p className="text-muted-foreground">Nenhuma avaliação realizada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myEvaluations.map((eval_) => (
                <div key={eval_.id} className="bg-white border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold">{getProjectTitle(eval_.project_id)}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(eval_.created_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">{avg(eval_)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {criteria.map((c) => (
                      <div key={c.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{c.label}</span>
                        <span className="font-bold">{eval_[c.key]}</span>
                      </div>
                    ))}
                  </div>
                  {eval_.comments && (
                    <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">
                      {eval_.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}