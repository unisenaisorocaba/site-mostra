import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, ChevronRight, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProjectService, EvaluationService, CriteriaService, UserService } from "@/services";

// Fixed criteria for student banner evaluations
const BANNER_CRITERIA = [
  { key: "criteria_organization", label: "Organização Visual", description: "Distribuição dos elementos, alinhamento e facilidade de leitura." },
  { key: "criteria_clarity", label: "Clareza das Informações", description: "Objetivos, solução e resultados são compreensíveis ao leitor." },
  { key: "criteria_design", label: "Qualidade do Design", description: "Uso adequado de cores, imagens, gráficos e identidade visual." },
  { key: "criteria_objectivity", label: "Objetividade do Conteúdo", description: "Informações relevantes apresentadas de forma concisa, sem excesso de texto." },
  { key: "criteria_impact", label: "Impacto e Atratividade", description: "O banner desperta interesse e comunica bem a proposta do projeto." },
];

export default function Evaluations() {
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get("projectId");

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedListIds, setSelectedListIds] = useState([]);

  useEffect(() => {
    if (queryProjectId) {
      setSelectedProjectId(queryProjectId);
    }
  }, [queryProjectId]);
  const [dynamicScores, setDynamicScores] = useState({});
  const [bannerScores, setBannerScores] = useState({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
  const [comments, setComments] = useState("");
  const [declared, setDeclared] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => UserService.me() });
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => UserService.myProfile(),
    enabled: !!user,
  });

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isTeacher = isAdmin || profile?.user_type === "professor";

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-for-eval"],
    queryFn: () => ProjectService.listApproved(),
  });

  const filteredProjects = projects.filter((p) => {
    if (user) {
      const isCreator = p.created_by === user.email;
      const isMember = (p.members || []).some((m) => m.email === user.email);
      if (isCreator || isMember) return false;
    }
    return true;
  });

  const { data: myCriteriaLists = [] } = useQuery({
    queryKey: ["my-criteria-lists", user?.email],
    queryFn: () => CriteriaService.listMine(),
    enabled: !!user && isTeacher,
  });

  const { data: myEvaluations = [] } = useQuery({
    queryKey: ["my-evaluations"],
    queryFn: () => EvaluationService.listMine(),
  });

  const selectedLists = myCriteriaLists.filter((l) => selectedListIds.includes(l.id));
  const allSelectedCriteria = selectedLists.flatMap((list) =>
    (list.criteria || []).map((c, i) => ({ ...c, _key: `${list.id}__${i}`, _listName: list.name }))
  );

  useEffect(() => {
    setSelectedListIds([]);
    setDynamicScores({});
    setBannerScores({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
  }, [selectedProjectId]);

  const addList = (listId) => {
    if (!listId || selectedListIds.includes(listId)) return;
    setSelectedListIds((prev) => [...prev, listId]);
  };

  const removeList = (listId) => {
    setSelectedListIds((prev) => prev.filter((id) => id !== listId));
    const list = myCriteriaLists.find((l) => l.id === listId);
    if (list) {
      const keysToRemove = (list.criteria || []).map((_, i) => `${listId}__${i}`);
      setDynamicScores((prev) => {
        const next = { ...prev };
        keysToRemove.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const createEval = useMutation({
    mutationFn: (data) => EvaluationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });
      toast({ title: "Avaliação finalizada com sucesso!" });
      setSelectedProjectId("");
      setSelectedListIds([]);
      setDynamicScores({});
      setBannerScores({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
      setComments("");
      setDeclared(false);
    },
  });

  const handleSubmit = () => {
    if (!selectedProjectId || !declared) return;
    if (isTeacher) {
      if (allSelectedCriteria.length === 0) {
        toast({ title: "Selecione ao menos uma lista de critérios!", variant: "destructive" });
        return;
      }
      const criteriaScores = allSelectedCriteria.map((c) => ({
        criteria_id: c._key,
        criteria_name: `[${c._listName}] ${c.name}`,
        score: dynamicScores[c._key] ?? 5,
      }));
      createEval.mutate({ project_id: selectedProjectId, criteria_scores: criteriaScores, comments, evaluation_type: "professor" });
    } else {
      createEval.mutate({ project_id: selectedProjectId, ...bannerScores, comments, evaluation_type: "aluno" });
    }
  };

  const getProjectTitle = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return id;
    return p.project_number ? `#${p.project_number} - ${p.title}` : p.title;
  };
  const canSubmit = selectedProjectId && declared && (isTeacher ? allSelectedCriteria.length > 0 : true);
  const availableLists = myCriteriaLists.filter((l) => !selectedListIds.includes(l.id) && (l.criteria || []).length > 0);

  return (
    <div>
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
          <div className="bg-white border border-border p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Projeto a Avaliar</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="rounded-none mb-4">
                <SelectValue placeholder="Selecione um projeto aprovado" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.project_number ? `#${p.project_number} - ` : ""}
                    {p.title} — {p.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProjectId && (() => {
              const p = filteredProjects.find((x) => x.id === selectedProjectId);
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

          <div className="bg-primary p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">Status da Avaliação</p>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-white">{myEvaluations.length}</span>
              <span className="text-xs font-bold text-white/70">avaliações realizadas</span>
            </div>
          </div>

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
                        <span className="font-bold text-primary text-sm">{EvaluationService.average(ev)}</span>
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
                        {(ev.criteria_organization !== undefined && ev.criteria_organization !== null ? BANNER_CRITERIA : [
                          { key: "criteria_innovation", label: "Inovação" },
                          { key: "criteria_technical", label: "Técnico" },
                          { key: "criteria_presentation", label: "Apresentação" },
                          { key: "criteria_relevance", label: "Relevância" },
                        ]).map((c) => (
                          <div key={c.key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground truncate">{c.label.split(" ")[0]}</span>
                            <span className="font-bold ml-2">{ev[c.key] ?? "—"}</span>
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

        {/* Right Panel */}
        <div className="lg:col-span-7 bg-white border border-border">
          <div className="bg-muted/40 border-b border-border px-6 py-5">
            <h3 className="text-lg font-bold font-heading">
              {isTeacher ? "Selecione as Listas de Critérios e Avalie" : "Critérios de Avaliação de Banner"}
            </h3>
          </div>

          <div className="p-8 space-y-8">
            {isTeacher ? (
              <>
                {myCriteriaLists.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-2">Você ainda não tem listas de critérios cadastradas.</p>
                    <a href="/dashboard/criterios" className="text-primary text-sm font-bold underline">Cadastrar listas</a>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Listas Selecionadas</Label>
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
                        {selectedLists.map((list) => (
                          <span key={list.id} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                            {list.name} ({list.criteria?.length || 0})
                            <button onClick={() => removeList(list.id)} className="hover:text-destructive transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {selectedListIds.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">Nenhuma lista adicionada</span>
                        )}
                      </div>
                      {availableLists.length > 0 && (
                        <Select value="" onValueChange={(val) => addList(val)}>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="+ Adicionar lista de critérios..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLists.map((list) => (
                              <SelectItem key={list.id} value={list.id}>
                                {list.name} ({list.criteria?.length || 0} critérios)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {availableLists.length === 0 && selectedListIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">Todas as suas listas já foram adicionadas.</p>
                      )}
                    </div>

                    {allSelectedCriteria.length > 0 && (
                      <div className="space-y-10 pt-4 border-t border-muted">
                        {selectedLists.map((list) => (
                          <div key={list.id}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 pb-2 border-b border-muted">
                              {list.name} · {list.criteria?.length} critério{list.criteria?.length !== 1 ? "s" : ""}
                            </p>
                            <div className="space-y-8">
                              {(list.criteria || []).map((c, idx) => {
                                const key = `${list.id}__${idx}`;
                                const score = dynamicScores[key] ?? 5;
                                return (
                                  <section key={key}>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1 pr-4">
                                        <h4 className="font-bold text-base">{idx + 1}. {c.name}</h4>
                                        {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                                        <span className="text-[10px] font-bold text-muted-foreground">Peso {c.weight || 1}x</span>
                                      </div>
                                      <span className="text-2xl font-bold text-primary font-heading">{score}</span>
                                    </div>
                                    <input type="range" min={0} max={10} step={1} value={score}
                                      onChange={(e) => setDynamicScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
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
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
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

            <section className="pt-6 border-t border-muted">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Comentários / Parecer Final</Label>
              <Textarea value={comments} onChange={(e) => setComments(e.target.value)}
                className="rounded-none h-28" placeholder="Descreva sua percepção geral sobre o projeto..." />
            </section>

            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100">
              <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
              <label className="text-sm text-red-800 leading-relaxed cursor-pointer" onClick={() => setDeclared(!declared)}>
                Declaro que realizei a avaliação de forma imparcial, seguindo os critérios estabelecidos
                no regulamento da I Mostra de Projetos Integradores UniSENAI SP - Campus Sorocaba.
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