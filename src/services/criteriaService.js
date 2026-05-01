import { base44 } from "@/api/base44Client";

/**
 * CriteriaService — operações relacionadas às listas de critérios de avaliação.
 */
const CriteriaService = {
  /** Lista as listas de critérios do professor logado */
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.CriteriaList.filter({ owner_email: user.email }, "name");
  },

  /** Cria uma nova lista de critérios */
  create: async (data) => {
    const user = await base44.auth.me();
    return base44.entities.CriteriaList.create({
      ...data,
      owner_email: user.email,
      criteria: data.criteria ?? [],
    });
  },

  /** Atualiza uma lista existente */
  update: (id, data) => base44.entities.CriteriaList.update(id, data),

  /** Exclui uma lista */
  delete: (id) => base44.entities.CriteriaList.delete(id),

  /** Adiciona um critério a uma lista existente */
  addCriteria: (list, criteria) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: [...(list.criteria || []), criteria],
    }),

  /** Remove um critério pelo índice */
  removeCriteria: (list, index) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: (list.criteria || []).filter((_, i) => i !== index),
    }),

  /** Atualiza um critério pelo índice */
  updateCriteria: (list, index, data) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: (list.criteria || []).map((c, i) => (i === index ? { ...c, ...data } : c)),
    }),
};

export default CriteriaService;