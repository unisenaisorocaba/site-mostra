import { base44 } from "@/api/base44Client";

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