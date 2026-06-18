import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Printer, GraduationCap, BookOpen, Star, Trophy, ChevronRight, Lock } from "lucide-react";
import { CertificateService, UserService } from "@/services";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Certificates() {
  const [activeTab, setActiveTab] = useState("my"); // "my" or "rankings"
  const [printData, setPrintData] = useState(null); // certificate details currently selected for print/view
  const [useCustomBg, setUseCustomBg] = useState(true);
  const printRef = useRef(null);
  const { toast } = useToast();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => UserService.me() });

  const { data: rankings = { overallRankings: [], classRankings: {} }, isLoading: isLoadingRankings } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => CertificateService.getRankings(),
  });

  const { data: myCertificates = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => CertificateService.getMyCertificates(),
    enabled: !!user
  });

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isTeacher = isAdmin || user?.role?.toUpperCase() === "TEACHER" || user?.role?.toUpperCase() === "PROFESSOR";

  const handlePrint = () => {
    window.print();
  };

  const openPrintPreview = (cert) => {
    setPrintData(cert);
  };

  const closePrintPreview = () => {
    setPrintData(null);
  };

  // Helper to format recipient list for a project certificate
  const formatMembersList = (members) => {
    if (!Array.isArray(members)) return "";
    return members.map(m => m.name).join(", ");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 print:p-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 16mm 16mm 28mm 16mm !important;
            box-sizing: border-box !important;
            border: none !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            z-index: 99999 !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
      {/* Header (Hidden on print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Certificados</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">Certificados & Premiações</h1>
          <p className="text-muted-foreground mt-1">
            Emissão de certificados de participação, avaliação e destaques da Mostra
          </p>
        </div>
      </div>

      {/* Warning if evaluations are still open */}
      {rankings?.evaluationsOpen && (
        <div className="p-4 border border-amber-300 bg-amber-50 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2 print:hidden animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>O período de avaliações está aberto. Os certificados estarão disponíveis para emissão e impressão assim que o período for encerrado pelo administrador.</span>
        </div>
      )}

      {/* Tabs (Hidden on print) */}
      <div className="flex border-b border-border print:hidden">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "my"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Meus Certificados
        </button>
        <button
          onClick={() => setActiveTab("rankings")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "rankings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Melhores Projetos (Rankings)
        </button>
      </div>

      {/* Tab Content (Hidden on print) */}
      <div className="print:hidden">
        {activeTab === "my" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading">Seus Certificados Disponíveis</h2>
            {isLoadingMy ? (
              <p className="text-muted-foreground">Carregando seus certificados...</p>
            ) : myCertificates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border bg-white">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Você não possui certificados disponíveis para emissão no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCertificates.map((cert, index) => {
                  const isWinner = cert.type === "melhor_projeto";
                  const isLocked = cert.eligible === false;
                  return (
                    <div
                      key={index}
                      className={`bg-white border border-border p-6 flex flex-col justify-between transition-all relative ${isLocked ? "opacity-75 bg-slate-50/50" : "hover:shadow-md"
                        }`}
                    >
                      {isWinner && (
                        <div className="absolute right-4 top-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1 border border-amber-300">
                          <Trophy className="w-3 h-3" /> DESTAQUE
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute right-4 top-4 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1 border border-slate-300">
                          <Lock className="w-3 h-3" /> REQUISITOS PENDENTES
                        </div>
                      )}
                      <div>
                        <div className={`w-12 h-12 flex items-center justify-center mb-4 border ${isLocked
                            ? "bg-slate-100 border-slate-200"
                            : "bg-primary/10 border-primary/20"
                          }`}>
                          {isLocked ? (
                            <Lock className="w-6 h-6 text-slate-400" />
                          ) : (
                            <Award className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <h3 className={`font-bold text-lg font-heading mb-1 ${isLocked ? "text-slate-500" : ""}`}>
                          {cert.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">{cert.description}</p>
                      </div>
                      <div className="border-t border-muted pt-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Destinatário: {cert.recipientName}
                        </span>
                        {!isLocked ? (
                          <Button
                            onClick={() => openPrintPreview(cert)}
                            size="sm"
                            className="bg-primary text-primary-foreground text-xs uppercase font-bold tracking-wider rounded-none gap-1.5"
                          >
                            <Printer className="w-4 h-4" /> Visualizar
                          </Button>
                        ) : (
                          cert.details?.evalsCount !== undefined && (
                            <span className="text-xs font-bold text-destructive">
                              {cert.details.evalsCount} de {cert.details.evalsRequired || 4} concluídos
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "rankings" && (
          <div className="space-y-8">
            <div className="bg-white border border-border p-6">
              <h2 className="text-xl font-bold font-heading mb-2">Painel de Premiações e Classificação</h2>
              <p className="text-sm text-muted-foreground">
                Aqui são listados todos os projetos da Mostra classificados do melhor para o pior. O certificado de melhor por turma é concedido apenas ao 1º colocado (incluindo empates), e na classificação geral aos 3 primeiros colocados (incluindo empates).
              </p>
            </div>

            {isLoadingRankings ? (
              <p className="text-muted-foreground">Carregando rankings e premiações...</p>
            ) : (
              <div className="space-y-8">
                {/* Overall Rankings */}
                <div className="bg-white border border-border">
                  <div className="bg-muted/40 border-b border-border px-6 py-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base uppercase tracking-wider">Classificação Geral (do melhor para o pior)</h3>
                  </div>
                  {rankings.overallRankings?.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground">Nenhum projeto avaliado com pontuação suficiente ainda.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {rankings.overallRankings.map((p, idx) => (
                        <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/10 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">
                                {p.project_number ? `#${p.project_number} - ` : ""}
                                {p.title}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                                p.isOverallWinner 
                                  ? "bg-amber-100 text-amber-800 border-amber-300" 
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}>
                                {p.rank}º LUGAR GERAL
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Equipe: <strong className="text-foreground">{p.team_name}</strong> · Orientador: {p.advisor} · Turma: {p.className}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80">
                              Integrantes: {formatMembersList(p.members)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5">
                              <Star className="w-4 h-4 text-primary" />
                              <span className="font-bold text-primary text-sm">{p.score.toFixed(2)}</span>
                            </div>
                            {isTeacher && p.isOverallWinner && (
                              <Button
                                onClick={() => openPrintPreview({
                                  type: "melhor_projeto",
                                  title: "Certificado de Destaque / Melhor Projeto",
                                  recipientName: formatMembersList(p.members),
                                  details: {
                                    projectTitle: p.title,
                                    teamName: p.team_name,
                                    category: "Geral",
                                    score: p.score
                                  }
                                })}
                                disabled={rankings.evaluationsOpen && !isAdmin}
                                title={rankings.evaluationsOpen && !isAdmin ? "Disponível apenas após o encerramento do período de avaliações" : ""}
                                size="sm"
                                variant="outline"
                                className="rounded-none text-xs uppercase font-bold gap-1.5 border-2 hover:bg-primary hover:text-primary-foreground"
                              >
                                <Printer className="w-4 h-4" /> Certificado
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Class Rankings */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg font-heading">Classificação por Turma</h3>
                  {Object.keys(rankings.classRankings || {}).length === 0 ? (
                    <div className="bg-white border border-border p-6 text-center text-muted-foreground">
                      Nenhum ranking por turma gerado ainda.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(rankings.classRankings).map(([className, classProjects]) => (
                        <div key={className} className="bg-white border border-border">
                          <div className="bg-muted/30 border-b border-border px-6 py-3">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Turma: {className}</h4>
                          </div>
                          {classProjects.length === 0 ? (
                            <p className="p-4 text-xs text-muted-foreground">Sem dados de avaliações nesta turma.</p>
                          ) : (
                            <div className="divide-y divide-border">
                              {classProjects.map((p, idx) => (
                                <div key={p.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/10 transition-colors">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-sm">
                                        {p.project_number ? `#${p.project_number} - ` : ""}
                                        {p.title}
                                      </span>
                                      <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                                        p.isClassWinner 
                                          ? "bg-blue-100 text-blue-800 border-blue-300" 
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      }`}>
                                        {p.rank}º LUGAR NA TURMA
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Equipe: <strong className="text-foreground">{p.team_name}</strong> · Orientador: {p.advisor}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/80">
                                      Integrantes: {formatMembersList(p.members)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                                    <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1">
                                      <Star className="w-3.5 h-3.5 text-primary" />
                                      <span className="font-bold text-primary text-xs">{p.score.toFixed(2)}</span>
                                    </div>
                                    {isTeacher && p.isClassWinner && (
                                      <Button
                                        onClick={() => openPrintPreview({
                                          type: "melhor_projeto",
                                          title: "Certificado de Destaque / Melhor Projeto",
                                          recipientName: formatMembersList(p.members),
                                          details: {
                                            projectTitle: p.title,
                                            teamName: p.team_name,
                                            category: `Turma ${className}`,
                                            score: p.score
                                          }
                                        })}
                                        disabled={rankings.evaluationsOpen && !isAdmin}
                                        title={rankings.evaluationsOpen && !isAdmin ? "Disponível apenas após o encerramento do período de avaliações" : ""}
                                        size="sm"
                                        variant="outline"
                                        className="rounded-none text-xs uppercase font-bold gap-1.5 border-2 hover:bg-primary hover:text-primary-foreground"
                                      >
                                        <Printer className="w-4 h-4" /> Certificado
                                      </Button>
                                    )}
                                  </div>
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
            )}
          </div>
        )}
      </div>

      {/* Print Preview Backdrop and Styles (Hidden during default web view, visible on click or print) */}
      {printData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent overflow-y-auto">
          {/* Controls Bar (Hidden during print) */}
          <div className="absolute top-4 right-4 flex gap-2 print:hidden z-50 bg-black/80 p-2 border border-white/20">
            <Button onClick={handlePrint} className="bg-primary text-primary-foreground text-xs uppercase font-bold tracking-wider rounded-none gap-1">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <Button onClick={closePrintPreview} variant="outline" className="text-white border-white/40 hover:bg-white/10 rounded-none text-xs uppercase font-bold">
              Fechar
            </Button>
          </div>

          {/* Certificate Container */}
          <div
            ref={printRef}
            className={`print-area bg-white text-slate-950 font-serif border-[12px] border-slate-900 shadow-2xl relative flex flex-col justify-between p-16 pb-24 select-none print:shadow-none print:border-none print:m-0 print:p-12`}
            style={{
              width: "297mm",
              height: "210mm",
              backgroundImage: useCustomBg ? "url('/img/certificate_bg.png')" : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Standard elegant CSS border layout (only if NOT using custom background image) */}
            {!useCustomBg && (
              <>
                <div className="absolute inset-2 border-2 border-amber-600 pointer-events-none" />
                <div className="absolute inset-4 border border-amber-600/35 pointer-events-none" />
              </>
            )}

            {/* Content Top */}
            <div className="text-center space-y-4 z-10">
              <h4 className="text-[10px] tracking-[0.25em] font-bold text-amber-700 uppercase font-sans">
                UniSENAI SP - CAMPUS SOROCABA
              </h4>
              <h2 className="text-6xl font-extrabold text-slate-900 tracking-wide uppercase py-4">
                {printData.type === "melhor_projeto" ? "CERTIFICADO DE DESTAQUE" : "CERTIFICADO"}
              </h2>
              <div className="w-32 h-0.5 bg-amber-600 mx-auto" />
            </div>

            {/* Content Body */}
            <div className="text-center px-12 space-y-6 z-10">
              <p className="text-base italic text-slate-700">
                {printData.type === "melhor_projeto" ? "Concedido com honras para" : "Concedido para"}
              </p>
              <h3 className="text-3xl font-bold font-sans text-slate-950 border-b border-muted max-w-2xl mx-auto pb-1">
                {printData.recipientName}
              </h3>

              {printData.type === "participacao" && (
                <p className="text-base text-slate-800 leading-relaxed font-sans px-8">
                  Pela participação ativa na <strong>I Mostra de Projetos Integradores</strong> promovida pelo UniSENAI SP - Campus Sorocaba, realizada no Ciclo de Inovação 2026.
                </p>
              )}

              {printData.type === "avaliador" && (
                <p className="text-base text-slate-800 leading-relaxed font-sans px-8">
                  Pela valiosa cooperação e atuação como <strong>Membro da Banca Examinadora / Avaliador</strong> das apresentações acadêmicas durante a <strong>I Mostra de Projetos Integradores</strong> UniSENAI SP.
                </p>
              )}

              {printData.type === "melhor_projeto" && (
                <div className="space-y-2">
                  <p className="text-base text-slate-800 leading-relaxed font-sans px-8">
                    Pelo excelente desempenho acadêmico, consagrando o projeto <strong>"{printData.details.projectTitle}"</strong> da equipe <strong>"{printData.details.teamName}"</strong> como {printData.details.category === "Geral" ? "um dos 3 melhores projetos" : "o melhor projeto"} da Mostra na categoria <strong>{printData.details.category}</strong>.
                  </p>
                  <p className="text-sm font-sans text-slate-600 font-semibold">
                    Pontuação Média: {printData.details.score.toFixed(2)} / 10.00
                  </p>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="text-center text-sm italic text-slate-700 z-10 pt-4">
              Sorocaba, 18 de junho de 2026
            </div>

            {/* Content Bottom / Signatures */}
            <div className="text-center pt-4 pb-4 z-10 px-16 font-sans">
              <div className="space-y-1 mx-auto max-w-xs flex flex-col items-center">
                <div className="h-12 flex items-end justify-center mb-1">
                  <img src="/img/signature.png" alt="Assinatura Lucas Miguel" className="max-h-12 object-contain select-none" />
                </div>
                <div className="border-b border-slate-400 w-56 mx-auto mb-2" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800">Lucas Miguel Leal da Silva</p>
                <p className="text-[10px] text-slate-500">Coordenador de Campus</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
