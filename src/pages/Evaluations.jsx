import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, ChevronRight, CheckSquare, Square } from "lucide-react";

// Fixed criteria for student banner evaluations
const BANNER_CRITERIA = [
  { key: "criteria_innovation", label: "Inovação Técnica e Originalidade", description: "O quão único é o projeto em relação às soluções existentes no mercado industrial?" },
  { key: "criteria_technical", label: "Rigor Metodológico", description: "Qualidade da fundamentação teórica e aplicação de normas técnicas." },
  { key: "criteria_presentation", label: "Qualidade da Apresentação", description: "Clareza, organização e comunicação do projeto e dos resultados." },
  { key: "criteria_relevance", label: "Potencial de Impacto Industrial", description: "Escalabilidade e viabilidade econômica da implementação proposta." },
];

export default function Evaluations() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState([]);
  const [dynamicScores, setDynamicScores] = useState({});
  const [bannerScores, setBannerScores] = useState({ criteria_innovation: 5, criteria_technical: 5, criteria_presentation: 5, criteria_relevance: 5 });
  const [comments, setComments] = useState("");
  const [declared, setDeclared] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }, null, 1),
    enabled: !!user,
    initialData: [],
  });

  const profile = myProfile?.[0];
  const isAdmin = user?.role === "admin";
  const isTeacher = isAdmin || profile?.user_type === "professor";

  const { data: projects } = useQuery({
    queryKey: ["projects-for-eval"],
    queryFn: () => base44.entities.Project.filter({ status: "aprovado" }),
    initialData: [],
  });

  const { data: myCriteria } = useQuery({
    queryKey: ["my-criteria", user?.email],
    queryFn: () => base44.entities.EvaluationCriteria.filter({ owner_email: user.email }, "name"),
    enabled: !!user && isTeacher,
    initialData: [],
  });

  const { data: myEvaluations } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Evaluation.filter({ created_by: u.email }, "-created_date");
    },
    initialData: [],
  });

  // Reset criteria selection and scores when project changes
  useEffect(() => {
    setSelectedCriteriaIds([]);
    setDynamicScores({});
    setBannerScores({ criteria_innovation: 5, criteria_technical: 5, criteria_presentation: 5, criteria_relevance: 5 });
  }, [selectedProjectId]);

  const toggleCriteria = (id) => {
    setSelectedCriteriaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setDynamicScores((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 5 };
    });
  };

  const createEval = useMutation({
    mutationFn: async (data) => {
      const u = await base44.auth.me();
      return base44.entities.Evaluation.create({ ...data, evaluator_name: u.full_name || u.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });
      toast({ title: "Avaliação finalizada com sucesso!" });
      setSelectedProjectId("");
      setSelectedCriteriaIds([]);
      setDynamicScores({});
      setBannerScores({ criteria_innovation: 5, criteria_technical: 5, criteria_presentation: 5, criteria_relevance: 5 });
      setComments("");
      setDeclared(false);
    },
  });

  const handleSubmit = () => {
    if (!selectedProjectId || !declared) return;

    if (isTeacher) {
      if (selectedCriteriaIds.length === 0) {
        toast({ title: "Selecione pelo menos um critério!", variant: "destructive" });
        return;
      }
      const criteriaScores = selectedCriteriaIds.map((id) => {
        const c = myCriteria.find((x) => x.id === id);
        return { criteria_id: id, criteria_name: c?.name || id, score: dynamicScores[id] ?? 5 };
      });
      createEval.mutate({ project_id: selectedProjectId, criteria_scores: criteriaScores, comments, evaluation_type: "professor" });
    } else {
      createEval.mutate({ project_id: selectedProjectId, ...bannerScores, comments, evaluation_type: "aluno" });
    }
  };

  const getProjectTitle = (id) => {
    const p = projects.find((p) => p.id === id);
    return p ? p.title : id;
  };

  const avgEval = (ev) => {
    if (ev.evaluation_type === "professor" && ev.criteria_scores?.length > 0) {
      const sum = ev.criteria_scores.reduce((a, b) => a + (b.score || 0), 0);
      return (sum / ev.criteria_scores.length).toFixed(1);
    }
    const vals = BANNER_CRITERIA.map((c) => ev[c.key] || 0).filter((v) => v > 0);
    if (vals.length === 0) return "—";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const canSubmit = selectedProjectId && declared && (isTeacher ? selectedCriteriaIds.length > 0 : true);

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
          <p className="text-muted-foreground mt-1">
            {isTeacher ? "Avaliação com critérios personalizados · Professor" : "Avaliação de Banner · Aluno"}
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={!canSubmit || createEval.isPending}
          className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider">
          Finalizar Avaliação
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Project Selection */}
          <div className="bg-white border border-border p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Projeto a Avaliar</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="rounded-none mb-4">
                <SelectValue placeholder="Selecione um projeto aprovado" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title} — {p.team_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProjectId && (() => {
              const p = projects.find((x) => x.id === selectedProjectId);
              return p ? (
                <div className="space-y-2">
                  {[["Equipe", p.team_name], ["Orientador", p.advisor], ["Local", p.room]].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-muted">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                  ))}
                  {p.abstract && <p className="text-sm text-muted-foreground leading-relaxed pt-2">{p.abstract}</p>}
                </div>
              ) : null;
            })()}
          </div>

          {/* Status Widget */}
          <div className="bg-primary p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">Status da Avaliação</p>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-white">{myEvaluations.length}</span>
              <span className="text-xs font-bold text-white/70">avaliações realizadas</span>
            </div>
          </div>

          {/* History */}
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-sm">{getProjectTitle(ev.project_id)}</h4>
                        <span className="text-xs text-muted-foreground">{new Date(ev.created_date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1">
                        <Star className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-primary text-sm">{avgEval(ev)}</span>
                      </div>
                    </div>
                    {ev.evaluation_type === "professor" && ev.criteria_scores?.length > 0 ? (
                      <div className="space-y-1">
                        {ev.criteria_scores.map((cs) => (
                          <div key={cs.criteria_id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground truncate">{cs.criteria_name}</span>
                            <span className="font-bold ml-2">{cs.score}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {BANNER_CRITERIA.map((c) => (
                          <div key={c.key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground truncate">{c.label.split(" ")[0]}</span>
                            <span className="font-bold ml-2">{ev[c.key]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Evaluation Form */}
        <div className="lg:col-span-7 bg-white border border-border">
          <div className="bg-muted/40 border-b border-border px-6 py-5">
            <h3 className="text-lg font-bold font-heading">
              {isTeacher ? "Selecione os Critérios e Avalie" : "Critérios de Avaliação de Banner"}
            </h3>
          </div>

          <div className="p-8 space-y-8">
            {/* TEACHER: dynamic criteria selection + scoring */}
            {isTeacher ? (
              <>
                {myCriteria.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-2">Você ainda não tem critérios cadastrados.</p>
                    <a href="/dashboard/criterios" className="text-primary text-sm font-bold underline">Cadastrar critérios</a>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Escolha os critérios para este projeto
                      </p>
                      <div className="space-y-2">
                        {myCriteria.map((c) => {
                          const selected = selectedCriteriaIds.includes(c.id);
                          return (
                            <button key={c.id} onClick={() => toggleCriteria(c.id)}
                              className={`w-full text-left p-4 border-2 transition-all flex items-start gap-3 ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                              {selected ? <CheckSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                              <div>
                                <span className="font-bold text-sm block">{c.name}</span>
                                {c.description && <span className="text-xs text-muted-foreground">{c.description}</span>}
                              </div>
                              <span className="ml-auto text-[10px] font-bold text-muted-foreground flex-shrink-0">Peso {c.weight || 1}x</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Score sliders for selected criteria */}
                    {selectedCriteriaIds.length > 0 && (
                      <div className="space-y-8 pt-4 border-t border-muted">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notas</p>
                        {selectedCriteriaIds.map((id, idx) => {
                          const c = myCriteria.find((x) => x.id === id);
                          const score = dynamicScores[id] ?? 5;
                          return (
                            <section key={id}>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 pr-4">
                                  <h4 className="font-bold text-base">{idx + 1}. {c?.name}</h4>
                                  {c?.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                                </div>
                                <span className="text-2xl font-bold text-primary font-heading">{score}</span>
                              </div>
                              <input type="range" min={0} max={10} step={1} value={score}
                                onChange={(e) => setDynamicScores((prev) => ({ ...prev, [id]: Number(e.target.value) }))}
                                className="w-full h-1 bg-muted rounded-none cursor-pointer"
                                style={{ accentColor: "hsl(var(--primary))" }}
                              />
                              <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span>Insuficiente</span><span>Regular</span><span>Excelente</span>
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* STUDENT: fixed banner criteria */
              <div className="space-y-8">
                {BANNER_CRITERIA.map((c, idx) => (
                  <section key={c.key}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-base">{idx + 1}. {c.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      </div>
                      <span className="text-2xl font-bold text-primary font-heading">{bannerScores[c.key]}</span>
                    </div>
                    <input type="range" min={0} max={10} step={1} value={bannerScores[c.key]}
                      onChange={(e) => setBannerScores((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
                      className="w-full h-1 bg-muted rounded-none cursor-pointer"
                      style={{ accentColor: "hsl(var(--primary))" }}
                    />
                    <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Insuficiente</span><span>Regular</span><span>Excelente</span>
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* Comments */}
            <section className="pt-6 border-t border-muted">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                Comentários / Parecer Final
              </Label>
              <Textarea value={comments} onChange={(e) => setComments(e.target.value)}
                className="rounded-none h-28" placeholder="Descreva sua percepção geral sobre o projeto..." />
            </section>

            {/* Declaration */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100">
              <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)}
                className="mt-1 accent-primary w-4 h-4" />
              <label className="text-sm text-red-800 leading-relaxed cursor-pointer" onClick={() => setDeclared(!declared)}>
                Declaro que realizei a avaliação de forma imparcial, seguindo os critérios estabelecidos
                no regulamento da I Mostra de Projetos Integradores UniSENAI SP.
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit || createEval.isPending}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-4 h-auto">
              Finalizar Avaliação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}