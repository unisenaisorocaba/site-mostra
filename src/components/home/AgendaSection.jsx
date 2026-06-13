import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Award, ShieldAlert, BookOpen, Music, Settings, Trophy } from "lucide-react";

export default function AgendaSection() {
  const [activeTab, setActiveTab] = useState(0);

  const scheduleData = [
    {
      day: "Dia 1",
      date: "15/06",
      weekday: "Segunda-feira",
      title: "Organização & Preparação",
      events: [
        {
          time: "Dia Todo",
          title: "Organização e Preparação dos Espaços",
          location: "Bloco B (Piso Superior)",
          icon: <Settings className="w-5 h-5 text-primary" />,
          details: "Dia reservado para a preparação dos ambientes e organização da mostra. Os banners serão instalados nos vidros das salas. Cada equipe receberá um mapa indicando o local correto.",
          points: [
            "Serão disponibilizadas canetas especiais para escrita direta nos vidros.",
            "Grupos podem enriquecer a apresentação com diagramas, fluxogramas, anotações e desenhos nos vidros.",
            "Permitida a utilização de mesas para notebooks, protótipos, maquetes ou outros materiais de demonstração."
          ]
        },
        {
          time: "19h às 22h",
          title: "Apresentação Toyota: Projetos Integradores",
          location: "Auditório do CFP 4.04",
          icon: <Users className="w-5 h-5 text-red-500" />,
          isHighlight: true,
          badge: "Toyota & Parcerias",
          details: "Apresentação integrada dos projetos desenvolvidos em parceria com a empresa Toyota, contando com a presença e participação ativa de representantes da montadora para avaliação."
        }
      ]
    },
    {
      day: "Dia 2",
      date: "16/06",
      weekday: "Terça-feira",
      title: "Apresentações & Avaliações I",
      events: [
        {
          time: "19h às 22h",
          title: "Apresentações e Avaliações Técnicas",
          location: "Salas de Apresentação (Bloco B)",
          icon: <BookOpen className="w-5 h-5 text-primary" />,
          details: "Abertura oficial para visitação dos projetos integradores. Os professores farão a avaliação presencial passando de banca em banca ao longo do período.",
          points: [
            "O banner/espaço da equipe não deve ficar sem representantes em nenhum momento.",
            "Organize um revezamento entre os integrantes do grupo."
          ]
        },
        {
          time: "Disponível na Plataforma",
          title: "Missão Diária: Avaliação Cruzada",
          location: "Todo o Campus",
          icon: <Users className="w-5 h-5 text-emerald-600" />,
          details: "Cada estudante receberá uma missão diária na plataforma para visitar e realizar a avaliação cruzada de projetos de outros grupos, fomentando a integração acadêmica."
        }
      ]
    },
    {
      day: "Dia 3",
      date: "17/06",
      weekday: "Quarta-feira",
      title: "Apresentações & Vozes que Cuidam",
      events: [
        {
          time: "19h30 às 20h00",
          title: "Apresentação Especial: Coral Vozes que Cuidam",
          location: "Salão Social",
          icon: <Music className="w-5 h-5 text-purple-600" />,
          isHighlight: true,
          badge: "Projeto de Extensão",
          details: "Apresentação musical emocionante do Coral da Faculdade, um projeto de extensão integrado por alunos, professores e colaboradores da nossa instituição."
        },
        {
          time: "20h00 às 22h00",
          title: "Continuidade das Apresentações e Avaliações",
          location: "Salas de Apresentação (Bloco B)",
          icon: <BookOpen className="w-5 h-5 text-primary" />,
          details: "Retomada das apresentações dos projetos integradores para os professores avaliadores e visitantes gerais."
        }
      ]
    },
    {
      day: "Dia 4",
      date: "18/06",
      weekday: "Quinta-feira",
      title: "Encerramento & Premiações",
      events: [
        {
          time: "19h00 às 20h30",
          title: "Competição de Protótipos de Energia Potencial",
          location: "Quadra Poliesportiva",
          icon: <Trophy className="w-5 h-5 text-amber-500" />,
          isHighlight: true,
          badge: "Competição Especial",
          details: "Espetacular reprise da competição de protótipos movidos exclusivamente a energia potencial, desenvolvidos e testados pelos estudantes sob supervisão do Prof. Diego."
        },
        {
          time: "20h30 às 22h00",
          title: "Cerimônia de Encerramento e Premiação Geral",
          location: "Salão Social",
          icon: <Award className="w-5 h-5 text-primary" />,
          isHighlight: true,
          badge: "Destaques",
          details: "Cerimônia de encerramento da I Mostra de Projetos Integradores com entrega de premiações e certificados de destaque institucional:",
          points: [
            "🏆 Classificação Geral: Premiação de destaque para os 1º, 2º e 3º Lugares Gerais da Mostra.",
            "⭐ Destaque por Turma: Reconhecimento ao melhor projeto de cada turma participante.",
            "📜 Certificação: Envio de certificados de participação para todos os estudantes do evento."
          ]
        }
      ]
    }
  ];

  return (
    <section className="bg-muted/30 border-y border-border py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">
            Programação Completa
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading uppercase">
            Agenda do Evento
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Acompanhe o cronograma de atividades, apresentações, intervenções culturais e cerimônias de premiação da Mostra.
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
          {scheduleData.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`p-4 border text-left transition-all relative rounded-none ${activeTab === idx
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-muted-foreground border-border hover:border-primary/50"
                }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === idx ? "text-white/80" : "text-primary"}`}>
                  {tab.day}
                </span>
                <span className="text-xs font-semibold">{tab.date}</span>
              </div>
              <div className="mt-2">
                <p className="font-bold uppercase tracking-tight text-xs md:text-sm line-clamp-1">
                  {tab.weekday}
                </p>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${activeTab === idx ? "text-white/70" : "text-muted-foreground"}`}>
                  {tab.title}
                </p>
              </div>
              {activeTab === idx && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 hidden md:block" />
              )}
            </button>
          ))}
        </div>

        {/* Events details area */}
        <div className="bg-white border border-border p-6 md:p-10 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

          <div className="space-y-12">
            {scheduleData[activeTab].events.map((event, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* Time section */}
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs md:text-sm md:w-44 shrink-0">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{event.time}</span>
                </div>

                {/* Event node line */}
                <div className="hidden md:flex flex-col items-center self-stretch shrink-0">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center bg-white ${event.isHighlight ? "border-primary shadow-sm bg-primary/5" : "border-border"
                    }`}>
                    {event.icon}
                  </div>
                  {idx !== scheduleData[activeTab].events.length - 1 && (
                    <div className="w-px bg-border flex-grow mt-4 min-h-[50px]" />
                  )}
                </div>

                {/* Content description */}
                <div className="flex-grow space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold font-heading uppercase text-foreground">
                      {event.title}
                    </h3>
                    {event.badge && (
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${event.title.includes("Toyota")
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                        {event.badge}
                      </span>
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.details}
                  </p>

                  {event.points && (
                    <ul className="space-y-2 pt-2">
                      {event.points.map((pt, pIdx) => (
                        <li key={pIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 select-none">▪</span>
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
