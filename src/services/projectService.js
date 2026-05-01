import { base44 } from "@/api/base44Client";

export const CATEGORY_LABELS = {
  mecatronica: "Mecatrônica",
  software: "Software",
  gestao: "Gestão",
  logistica: "Logística",
  energia: "Energia",
  quimica: "Química",
  automacao: "Automação",
  outros: "Outros",
};

export const CATEGORY_IMAGES = {
  mecatronica: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
  software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  gestao: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  logistica: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  energia: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
  quimica: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
  automacao: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  outros: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
};

/** Retorna a URL da imagem padrão para uma categoria */
export const getCategoryImage = (category, size = 1200) => {
  const url = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.outros;
  return url.replace("w=1200", `w=${size}`);
};

/**
 * ProjectService — todas as operações relacionadas a projetos.
 */
const ProjectService = {
  /** Lista projetos aprovados (limitado a 5, para destaque na home) */
  listFeatured: () =>
    base44.entities.Project.filter({ status: "aprovado" }, "-created_date", 5),

  /** Lista todos os projetos aprovados (galeria pública) */
  listApproved: () =>
    base44.entities.Project.filter({ status: "aprovado" }),

  /** Lista todos os projetos aprovados sem limite (galeria completa) */
  listApprovedAll: () =>
    base44.entities.Project.filter({ status: "aprovado" }, "-created_date", 100),

  /** Lista projetos que solicitaram apresentação oral */
  listOral: () =>
    base44.entities.Project.filter({ presentation_type: "oral" }, "-created_date", 100),

  /** Lista projetos criados pelo usuário logado */
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.Project.filter({ created_by: user.email }, "-created_date");
  },

  /** Busca um projeto pelo ID */
  getById: (id) =>
    base44.entities.Project.filter({ id }, null, 1).then((r) => r?.[0] ?? null),

  /** Cria um novo projeto */
  create: (data) => base44.entities.Project.create(data),

  /** Atualiza um projeto existente */
  update: (id, data) => base44.entities.Project.update(id, data),

  /** Exclui um projeto */
  delete: (id) => base44.entities.Project.delete(id),

  /** Submete um projeto para avaliação */
  submit: (id) => base44.entities.Project.update(id, { status: "submetido" }),

  /** Faz upload de um arquivo e atualiza o campo correspondente no projeto */
  uploadFile: async (projectId, field, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Project.update(projectId, { [field]: file_url });
    return file_url;
  },
};

export default ProjectService;