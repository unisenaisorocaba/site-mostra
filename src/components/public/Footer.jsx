import React from "react";
import { Link } from "react-router-dom";
import { Globe, Youtube, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3">
              Organização
            </span>
            <span className="text-xl font-bold uppercase tracking-tight font-heading">
              UniSENAI SP - Campus Sorocaba
            </span>
            <p className="mt-3 text-sm opacity-60">
              Formando os profissionais da Indústria 4.0
            </p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3">
              Links
            </span>
            <div className="space-y-2">
              <Link to="/" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Início
              </Link>
              <Link to="/projetos" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Projetos
              </Link>
              <Link to="/fotos" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Fotos do Evento
              </Link>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3">
              Redes Sociais
            </span>
            <div className="flex gap-4 mt-1">
              <Globe className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Youtube className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Users className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-background/10 text-center">
          <p className="text-xs opacity-40">
            © 2026 UniSENAI SP - Campus Sorocaba — I Mostra de Projetos Integradores. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}