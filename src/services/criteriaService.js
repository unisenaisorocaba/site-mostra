import { mockBase44 as base44 } from "@/lib/mockClient";

const CriteriaService = {
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.CriteriaList.filter({ owner_email: user.email }, "name");
  },
  create: async (data) => {
    const user = await base44.auth.me();
    return base44.entities.CriteriaList.create({
      ...data,
      owner_email: user.email,
      criteria: data.criteria ?? [],
    });
  },
  update: (id, data) => base44.entities.CriteriaList.update(id, data),
  delete: (id) => base44.entities.CriteriaList.delete(id),
  addCriteria: (list, criteria) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: [...(list.criteria || []), criteria],
    }),
  removeCriteria: (list, index) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: (list.criteria || []).filter((_, i) => i !== index),
    }),
  updateCriteria: (list, index, data) =>
    base44.entities.CriteriaList.update(list.id, {
      criteria: (list.criteria || []).map((c, i) => (i === index ? { ...c, ...data } : c)),
    }),
};

export default CriteriaService;