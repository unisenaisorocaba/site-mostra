import React from "react";
import amorInclusivoImg from "../public/Amor Inclusivo.jpg";
import coralImg from "../public/Coral.png";
import colmeiaImg from "../public/Colmeia.png";

const projects = [
  {
    title: "Amor Inclusivo",
    axis: "Incluir para Evoluir",
    institution: "Associação Amor Inclusivo",
    advisor: "Profª. Drª. Ariane Diniz",
    description:
      "Projeto de extensão voltado ao apoio da Associação Amor Inclusivo, entidade que promove a inclusão educacional, profissional e social de pessoas com deficiência. A iniciativa desenvolve ações de arrecadação de tampinhas plásticas e lacres metálicos, aliadas à conscientização ambiental e ao incentivo à coleta seletiva em escolas e na comunidade.",
    image: amorInclusivoImg,
  },
  {
    title: "Sons da Mente",
    axis: "Reconstruindo Raízes",
    institution: "Indústrias de Sorocaba",
    advisor: "Profº. Esp. Gabriel Claro da Silva",
    coAdvisor: "Maestro Vitor Canassa",
    description:
      "Projeto que utiliza a música como ferramenta para o desenvolvimento de competências socioemocionais, promovendo saúde mental, bem-estar e integração comunitária. As atividades incluem oficinas, apresentações musicais e experiências colaborativas voltadas à formação humana e profissional.",
    image: coralImg,
  },
  {
    title: "Colmeia Smart",
    axis: "Sustentabilidade 360",
    institution: "Comunidade e parceiros do projeto",
    advisor: "Profº. Esp. Ederson Bonfim",
    description:
      "Iniciativa dedicada à preservação das abelhas do grupo Meliponas por meio do uso de tecnologias de monitoramento e análise de dados. O projeto une inovação, sustentabilidade e conscientização ambiental, contribuindo para a proteção dos polinizadores e dos ecossistemas brasileiros.",
    image: colmeiaImg,
  },
];

export default function ExtensionProjectsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="bg-white border border-border p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">
              Projetos de Extensão
            </h2>
            <p className="text-muted-foreground">
              Iniciativas que conectam tecnologia, cidadania e impacto social.
            </p>
          </div>

          <span className="text-xs font-mono text-primary tracking-wider">
            Endereço: Praça Roberto Mange, 30 - Santa Rosália - CEP: 18090-110 - Sorocaba/SP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="h-48 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h4 className="text-xl font-bold font-heading">{p.title}</h4>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Eixo:</strong> {p.axis}
                </p>
                <p>
                  <strong>Instituição parceira:</strong> {p.institution}
                </p>
                <p>
                  <strong>Docente orientador:</strong> {p.advisor}
                </p>
                {p.coAdvisor && (
                  <p>
                    <strong>Orientador convidado:</strong> {p.coAdvisor}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}