import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PhotoService from "@/services/photoService";

export default function AboutSection() {
  const [selectedPhoto, setSelectedPhoto] = useState("https://unisenaissorocaba.s3.sa-east-1.amazonaws.com/gallery/1781788841344-WhatsApp%20Image%202026-06-18%20at%2009.58.05%20(16).jpeg");

  const { data: responseData } = useQuery({
    queryKey: ["about-section-photos"],
    queryFn: () => PhotoService.listAll({ page: 1, limit: 1000 }),
  });

  useEffect(() => {
    const photos = responseData?.data || [];
    if (photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * photos.length);
      setSelectedPhoto(photos[randomIndex].photo_url);
    }
  }, [responseData]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading border-l-8 border-primary pl-6 mb-6 leading-tight">
            O Projeto Integrador (PI)
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
            O Projeto Integrador é o pilar prático da formação na UniSENAI SP - Campus Sorocaba. Mais do que um trabalho
            acadêmico, é uma imersão técnica onde estudantes aplicam conhecimentos multidisciplinares
            para solucionar problemas críticos da indústria local.
          </p>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Desde a prototipagem rápida até a análise de viabilidade econômica, o PI prepara o futuro
            profissional para o dinamismo do mercado global, unindo teoria e prática em laboratórios
            de última geração.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="relative border border-border bg-white p-2">
            <img
              src={selectedPhoto}
              alt="Estudantes em laboratório"
              className="w-full h-[300px] md:h-[350px] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-primary text-white p-5 border-4 border-white">
              <span className="block text-3xl font-bold font-heading">2026</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Edição I</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}