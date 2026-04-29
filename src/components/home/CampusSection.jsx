import React from "react";

const facilities = [
  {
    title: "Biblioteca Técnica",
    description: "Acervo especializado com mais de 15 mil títulos em engenharia e gestão industrial.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80",
  },
  {
    title: "Centro de Usinagem",
    description: "Equipado com tecnologia CNC de última geração para desenvolvimento de protótipos reais.",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80",
  },
  {
    title: "Lab de Automação",
    description: "Espaço dedicado à robótica colaborativa, IoT e sistemas de controle industrial.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
  },
];

export default function CampusSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="bg-white border border-border p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">Campus Sorocaba</h2>
            <p className="text-muted-foreground">
              Infraestrutura de ponta focada em manufatura avançada.
            </p>
          </div>
          <span className="text-xs font-mono text-primary tracking-wider">
            COORDENADAS: -23.5015, -47.4521
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facilities.map((f, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="h-48 overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-xl font-bold font-heading">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}