import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, ChevronRight } from "lucide-react";

const criteria = [
  {
    key: "criteria_innovation",
    label: "Inovação Técnica e Originalidade",
    description: "O quão único é o projeto em relação às soluções existentes no mercado industrial?",
  },
  {
    key: "criteria_technical",
    label: "Rigor Metodológico",
    description: "Qualidade da fundamentação teórica e aplicação de normas técnicas.",
  },
  {
    key: "criteria_presentation",
    label: "Qualidade da Apresentação",
    description: "Clareza, organização e comunicação do projeto e dos resultados.",
  },
  {
    key: "criteria_relevance",
    label: "Potencial de Impacto Industrial",
    description: "Escalabilidade e viabilidade econômica da implementação proposta.",
  },
];

export default function Evaluations() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scores, setScores] = useState({
    criteria_innovation: 5,
    criteria_technical: 5,
    criteria_presentation: 5,
    criteria_relevance: 5,
  });
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [comments, setComments] = useState("");
  const [declared, setDeclared] = useState(false);
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
      toast({ title: "Avaliação finalizada com sucesso!" });
      setSelectedProjectId("");
      setScores({ criteria_innovation: 5, criteria_technical: 5, criteria_presentation: 5, criteria_relevance: 5 });
      setStrengths(""); setImprovements(""); setComments(""); setDeclared(false);
    },
  });

  const handleSubmit = () => {
    if (!selectedProjectId || !declared) return;
    const combinedComments = [
      strengths && `Pontos Fortes: ${strengths}`,
      improvements && `Melhorias: ${improvements}`,
      comments && `Parecer: ${comments}`,
    ].filter(Boolean).join("\n\n");
    createEval.mutate({ project_id: selectedProjectId, ...scores, comments: combinedComments });
  };

  const getProjectTitle = (id) => {
    const p = projects.find((p) => p.id === id);
    return p ? p.title : id;
  };

  const avg = (eval_) => {
    const vals = criteria.map((c) => eval_[c.key] || 0);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const completionPct = myEvaluations.length > 0
    ? Math.min(100, Math.round((myEvaluations.length / (myEvaluations.length + 5)) * 100))
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Avaliações</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Avaliação de Projetos</h1>
          <p className="text-muted-foreground mt-1">Formulário de Avaliação Técnica · Ciclo 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-none text-xs uppercase font-bold tracking-wider border-2">
            Salvar Rascunho
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProjectId || !declared || createEval.isPending}
            className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider"
          >
            Finalizar Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Project Info + History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Project Selection Card */}
          <div className="bg-white border border-border p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">
              Projeto a Avaliar
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="rounded-none mb-6">
                <SelectValue placeholder="Selecione um projeto aprovado" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {p.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProjectId && (() => {
              const p = projects.find(x => x.id === selectedProjectId);
              return p ? (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-muted">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Equipe</span>
                    <span className="text-sm font-bold">{p.team_name}</span>
                  </div>
                  {p.advisor && (
                    <div className="flex justify-between py-2 border-b border-muted">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orientador</span>
                      <span className="text-sm font-bold">{p.advisor}</span>
                    </div>
                  )}
                  {p.room && (
                    <div className="flex justify-between py-2 border-b border-muted">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Local</span>
                      <span className="text-sm font-bold">{p.room}</span>
                    </div>
                  )}
                  {p.abstract && (
                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">{p.abstract}</p>
                  )}
                </div>
              ) : null;
            })()}
          </div>

          {/* Status Widget */}
          <div className="bg-primary p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
              Status da Avaliação
            </p>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-white">{myEvaluations.length}</span>
              <span className="text-xs font-bold text-white/70">avaliações realizadas</span>
            </div>
            <div className="w-full bg-white/20 h-1 mt-2">
              <div className="bg-white h-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          {/* Evaluation History */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Avaliações Realizadas ({myEvaluations.length})
            </h3>
            {myEvaluations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myEvaluations.map((ev) => (
                  <div key={ev.id} className="bg-white border border-border p-4 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-sm">{getProjectTitle(ev.project_id)}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ev.created_date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1">
                        <Star className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-primary text-sm">{avg(ev)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {criteria.map((c) => (
                        <div key={c.key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate">{c.label.split(" ")[0]}</span>
                          <span className="font-bold ml-2">{ev[c.key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Evaluation Form */}
        <div className="lg:col-span-7 bg-white border border-border">
          <div className="bg-muted/40 border-b border-border px-6 py-5">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2">
              Critérios de Avaliação
            </h3>
          </div>
          <div className="p-8 space-y-10">
            {criteria.map((c, idx) => (
              <section key={c.key}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-base">{idx + 1}. {c.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary font-heading">{scores[c.key]}</span>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={scores[c.key]}
                    onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}
                    className="w-full h-1 bg-muted rounded-none accent-primary cursor-pointer"
                    style={{ accentColor: "hsl(var(--primary))" }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Insuficiente</span>
                    <span>Regular</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </section>
            ))}

            {/* Qualitative Feedback */}
            <section className="pt-6 border-t border-muted">
              <h4 className="font-bold text-base mb-4">Parecer Final do Avaliador</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Pontos Fortes
                  </Label>
                  <Input
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Ex: Excelente escolha de componentes de baixo custo"
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Oportunidades de Melhoria
                  </Label>
                  <Input
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ex: Refinar o encapsulamento contra umidade"
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Feedback Qualitativo Consolidado
                  </Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="rounded-none h-28"
                    placeholder="Descreva sua percepção geral sobre o desempenho do grupo..."
                  />
                </div>
              </div>
            </section>

            {/* Declaration */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-1 accent-primary w-4 h-4"
              />
              <label className="text-sm text-red-800 leading-relaxed cursor-pointer" onClick={() => setDeclared(!declared)}>
                Declaro que realizei a avaliação de forma imparcial, seguindo os critérios estabelecidos
                no regulamento da I Mostra de Projetos Integradores UniSENAI SP.
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedProjectId || !declared || createEval.isPending}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-4 h-auto"
            >
              Finalizar Avaliação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}