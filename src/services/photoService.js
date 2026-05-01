import { base44 } from "@/api/base44Client";

/**
 * PhotoService — operações relacionadas às fotos do evento.
 */
const PhotoService = {
  /** Lista todas as fotos (galeria pública) */
  listAll: () => base44.entities.EventPhoto.list("-created_date"),

  /** Lista fotos enviadas pelo usuário logado */
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.EventPhoto.filter({ created_by: user.email }, "-created_date");
  },

  /** Faz upload de uma foto e cria o registro */
  upload: async ({ file, caption, category }) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return base44.entities.EventPhoto.create({ photo_url: file_url, caption, category });
  },

  /** Exclui uma foto */
  delete: (id) => base44.entities.EventPhoto.delete(id),
};

export default PhotoService;