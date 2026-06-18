import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, ChevronRight, X, Pencil } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProjectService from "@/services/projectService";
import EvaluationService from "@/services/evaluationService";
import CriteriaService from "@/services/criteriaService";
import UserService from "@/services/userService";
import AssignmentService from "@/services/assignmentService";
import PhotoService from "@/services/photoService";
import SettingService from "@/services/settingService";

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
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      toast({ title: "Período de avaliações atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar período: " + err.message, variant: "destructive" });
    }
  });

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

  const { data: assignmentsRes } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => AssignmentService.listMine(),
    enabled: !!user && !isTeacher,
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

  const assignmentsData = assignmentsRes?.data || [];
  const assignmentMessage = assignmentsRes?.message || "";

  const evaluatedIds = myEvaluations.map(ev => ev.project_id);

  const filteredProjects = isTeacher
    ? projects.filter((p) => {
      if (user) {
        const isCreator = p.created_by === user.email;
        const isMember = (p.members || []).some((m) => m.email === user.email);
        if (isCreator || isMember) return false;
      }
      if (evaluatedIds.includes(p.id) && p.id !== selectedProjectId) return false;
      return true;
    })
    : assignmentsData.map(a => a.project).filter(Boolean).filter((p) => {
      if (evaluatedIds.includes(p.id) && p.id !== selectedProjectId) return false;
      return true;
    });

  const projectsByClass = useMemo(() => {
    const groups = {};
    filteredProjects.forEach((p) => {
      const className = p.className || "Sem Turma";
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(p);
    });
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {});
  }, [filteredProjects]);

  const selectedLists = myCriteriaLists.filter((l) => selectedListIds.includes(l.id));
  const allSelectedCriteria = selectedLists.flatMap((list) =>
    (list.criteria || []).map((c, i) => ({ ...c, _key: `${list.id}__${i}`, _listName: list.name }))
  );

  const existingEval = selectedProjectId ? myEvaluations.find((ev) => ev.project_id === selectedProjectId) : null;

  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedListIds([]);
      setDynamicScores({});
      setBannerScores({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
      setComments("");
      return;
    }

    if (existingEval) {
      setComments(existingEval.comments || "");
      if (isTeacher) {
        if (existingEval.criteria_scores && Array.isArray(existingEval.criteria_scores)) {
          const scoresObj = {};
          const listIds = [];
          existingEval.criteria_scores.forEach((cs) => {
            scoresObj[cs.criteria_id] = cs.score;
            const parts = cs.criteria_id.split("__");
            if (parts.length > 0 && !listIds.includes(parts[0])) {
              listIds.push(parts[0]);
            }
          });
          setSelectedListIds(listIds);
          setDynamicScores(scoresObj);
        }
      } else {
        setBannerScores({
          criteria_organization: existingEval.criteria_organization ?? 5,
          criteria_clarity: existingEval.criteria_clarity ?? 5,
          criteria_design: existingEval.criteria_design ?? 5,
          criteria_objectivity: existingEval.criteria_objectivity ?? 5,
          criteria_impact: existingEval.criteria_impact ?? 5,
        });
      }
    } else {
      setSelectedListIds([]);
      setDynamicScores({});
      setBannerScores({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
      setComments("");
    }
  }, [selectedProjectId, myEvaluations, isTeacher]);

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
      toast({ title: existingEval ? "Avaliação atualizada com sucesso!" : "Avaliação finalizada com sucesso!" });
      setSelectedProjectId("");
      setSelectedListIds([]);
      setDynamicScores({});
      setBannerScores({ criteria_organization: 5, criteria_clarity: 5, criteria_design: 5, criteria_objectivity: 5, criteria_impact: 5 });
      setComments("");
      setDeclared(false);
      setPhotoFile(null);
    },
    onError: (err) => {
      toast({
        title: "Erro ao salvar avaliação",
        description: err.response?.data?.error || err.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async () => {
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
      // const isFirstEvaluation = myEvaluations.length === 0;
      // if (isFirstEvaluation && !photoFile) {
      //   toast({ title: "Foto Obrigatória", description: "Na sua primeira avaliação, é necessário enviar uma foto de comprovação.", variant: "destructive" });
      //   return;
      // }

      if (photoFile) {
        setUploadingPhoto(true);
        try {
          await PhotoService.upload({
            file: photoFile,
            caption: "Comprovação de Presença - Avaliação",
            category: "apresentacoes"
          });
        } catch (err) {
          toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
          setUploadingPhoto(false);
          return;
        }
        setUploadingPhoto(false);
      }

      createEval.mutate({ project_id: selectedProjectId, ...bannerScores, comments, evaluation_type: "aluno" });
    }
  };

  const getProjectTitle = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return id;
    const turmaStr = p.className ? `[${p.className}] ` : "";
    return p.project_number ? `#${p.project_number} - ${turmaStr}${p.title}` : `${turmaStr}${p.title}`;
  };

  const isFirstEvaluation = myEvaluations.length === 0;
  const buttonText = uploadingPhoto
    ? "Enviando Foto..."
    : (existingEval ? "Atualizar Avaliação" : "Finalizar Avaliação");
  const canSubmit = selectedProjectId && declared && (isTeacher ? allSelectedCriteria.length > 0 : true) && evalsOpen;
  // const canSubmit = selectedProjectId && declared && (isTeacher ? allSelectedCriteria.length > 0 : true) && (!isFirstEvaluation || photoFile || isTeacher);
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
         <Button onClick={handleSubmit} disabled={!canSubmit || createEval.isPending || uploadingPhoto || !evalsOpen}
          className="bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider">
          {buttonText}
        </Button>
      </div>

      {/* System Settings / Lock Evaluations (Visible to admin only) */}
      {isAdmin && (
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
      )}

      {/* Evaluations Closed Notice (Visible to students/teachers when evaluations are closed) */}
      {!evalsOpen && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-950 text-xs sm:text-sm font-bold flex items-center gap-2 mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span>O período de avaliações e edições foi encerrado pelo administrador.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-border p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Projeto a Avaliar</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!evalsOpen}>
              <SelectTrigger className="rounded-none mb-4">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(projectsByClass).map(([className, classProjects]) => (
                  <SelectGroup key={className}>
                    <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 px-2 py-1.5">
                      {className}
                    </SelectLabel>
                    {classProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.project_number ? `#${p.project_number} - ` : ""}
                        {p.title} {p.team_name ? `— ${p.team_name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800 mb-4">
              Caso o projeto não esteja exposto, a recomendação é atribuir nota 0 em todos os critérios.
              Caso o projeto esteja exposto, mas não haja nenhum integrante disponível para apresentar ou
              esclarecer dúvidas, a avaliação poderá ser realizada com dedução de nota, a critério do avaliador.
            </div>

            {!isTeacher && assignmentMessage && filteredProjects.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 mb-4">
                {assignmentMessage}
              </div>
            )}

            {!isTeacher && !assignmentMessage && filteredProjects.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 mb-4">
                Você não possui projetos atribuídos para avaliar hoje.
              </div>
            )}
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
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-sm truncate" title={getProjectTitle(ev.project_id)}>
                          {getProjectTitle(ev.project_id)}
                        </h4>
                        <span className="text-xs text-muted-foreground">{new Date(ev.created_date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 hover:text-primary rounded-none border border-border"
                          onClick={() => setSelectedProjectId(ev.project_id)}
                          title="Editar Avaliação"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1">
                          <Star className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-bold text-primary text-xs">{EvaluationService.average(ev)}</span>
                        </div>
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
                        <Select value="" onValueChange={(val) => addList(val)} disabled={!evalsOpen}>
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
                                      disabled={!evalsOpen}
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
                      disabled={!evalsOpen}
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
                className="rounded-none h-28" placeholder="Descreva sua percepção geral sobre o projeto..." disabled={!evalsOpen} />
            </section>

            {!isTeacher && (
              <section className="pt-6 border-t border-muted">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Comprovação de Presença</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-muted/20 border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1">Selfie / Foto na Escola</p>
                    <p className="text-xs text-muted-foreground">
                      {/* {isFirstEvaluation
                        ? "Na sua primeira avaliação, é obrigatório anexar uma foto comprovando sua presença."
                        : "Você já enviou sua foto de comprovação hoje. O envio em novas avaliações é opcional."} */}
                      Suba a foto comprovação diretamente no menu de fotos.
                    </p>
                  </div>
                  {/* <label className="cursor-pointer shrink-0 w-full sm:w-auto">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
                    <span className={`flex justify-center px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${photoFile ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border hover:border-primary text-muted-foreground hover:text-primary'}`}>
                      {photoFile ? "✓ Foto Selecionada" : "Tirar Foto"}
                    </span>
                  </label> */}
                </div>
              </section>
            )}

            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100">
              <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} disabled={!evalsOpen} className="mt-1 accent-primary w-4 h-4" />
              <label className="text-sm text-red-800 leading-relaxed cursor-pointer" onClick={() => setDeclared(!declared)}>
                Declaro que realizei a avaliação de forma imparcial, seguindo os critérios estabelecidos
                no regulamento da I Mostra de Projetos Integradores UniSENAI SP - Campus Sorocaba.
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit || createEval.isPending || uploadingPhoto || !evalsOpen}
              className="w-full bg-primary text-primary-foreground rounded-none text-xs uppercase font-bold tracking-wider py-4 h-auto">
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}